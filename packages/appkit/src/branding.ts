import type {
  MobileBranding,
  AppFlowConfig,
  SurveyConfig,
  LegalDocument,
  SupportConfig,
  AppUpdateInfo,
  AppOnboardingConfig
} from './types';
import { HttpClient } from './http';

export class BrandingModule {
  constructor(private http: HttpClient) {}

  /** Fetch mobile branding and app configuration */
  async getMobileBranding(): Promise<MobileBranding> {
    const res = await this.http.get<{ branding: MobileBranding }>('/api/v1/mobile/branding');
    return res.branding || {};
  }

  /** Update mobile branding (Admin only) */
  async updateMobileBranding(branding: Partial<MobileBranding>): Promise<MobileBranding> {
    const res = await this.http.post<{ branding: MobileBranding }>('/api/v1/mobile/branding', { branding });
    return res.branding;
  }

  /** Get app flows */
  async getAppFlows(): Promise<AppFlowConfig[]> {
    const res = await this.http.get<{ flows: AppFlowConfig[] }>('/api/v1/mobile/flows');
    return res.flows || [];
  }

  /** Get surveys */
  async getSurveys(): Promise<SurveyConfig[]> {
    const res = await this.http.get<{ surveys: SurveyConfig[] }>('/api/v1/mobile/surveys');
    return res.surveys || [];
  }

  /** Get legal documents */
  async getLegalDocuments(): Promise<LegalDocument[]> {
    const res = await this.http.get<{ documents: LegalDocument[] }>('/api/v1/mobile/legal');
    return res.documents || [];
  }

  /** Get support configuration */
  async getSupportConfig(): Promise<SupportConfig> {
    const res = await this.http.get<{ support: SupportConfig }>('/api/v1/mobile/support');
    return res.support || {};
  }

  /** Check for app updates */
  async checkUpdates(version: string, platform: string): Promise<AppUpdateInfo | null> {
    return this.http.get<AppUpdateInfo | null>(`/api/v1/mobile/updates/check?version=${version}&platform=${platform}`);
  }

  /** Get onboarding configuration */
  async getOnboarding(): Promise<AppOnboardingConfig> {
    const res = await this.http.get<{ onboarding: AppOnboardingConfig }>('/api/v1/mobile/onboarding');
    return res.onboarding || { screens: [], enabled: false };
  }

  /** Get enabled SSO/OAuth providers for this app */
  async getSSOProviders(): Promise<{ id: string; name: string; type: string; icon?: string }[]> {
    const res = await this.http.get<{ providers: any[] }>('/api/v1/mobile/auth/providers');
    return res.providers || [];
  }
}
