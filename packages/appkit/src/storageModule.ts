import { HttpClient } from './http';

export class StorageModule {
  constructor(private http: HttpClient) {}

  /**
   * Get a public proxy URL for a file stored in AppKit.
   * This URL avoids direct MinIO access and handles CORS via the gateway.
   */
  getFileUrl(fileId: string): string {
    if (!fileId) return '';
    // If it's already a full URL, return it as is
    if (fileId.startsWith('http') || fileId.startsWith('blob:')) return fileId;
    
    const baseUrl = this.http.getBaseUrl();
    // Ensure we don't double up the /api/v1 if the gateway already provides it
    return `${baseUrl}/storage/proxy/${fileId}`;
  }
}
