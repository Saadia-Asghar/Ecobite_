import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';

// Server-side MSAL instance
let msalInstance: ConfidentialClientApplication | null = null;

/**
 * Get the MSAL config dynamically to ensure latest env vars are used
 */
function getMSALConfig() {
    const clientId = process.env.AZURE_AUTH_CLIENT_ID || process.env.AZURE_CLIENT_ID || '';
    const tenantId = process.env.AZURE_AUTH_TENANT_ID || '';
    const clientSecret = process.env.AZURE_AUTH_CLIENT_SECRET || process.env.AZURE_CLIENT_SECRET || '';
    const redirectUri = process.env.AZURE_REDIRECT_URI || `${(process.env.VITE_API_URL || 'http://localhost:3002').replace(/\/$/, '').replace(/\/api$/, '')}/api/auth/microsoft/callback`;

    // Authority: use tenant ID if provided, otherwise common
    const authority = tenantId
        ? `https://login.microsoftonline.com/${tenantId}`
        : (process.env.AZURE_AUTHORITY || 'https://login.microsoftonline.com/common');

    return {
        auth: {
            clientId,
            authority,
            clientSecret,
            redirectUri,
        },
        system: {
            loggerOptions: {
                loggerCallback: () => { },
                logLevel: 'Error' as any,
            }
        }
    };
}

/**
 * Initialize MSAL for server-side authentication
 */
export function initializeMSAL() {
    const config = getMSALConfig();

    if (!config.auth.clientId || !config.auth.clientSecret) {
        console.log('⚠️  Azure AD not configured. Microsoft sign-in will not work.');
        return false;
    }

    try {
        msalInstance = new ConfidentialClientApplication({
            auth: {
                clientId: config.auth.clientId,
                authority: config.auth.authority,
                clientSecret: config.auth.clientSecret,
            }
        });
        console.log('✅ Microsoft Authentication initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Microsoft Authentication:', error);
        return false;
    }
}

/**
 * Get the MSAL instance, initializing it if necessary
 */
function getMSALInstance(): ConfidentialClientApplication {
    if (!msalInstance) {
        const initialized = initializeMSAL();
        if (!initialized || !msalInstance) {
            throw new Error('Microsoft Authentication is not configured correctly. Please check your environment variables.');
        }
    }
    return msalInstance;
}

/**
 * Get authorization URL for Microsoft sign-in
 */
export async function getAuthUrl(): Promise<{ url: string; state: string }> {
    const instance = getMSALInstance();
    const config = getMSALConfig();

    const state = Math.random().toString(36).substring(7);
    const scopes = ['User.Read', 'email', 'profile', 'openid'];

    const authCodeUrlParameters = {
        scopes,
        redirectUri: config.auth.redirectUri,
        state,
    };

    const url = await instance.getAuthCodeUrl(authCodeUrlParameters);
    return { url, state };
}

/**
 * Exchange authorization code for tokens
 */
export async function acquireTokenByCode(code: string, _state: string): Promise<AuthenticationResult> {
    const instance = getMSALInstance();
    const config = getMSALConfig();

    const tokenRequest = {
        code,
        scopes: ['User.Read', 'email', 'profile', 'openid'],
        redirectUri: config.auth.redirectUri,
    };

    try {
        const response = await instance.acquireTokenByCode(tokenRequest);
        return response;
    } catch (error) {
        console.error('Error acquiring token:', error);
        throw error;
    }
}

/**
 * Get user info from Microsoft Graph
 */
export async function getUserInfo(accessToken: string): Promise<{
    id: string;
    email: string;
    name: string;
    picture?: string;
}> {
    try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user info from Microsoft Graph');
        }

        const user = await response.json();

        return {
            id: user.id,
            email: user.mail || user.userPrincipalName,
            name: user.displayName || user.givenName + ' ' + user.surname,
            picture: user.photo ? `https://graph.microsoft.com/v1.0/me/photo/$value` : undefined,
        };
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

/**
 * Check if Azure AD is configured
 */
export function isAzureADConfigured(): boolean {
    const config = getMSALConfig();
    return !!(config.auth.clientId && config.auth.clientSecret);
}

/**
 * Get client configuration for frontend
 */
export function getClientConfig() {
    const config = getMSALConfig();
    return {
        clientId: config.auth.clientId,
        authority: config.auth.authority,
        redirectUri: config.auth.redirectUri,
        isConfigured: isAzureADConfigured(),
    };
}

export default {
    initializeMSAL,
    getAuthUrl,
    acquireTokenByCode,
    getUserInfo,
    isAzureADConfigured,
    getClientConfig,
};
