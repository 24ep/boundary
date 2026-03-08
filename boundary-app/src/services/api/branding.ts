import { appkit } from './appkit';
import { 
  MobileBranding, 
  AppFlowConfig, 
  SurveyConfig, 
  LegalDocument, 
  SupportConfig, 
  AppUpdateInfo, 
  AppOnboardingConfig 
} from 'alphayard-appkit';

// Re-exporting for compatibility
export type { 
  MobileBranding, 
  AppFlowConfig, 
  SurveyConfig, 
  LegalDocument, 
  SupportConfig, 
  AppUpdateInfo, 
  AppOnboardingConfig 
};

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
  analytics: any;
  support: SupportConfig;
  features: FeatureFlag[];
}

export const brandingApi = {
  // Get mobile branding configuration
  getMobileBranding: async (): Promise<MobileBranding> => {
    return appkit.branding.getMobileBranding();
  },

  // Update mobile branding (admin)
  updateMobileBranding: async (branding: Partial<MobileBranding>): Promise<MobileBranding> => {
    return appkit.branding.updateMobileBranding(branding);
  },

  // Get app flows
  getAppFlows: async (): Promise<AppFlowConfig[]> => {
    return appkit.branding.getAppFlows();
  },

  // Get surveys
  getSurveys: async (): Promise<SurveyConfig[]> => {
    return appkit.branding.getSurveys();
  },

  // Get legal documents
  getLegalDocuments: async (): Promise<LegalDocument[]> => {
    return appkit.branding.getLegalDocuments();
  },

  // Get support info
  getSupportConfig: async (): Promise<SupportConfig> => {
    return appkit.branding.getSupportConfig();
  },

  // Check for app updates
  checkUpdates: async (version: string, platform: string): Promise<AppUpdateInfo | null> => {
    return appkit.branding.checkUpdates(version, platform);
  },

  // Get onboarding configuration
  getOnboarding: async (): Promise<AppOnboardingConfig> => {
    return appkit.branding.getOnboarding();
  }
};

// Also keep fetchMobileBranding for backward compatibility if used elsewhere
export async function fetchMobileBranding(): Promise<MobileBranding> {
  return brandingApi.getMobileBranding();
}

export default brandingApi;
