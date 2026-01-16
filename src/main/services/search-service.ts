import type { SearchResult } from './ai-types'

export interface SearchConfig {
  provider: 'mock' | 'tavily'
  apiKey?: string
}

export class SearchService {
  async search(query: string, config: SearchConfig): Promise<SearchResult[]> {
    console.log('[SearchService] Searching for:', query, 'Provider:', config.provider)
    if (config.provider === 'tavily' && config.apiKey) {
      return this.searchTavily(query, config.apiKey)
    }
    // Default / Mock
    return this.searchMock(query)
  }

  private async searchMock(query: string): Promise<SearchResult[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [
      {
        title: `Mock Search Result for "${query}"`,
        content: `This is a simulated search result containing technical specifications for ${query}. In a real scenario, this would come from the web. It includes details like power consumption, resolution, and dimensions relevant to the user's request.`,
        url: 'http://localhost/mock'
      },
      {
        title: `Competitor Analysis: ${query}`,
        content: `Simulated competitor data for ${query}. Shows market positioning and alternative options.`,
        url: 'http://localhost/mock/competitors'
      }
    ]
  }

  private async searchTavily(query: string, apiKey: string): Promise<SearchResult[]> {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, query, max_results: 3 })
      })
      const data = (await response.json()) as any
      return (data.results || []).map((r: any) => ({ title: r.title, content: r.content, url: r.url }))
    } catch (e) {
      console.error('Search API Error:', e)
      return []
    }
  }
}