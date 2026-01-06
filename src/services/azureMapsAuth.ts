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
            console.log('✅ Azure Maps token acquired silently');
            return response.accessToken;
        } catch (silentError: any) {
            console.log('Silent token acquisition failed, trying interactive:', silentError);
            
            // Check if it's a popup blocked error or requires interaction
            const requiresInteraction = 
                silentError.errorCode === 'interaction_required' ||
                silentError.errorCode === 'consent_required' ||
                silentError.errorCode === 'login_required' ||
                !account;
            
            if (requiresInteraction) {
                // Try popup first (better UX)
                try {
                    if (account) {
                        response = await msal.acquireTokenPopup({
                            ...silentRequest,
                            account: account,
                            prompt: 'select_account'
                        });
                    } else {
                        response = await msal.acquireTokenPopup({
                            scopes: [AZURE_MAPS_SCOPE],
                            prompt: 'select_account'
                        });
                    }
                    console.log('✅ Azure Maps token acquired via popup');
                    return response.accessToken;
                } catch (popupError: any) {
                    // If popup fails (blocked or other issues), fall back to redirect
                    console.log('Popup failed, trying redirect:', popupError);
                    
                    // Use redirect for interactive login (more reliable)
                    const redirectRequest = {
                        scopes: [AZURE_MAPS_SCOPE],
                        account: account || undefined,
                        prompt: 'select_account'
                    };
                    
                    // Store the redirect destination so we can return after auth
                    sessionStorage.setItem('azureMapsAuthRedirect', window.location.href);
                    
                    // Redirect to login
                    await msal.acquireTokenRedirect(redirectRequest);
                    
                    // This won't return if redirect succeeds (user will be redirected)
                    throw new Error('Redirecting to login...');
                }
            } else {
                // Other error, throw it
                throw silentError;
            }
        }
    } catch (error: any) {
        // Don't throw if it's a redirect (that's expected)
        if (error.message === 'Redirecting to login...') {
            throw error;
        }
        
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
        
        // Handle redirect promise (if user was redirected for authentication)
        msal.handleRedirectPromise()
            .then((response) => {
                if (response) {
                    console.log('✅ MSAL redirect handled successfully');
                    console.log('Azure Maps token acquired via redirect');
                    
                    // Get the original redirect destination
                    const redirectUrl = sessionStorage.getItem('azureMapsAuthRedirect');
                    if (redirectUrl) {
                        sessionStorage.removeItem('azureMapsAuthRedirect');
                        // Token is now available in cache, page can continue
                    }
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

/**
 * Check if we're returning from a redirect authentication
 */
export function isReturningFromRedirect(): boolean {
    return !!sessionStorage.getItem('azureMapsAuthRedirect');
}

