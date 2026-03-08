import apiClient from './apiClient';
import { api } from './index';
import { appkit } from './appkit';
import { MobileBranding as SDKMobileBranding } from 'alphayard-appkit';

export interface MobileBranding {
  mobileAppName?: string;
  mobileAppDescription?: string;
  mobileAppLogo?: string;
  mobileAppPrimaryColor?: string;
  mobileAppSecondaryColor?: string;
  mobileAppAccentColor?: string;
  mobileAppBackgroundColor?: string;
  mobileAppTextColor?: string;
  mobileAppFontFamily?: string;
  mobileAppFontSize?: number;
  mobileAppFontWeight?: string;
  mobileAppBorderRadius?: number;
  mobileAppShadowColor?: string;
  mobileAppShadowOffset?: { width: number; height: number };
  mobileAppShadowOpacity?: number;
  mobileAppShadowRadius?: number;
  mobileAppElevation?: number;
  mobileAppGradientColors?: string[];
  mobileAppGradientStart?: { x: number; y: number };
  mobileAppGradientEnd?: { x: number; y: number };
  mobileAppIsDarkMode?: boolean;
}

export interface AppFlowConfig {
  id: string;
  name: string;
  steps: AppFlowStep[];
  isDefault?: boolean;
}

export interface AppFlowStep {
  id: string;
  type: 'screen' | 'action' | 'condition';
  target: string;
  params?: Record<string, any>;
}

export interface SurveyConfig {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  isMandatory?: boolean;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'text' | 'choice' | 'rating' | 'boolean';
  options?: string[];
  isRequired?: boolean;
}

export interface LegalDocument {
  id: string;
  title: string;
  content: string;
  version: string;
  type: 'terms' | 'privacy' | 'eula' | 'cookies';
  updatedAt: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  providers: string[];
  debugMode?: boolean;
  samplingRate?: number;
}

export interface SupportConfig {
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  helpCenterUrl?: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  isEnabled: boolean;
  description?: string;
}

export interface AppConfig {
  branding: MobileBranding;
  flows: AppFlowConfig[];
  surveys: SurveyConfig[];
  legal: LegalDocument[];
  analytics: AnalyticsConfig;
  support: SupportConfig;
  features: FeatureFlag[];
}

export interface BrandingResponse {
  branding: MobileBranding;
}

export interface AppUpdateInfo {
  version: string;
  buildNumber: number;
  isMandatory: boolean;
  releaseNotes?: string;
  downloadUrl?: string;
}

export interface AppOnboardingConfig {
  screens: OnboardingScreen[];
  enabled: boolean;
}

export interface OnboardingScreen {
  id: string;
  title: string;
  description: string;
  image?: string;
  video?: string;
}

export const brandingApi = {
  // Get mobile branding configuration
  getMobileBranding: async (): Promise<MobileBranding> => {
    try {
      const branding = await appkit.branding.getMobileBranding();
      return branding as MobileBranding;
    } catch (error) {
      console.error('SDK getMobileBranding error:', error);
      const response = await api.get('/mobile/branding');
      return response.data.branding || {};
    }
  },

  // Update mobile branding (admin)
  updateMobileBranding: async (branding: Partial<MobileBranding>): Promise<MobileBranding> => {
    try {
      const result = await appkit.branding.updateMobileBranding(branding as any);
      return result as MobileBranding;
    } catch (error) {
      console.error('SDK updateMobileBranding error:', error);
      const response = await api.post('/mobile/branding', { branding });
      return response.data.branding;
    }
  },

  // Get app flows
  getAppFlows: async (): Promise<AppFlowConfig[]> => {
    const response = await api.get('/mobile/flows');
    return response.data.flows || [];
  },

  // Get surveys
  getSurveys: async (): Promise<SurveyConfig[]> => {
    const response = await api.get('/mobile/surveys');
    return response.data.surveys || [];
  },

  // Get legal documents
  getLegalDocuments: async (): Promise<LegalDocument[]> => {
    const response = await api.get('/mobile/legal');
    return response.data.documents || [];
  },

  // Get support info
  getSupportConfig: async (): Promise<SupportConfig> => {
    const response = await api.get('/mobile/support');
    return response.data.support || {};
  },

  // Check for app updates
  checkUpdates: async (version: string, platform: string): Promise<AppUpdateInfo | null> => {
    const response = await api.get('/mobile/updates/check', { params: { version, platform } });
    return response.data.update || null;
  },

  // Get onboarding configuration
  getOnboarding: async (): Promise<AppOnboardingConfig> => {
    const response = await api.get('/mobile/onboarding');
    return response.data.onboarding || { screens: [], enabled: false };
  }
};

// Also keep fetchMobileBranding for backward compatibility if used elsewhere
export async function fetchMobileBranding(): Promise<MobileBranding> {
  return brandingApi.getMobileBranding();
}

export default brandingApi;
