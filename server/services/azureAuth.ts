import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';

// Microsoft Authentication Configuration
const msalConfig = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID || '',
        authority: process.env.AZURE_AUTHORITY || 'https://login.microsoftonline.com/common',
        clientSecret: process.env.AZURE_CLIENT_SECRET || '',
        redirectUri: process.env.AZURE_REDIRECT_URI || 'http://localhost:5173/auth/callback',
    },
    system: {
        loggerOptions: {
            loggerCallback: () => {},
            logLevel: 'Error',
        }
    }
};

// Server-side MSAL instance
let msalInstance: ConfidentialClientApplication | null = null;

/**
 * Initialize MSAL for server-side authentication
 */
export function initializeMSAL() {
    if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET) {
        console.log('⚠️  Azure AD not configured. Microsoft sign-in will not work.');
        return false;
    }

    try {
        msalInstance = new ConfidentialClientApplication({
            auth: {
                clientId: msalConfig.auth.clientId,
                authority: msalConfig.auth.authority,
                clientSecret: msalConfig.auth.clientSecret,
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
 * Get authorization URL for Microsoft sign-in
 */
export async function getAuthUrl(): Promise<{ url: string; state: string }> {
    if (!msalInstance) {
        throw new Error('MSAL not initialized. Configure AZURE_CLIENT_ID and AZURE_CLIENT_SECRET.');
    }

    const state = Math.random().toString(36).substring(7);
    const scopes = ['User.Read', 'email', 'profile', 'openid'];

    const authCodeUrlParameters = {
        scopes,
        redirectUri: msalConfig.auth.redirectUri,
        state,
    };

    const url = await msalInstance.getAuthCodeUrl(authCodeUrlParameters);
    return { url, state };
}

/**
 * Exchange authorization code for tokens
 */
export async function acquireTokenByCode(code: string, _state: string): Promise<AuthenticationResult> {
    if (!msalInstance) {
        throw new Error('MSAL not initialized');
    }

    const tokenRequest = {
        code,
        scopes: ['User.Read', 'email', 'profile', 'openid'],
        redirectUri: msalConfig.auth.redirectUri,
    };

    try {
        const response = await msalInstance.acquireTokenByCode(tokenRequest);
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
    return !!(
        process.env.AZURE_CLIENT_ID &&
        process.env.AZURE_CLIENT_SECRET
    );
}

/**
 * Get client configuration for frontend
 */
export function getClientConfig() {
    return {
        clientId: process.env.AZURE_CLIENT_ID || '',
        authority: process.env.AZURE_AUTHORITY || 'https://login.microsoftonline.com/common',
        redirectUri: process.env.AZURE_REDIRECT_URI || 'http://localhost:5173/auth/callback',
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

