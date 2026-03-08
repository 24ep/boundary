// Legal Content API Service for Mobile
import { appkit } from './appkit';
import type { 
  LegalDocument, 
  UserAcceptance, 
  DeveloperDoc,
  LegalSection
} from 'alphayard-appkit';

// Re-export types for compatibility
export type { LegalDocument, UserAcceptance, DeveloperDoc, LegalSection };

// =====================================================
// PUBLIC LEGAL DOCUMENTS
// =====================================================

/**
 * Get all published legal documents
 */
export async function getPublishedDocuments(): Promise<LegalDocument[]> {
  return appkit.legal.getPublishedDocuments();
}

/**
 * Get a specific legal document by slug
 */
export async function getDocumentBySlug(slug: string): Promise<LegalDocument> {
  return appkit.legal.getDocumentBySlug(slug);
}

/**
 * Get Terms of Service
 */
export async function getTermsOfService(): Promise<LegalDocument> {
  return appkit.legal.getTermsOfService();
}

/**
 * Get Privacy Policy
 */
export async function getPrivacyPolicy(): Promise<LegalDocument> {
  return appkit.legal.getPrivacyPolicy();
}

/**
 * Get Community Guidelines
 */
export async function getCommunityGuidelines(): Promise<LegalDocument> {
  return appkit.legal.getCommunityGuidelines();
}

// =====================================================
// USER ACCEPTANCES
// =====================================================

/**
 * Get user's current document acceptances
 */
export async function getUserAcceptances(): Promise<UserAcceptance[]> {
  return appkit.legal.getUserAcceptances();
}

/**
 * Accept a legal document
 */
export async function acceptDocument(documentId: string): Promise<void> {
  return appkit.legal.acceptDocument(documentId);
}

/**
 * Get pending documents that require user acceptance
 */
export async function getPendingAcceptances(): Promise<LegalDocument[]> {
  return appkit.legal.getPendingAcceptances();
}

/**
 * Check if user has accepted a specific document type
 */
export async function checkAcceptance(type: string): Promise<{ accepted: boolean; acceptance?: UserAcceptance }> {
  return appkit.legal.checkAcceptance(type);
}

// =====================================================
// DEVELOPER DOCUMENTATION
// =====================================================

/**
 * Get all published developer docs
 */
export async function getDeveloperDocs(category?: string): Promise<DeveloperDoc[]> {
  return appkit.legal.getDeveloperDocs(category);
}

/**
 * Get a specific developer doc by slug
 */
export async function getDeveloperDocBySlug(slug: string): Promise<DeveloperDoc> {
  return appkit.legal.getDeveloperDocBySlug(slug);
}

/**
 * Submit feedback on a developer doc
 */
export async function submitDocFeedback(
  documentId: string,
  helpful: boolean,
  comment?: string
): Promise<void> {
  return appkit.legal.submitDocFeedback(documentId, helpful, comment);
}

// Export all functions
export const legalApi = {
  // Public documents
  getPublishedDocuments,
  getDocumentBySlug,
  getTermsOfService,
  getPrivacyPolicy,
  getCommunityGuidelines,
  
  // User acceptances
  getUserAcceptances,
  acceptDocument,
  getPendingAcceptances,
  checkAcceptance,
  
  // Developer docs
  getDeveloperDocs,
  getDeveloperDocBySlug,
  submitDocFeedback,
};

export default legalApi;
