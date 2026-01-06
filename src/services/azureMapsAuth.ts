import { PublicClientApplication, AuthenticationResult, AccountInfo, SilentRequest } from '@azure/msal-browser';

/**
 * Azure Maps authentication using Azure AD
 * Gets access token for Azure Maps API
 */

// MSAL configuration
const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID || import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
        authority: import.meta.env.VITE_AZURE_AUTHORITY || 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false
    }
};

// Initialize MSAL instance
let msalInstance: PublicClientApplication | null = null;

function getMSALInstance(): PublicClientApplication {
    if (!msalInstance) {
        const clientId = msalConfig.auth.clientId;
        if (!clientId) {
            throw new Error('Azure AD Client ID is not configured. Please set VITE_AZURE_CLIENT_ID or VITE_MICROSOFT_CLIENT_ID');
        }
        msalInstance = new PublicClientApplication(msalConfig);
    }
    return msalInstance;
}

// Azure Maps API scope
const AZURE_MAPS_SCOPE = 'https://atlas.microsoft.com/.default';

/**
 * Get access token for Azure Maps
 * Uses silent token acquisition if possible, otherwise prompts for login
 */
export async function getAzureMapsToken(): Promise<string> {
    try {
        const msal = getMSALInstance();
        
        // Initialize MSAL if not already done
        await msal.initialize();
        
        // Get all accounts
        const accounts = msal.getAllAccounts();
        
        let account: AccountInfo | null = null;
        
        if (accounts.length > 0) {
            // Use the first available account
            account = accounts[0];
        } else {
            // Try to get account from cache
            const cachedAccounts = msal.getAllAccounts();
            if (cachedAccounts.length > 0) {
                account = cachedAccounts[0];
            }
        }
        
        // Silent token request
        const silentRequest: SilentRequest = {
            scopes: [AZURE_MAPS_SCOPE],
            account: account || undefined,
            forceRefresh: false
        };
        
        let response: AuthenticationResult;
        
        try {
            // Try silent token acquisition first
            response = await msal.acquireTokenSilent(silentRequest);
            return response.accessToken;
        } catch (silentError: any) {
            console.log('Silent token acquisition failed, trying interactive:', silentError);
            
            // If silent fails, try interactive login
            if (account) {
                // Account exists but token expired, try with account
                response = await msal.acquireTokenPopup({
                    ...silentRequest,
                    account: account
                });
            } else {
                // No account, do interactive login
                response = await msal.acquireTokenPopup({
                    scopes: [AZURE_MAPS_SCOPE],
                    prompt: 'select_account'
                });
            }
            
            return response.accessToken;
        }
    } catch (error: any) {
        console.error('Error getting Azure Maps token:', error);
        throw new Error(`Failed to get Azure Maps token: ${error.message || 'Unknown error'}`);
    }
}

/**
 * Check if Azure AD is configured
 */
export function isAzureADConfigured(): boolean {
    const clientId = import.meta.env.VITE_AZURE_CLIENT_ID || import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
    return clientId.trim() !== '';
}

/**
 * Initialize MSAL and handle redirect if needed
 */
export async function initializeMSAL(): Promise<void> {
    try {
        const msal = getMSALInstance();
        await msal.initialize();
        
        // Handle redirect promise
        msal.handleRedirectPromise()
            .then((response) => {
                if (response) {
                    console.log('MSAL redirect handled successfully');
                }
            })
            .catch((error) => {
                console.error('MSAL redirect error:', error);
            });
    } catch (error: any) {
        console.error('Failed to initialize MSAL:', error);
        throw error;
    }
}

