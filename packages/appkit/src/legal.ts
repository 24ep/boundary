import { HttpClient } from './http';
import { 
  LegalDocument, 
  UserAcceptance, 
  DeveloperDoc 
} from './types';

export class LegalModule {
  constructor(private http: HttpClient) {}

  /** Get all published legal documents */
  async getPublishedDocuments(): Promise<LegalDocument[]> {
    const res = await this.http.get<{ documents: LegalDocument[] }>('/api/v1/legal/documents');
    return res.documents || [];
  }

  /** Get a specific legal document by slug */
  async getDocumentBySlug(slug: string): Promise<LegalDocument> {
    const res = await this.http.get<{ document: LegalDocument }>(`/api/v1/legal/documents/${slug}`);
    return res.document;
  }

  /** Get Terms of Service */
  async getTermsOfService(): Promise<LegalDocument> {
    const res = await this.http.get<{ document: LegalDocument }>('/api/v1/legal/terms');
    return res.document;
  }

  /** Get Privacy Policy */
  async getPrivacyPolicy(): Promise<LegalDocument> {
    const res = await this.http.get<{ document: LegalDocument }>('/api/v1/legal/privacy');
    return res.document;
  }

  /** Get Community Guidelines */
  async getCommunityGuidelines(): Promise<LegalDocument> {
    const res = await this.http.get<{ document: LegalDocument }>('/api/v1/legal/community-guidelines');
    return res.document;
  }

  /** Get user's current document acceptances */
  async getUserAcceptances(): Promise<UserAcceptance[]> {
    const res = await this.http.get<{ acceptances: UserAcceptance[] }>('/api/v1/legal/acceptances');
    return res.acceptances || [];
  }

  /** Accept a legal document */
  async acceptDocument(documentId: string): Promise<void> {
    await this.http.post('/api/v1/legal/accept', { documentId });
  }

  /** Get pending documents that require user acceptance */
  async getPendingAcceptances(): Promise<LegalDocument[]> {
    const res = await this.http.get<{ documents: LegalDocument[] }>('/api/v1/legal/pending');
    return res.documents || [];
  }

  /** Check if user has accepted a specific document type */
  async checkAcceptance(type: string): Promise<{ accepted: boolean; acceptance?: UserAcceptance }> {
    return this.http.get<{ accepted: boolean; acceptance?: UserAcceptance }>(`/api/v1/legal/check/${type}`);
  }

  /** Get all published developer docs */
  async getDeveloperDocs(category?: string): Promise<DeveloperDoc[]> {
    const path = category ? `/api/v1/legal/developer-docs?category=${category}` : '/api/v1/legal/developer-docs';
    const res = await this.http.get<{ documents: DeveloperDoc[] }>(path);
    return res.documents || [];
  }

  /** Get a specific developer doc by slug */
  async getDeveloperDocBySlug(slug: string): Promise<DeveloperDoc> {
    const res = await this.http.get<{ document: DeveloperDoc }>(`/api/v1/legal/developer-docs/${slug}`);
    return res.document;
  }

  /** Submit feedback on a developer doc */
  async submitDocFeedback(
    documentId: string,
    helpful: boolean,
    comment?: string
  ): Promise<void> {
    await this.http.post(`/api/v1/legal/developer-docs/${documentId}/feedback`, {
      helpful,
      comment,
    });
  }
}
