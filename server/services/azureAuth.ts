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

    // Authority: use tenant ID if provided, otherwise common
    const authority = tenantId
        ? `https://login.microsoftonline.com/${tenantId}`
        : (process.env.AZURE_AUTHORITY || 'https://login.microsoftonline.com/common');

    return {
        auth: {
            clientId,
            authority,
            clientSecret,
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
            },
            system: config.system
        });
        console.log('✅ Microsoft Authentication initialized');
        return true;
    } catch (error: any) {
        console.error('❌ Failed to initialize Microsoft Authentication:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        msalInstance = null;
        return false;
    }
}

/**
 * Get the MSAL instance, initializing it if necessary
 */
function getMSALInstance(): ConfidentialClientApplication {
    // In serverless functions, always try to initialize if not present
    if (!msalInstance) {
        const initialized = initializeMSAL();
        if (!initialized || !msalInstance) {
            const config = getMSALConfig();
            throw new Error(
                `Microsoft Authentication is not configured correctly. ` +
                `Client ID: ${config.auth.clientId ? 'set' : 'missing'}, ` +
                `Client Secret: ${config.auth.clientSecret ? 'set' : 'missing'}. ` +
                `Please check your AZURE_CLIENT_ID and AZURE_CLIENT_SECRET environment variables.`
            );
        }
    }
    return msalInstance;
}

/**
 * Get authorization URL for Microsoft sign-in
 */
export async function getAuthUrl(redirectUri?: string): Promise<{ url: string; state: string }> {
    try {
        // Check configuration first
        if (!isAzureADConfigured()) {
            throw new Error('Microsoft Authentication is not configured. Please set AZURE_CLIENT_ID and AZURE_CLIENT_SECRET environment variables.');
        }

        const instance = getMSALInstance();

        const state = Math.random().toString(36).substring(7);
        const scopes = ['User.Read', 'email', 'profile', 'openid'];

        // Use provided redirectUri or fallback to environment variable
        const finalRedirectUri = redirectUri || 
            process.env.AZURE_REDIRECT_URI || 
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/auth/microsoft/callback` : 'http://localhost:3002/api/auth/microsoft/callback');

        if (!finalRedirectUri) {
            throw new Error('Redirect URI is required for Microsoft authentication');
        }

        const authCodeUrlParameters = {
            scopes,
            redirectUri: finalRedirectUri,
            state,
        };

        try {
            const url = await instance.getAuthCodeUrl(authCodeUrlParameters);
            return { url, state };
        } catch (error: any) {
            console.error('Error generating auth URL (MSAL):', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack,
                redirectUri: finalRedirectUri
            });
            throw new Error(`Failed to generate Microsoft authentication URL: ${error.message || error.errorCode || 'Unknown error'}`);
        }
    } catch (error: any) {
        console.error('Error in getAuthUrl:', error);
        throw error;
    }
}

/**
 * Exchange authorization code for tokens
 */
export async function acquireTokenByCode(code: string, _state: string, redirectUri?: string): Promise<AuthenticationResult> {
    const instance = getMSALInstance();

    // Use provided redirectUri or fallback to environment variable
    const finalRedirectUri = redirectUri || 
        process.env.AZURE_REDIRECT_URI || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/auth/microsoft/callback` : 'http://localhost:3002/api/auth/microsoft/callback');

    const tokenRequest = {
        code,
        scopes: ['User.Read', 'email', 'profile', 'openid'],
        redirectUri: finalRedirectUri,
    };

    try {
        const response = await instance.acquireTokenByCode(tokenRequest);
        return response;
    } catch (error: any) {
        console.error('Error acquiring token:', error);
        throw new Error(`Failed to acquire token: ${error.message || 'Unknown error'}`);
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
    const redirectUri = process.env.AZURE_REDIRECT_URI || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/auth/microsoft/callback` : 'http://localhost:3002/api/auth/microsoft/callback');
    
    return {
        clientId: config.auth.clientId,
        authority: config.auth.authority,
        redirectUri,
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
