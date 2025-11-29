// Mock content service for when Supabase is not available
interface ContentPage {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  components: any[];
  mobile_display: any;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

class MockContentService {
  private contentPages: ContentPage[] = [];
  private nextId = 1;

  async createPage(pageData: Omit<ContentPage, 'id' | 'created_at' | 'updated_at'>): Promise<ContentPage> {
    const now = new Date().toISOString();
    const page: ContentPage = {
      id: `mock-${this.nextId++}`,
      ...pageData,
      created_at: now,
      updated_at: now
    };
    
    this.contentPages.push(page);
    return page;
  }

  async getPages(filters?: {
    type?: string;
    status?: string;
    page?: number;
    page_size?: number;
    search?: string;
  }): Promise<ContentPage[]> {
    let filteredPages = [...this.contentPages];

    if (filters?.type && filters.type !== 'all') {
      filteredPages = filteredPages.filter(p => p.type === filters.type);
    }

    if (filters?.status && filters.status !== 'all') {
      filteredPages = filteredPages.filter(p => p.status === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredPages = filteredPages.filter(p => 
        p.title.toLowerCase().includes(searchLower) || 
        p.slug.toLowerCase().includes(searchLower)
      );
    }

    // Sort by updated_at descending
    filteredPages.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    // Apply pagination
    if (filters?.page && filters?.page_size) {
      const from = (filters.page - 1) * filters.page_size;
      const to = from + filters.page_size;
      filteredPages = filteredPages.slice(from, to);
    }

    return filteredPages;
  }

  async getPageById(id: string): Promise<ContentPage | null> {
    return this.contentPages.find(p => p.id === id) || null;
  }

  async updatePage(id: string, updates: Partial<ContentPage>): Promise<ContentPage | null> {
    const index = this.contentPages.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.contentPages[index] = {
      ...this.contentPages[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.contentPages[index];
  }

  async deletePage(id: string): Promise<boolean> {
    const index = this.contentPages.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.contentPages.splice(index, 1);
    return true;
  }
}

export const mockContentService = new MockContentService();
