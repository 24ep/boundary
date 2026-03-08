import type { MobileBranding } from './types';
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
}
