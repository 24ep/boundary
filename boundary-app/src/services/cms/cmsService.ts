import { appkit } from '../api/appkit';

/**
 * CMS Service for Strapi Integration
 * Handles all content management operations using the AppKit SDK transport.
 */

export interface CMSPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export interface CMSArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  cover?: {
    url: string;
    alternativeText?: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  author?: {
    name: string;
    email: string;
  };
}

export interface CMSCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface CMSMedia {
  id: number;
  url: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  mime?: string;
  size?: number;
}

export interface CMSMenu {
  id: number;
  title: string;
  slug: string;
  items: CMSMenuItem[];
}

export interface CMSMenuItem {
  id: number;
  title: string;
  url: string;
  target?: '_self' | '_blank';
  children?: CMSMenuItem[];
}

class CMSService {
  private baseURL: string;

  constructor() {
    // Get CMS URL from config or environment
    this.baseURL = process.env.EXPO_PUBLIC_CMS_URL || 'http://localhost:1337';
  }

  private async call<T = any>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, data?: any): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    return appkit.call<T>(method as any, url, data);
  }

  /**
   * Get all pages
   */
  async getPages(locale?: string): Promise<CMSPage[]> {
    try {
      let path = '/api/pages?publicationState=live&pagination[limit]=100';
      if (locale) path += `&locale=${locale}`;

      const response = await this.call('GET', path);
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching pages:', error);
      throw new Error(`Failed to fetch pages: ${error.message}`);
    }
  }

  /**
   * Get a single page by slug
   */
  async getPageBySlug(slug: string, locale?: string): Promise<CMSPage | null> {
    try {
      let path = `/api/pages?filters[slug][$eq]=${slug}&publicationState=live`;
      if (locale) path += `&locale=${locale}`;

      const response = await this.call('GET', path);
      const pages = response.data || [];
      return pages.length > 0 ? pages[0] : null;
    } catch (error: any) {
      console.error('Error fetching page:', error);
      throw new Error(`Failed to fetch page: ${error.message}`);
    }
  }

  /**
   * Get all articles
   */
  async getArticles(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    locale?: string;
  }): Promise<{ data: CMSArticle[]; meta: any }> {
    try {
      let path = `/api/articles?publicationState=live&pagination[page]=${params?.page || 1}&pagination[pageSize]=${params?.pageSize || 10}&sort=publishedAt:desc&populate=*`;

      if (params?.category) {
        path += `&filters[category][slug][$eq]=${params.category}`;
      }

      if (params?.locale) {
        path += `&locale=${params.locale}`;
      }

      const response = await this.call('GET', path);
      return {
        data: response.data || [],
        meta: response.meta || {},
      };
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }
  }

  /**
   * Get a single article by slug
   */
  async getArticleBySlug(slug: string, locale?: string): Promise<CMSArticle | null> {
    try {
      let path = `/api/articles?filters[slug][$eq]=${slug}&publicationState=live&populate=*`;
      if (locale) path += `&locale=${locale}`;

      const response = await this.call('GET', path);
      const articles = response.data || [];
      return articles.length > 0 ? articles[0] : null;
    } catch (error: any) {
      console.error('Error fetching article:', error);
      throw new Error(`Failed to fetch article: ${error.message}`);
    }
  }

  /**
   * Get all categories
   */
  async getCategories(locale?: string): Promise<CMSCategory[]> {
    try {
      let path = '/api/categories';
      if (locale) path += `?locale=${locale}`;

      const response = await this.call('GET', path);
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  /**
   * Get menu by slug
   */
  async getMenu(slug: string, locale?: string): Promise<CMSMenu | null> {
    try {
      let path = `/api/menus?filters[slug][$eq]=${slug}&populate=deep`;
      if (locale) path += `&locale=${locale}`;

      const response = await this.call('GET', path);
      const menus = response.data || [];
      return menus.length > 0 ? menus[0] : null;
    } catch (error: any) {
      console.error('Error fetching menu:', error);
      throw new Error(`Failed to fetch menu: ${error.message}`);
    }
  }

  /**
   * Get media by ID
   */
  async getMedia(id: number): Promise<CMSMedia | null> {
    try {
      const response = await this.call('GET', `/api/upload/files/${id}`);
      return response || null;
    } catch (error: any) {
      console.error('Error fetching media:', error);
      return null;
    }
  }

  /**
   * Get full media URL (handles relative URLs)
   */
  getMediaUrl(url: string | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${this.baseURL}${url}`;
  }

  /**
   * Search content
   */
  async search(query: string, contentType?: 'articles' | 'pages', locale?: string): Promise<any[]> {
    try {
      const endpoint = contentType === 'pages' ? '/api/pages' : '/api/articles';
      let path = `${endpoint}?publicationState=live&filters[$or][0][title][$containsi]=${encodeURIComponent(query)}&filters[$or][1][content][$containsi]=${encodeURIComponent(query)}`;

      if (locale) {
        path += `&locale=${locale}`;
      }

      const response = await this.call('GET', path);
      return response.data || [];
    } catch (error: any) {
      console.error('Error searching content:', error);
      throw new Error(`Failed to search content: ${error.message}`);
    }
  }
}

// Export singleton instance
export const cmsService = new CMSService();
export default cmsService;

