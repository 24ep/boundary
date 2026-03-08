import { AppKit } from 'alphayard-appkit';
import { API_CONFIG } from '../../constants/app';

// Initialize AppKit SDK
// In a real production app, these values would come from environment variables
export const appkit = new AppKit({
  clientId: 'boundary-mobile-app',
  domain: API_CONFIG.BASE_URL.replace('/v1', ''), // Assuming domain is the base without /v1
  storage: 'localStorage',
});

export default appkit;
