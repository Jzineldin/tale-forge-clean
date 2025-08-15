/**
 * XML Sitemap Generator
 * Generates dynamic sitemaps for better SEO
 */

import { supabase } from '@/integrations/supabase/client';
import { secureConsole as logger } from '@/utils/secureLogger';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface SitemapOptions {
  baseUrl?: string;
  includeStories?: boolean;
  includeGenres?: boolean;
  includeCharacters?: boolean;
  maxUrls?: number;
}

class SitemapGenerator {
  private baseUrl: string;
  private options: SitemapOptions;

  constructor(options: SitemapOptions = {}) {
    this.baseUrl = options.baseUrl || 'https://taleforge.app';
    this.options = {
      includeStories: true,
      includeGenres: true,
      includeCharacters: true,
      maxUrls: 50000,
      ...options,
    };
  }

  /**
   * Generate complete XML sitemap
   */
  async generateSitemap(): Promise<string> {
    try {
      const urls: SitemapUrl[] = [];

      // Add static pages
      urls.push(...this.getStaticPages());

      // Add dynamic content
      if (this.options.includeStories) {
        const storyUrls = await this.getStoryUrls();
        urls.push(...storyUrls);
      }

      if (this.options.includeGenres) {
        const genreUrls = await this.getGenreUrls();
        urls.push(...genreUrls);
      }

      if (this.options.includeCharacters) {
        const characterUrls = await this.getCharacterUrls();
        urls.push(...characterUrls);
      }

      // Limit URLs if specified
      const limitedUrls = urls.slice(0, this.options.maxUrls);

      return this.generateXML(limitedUrls);
    } catch (error) {
      logger.error('Failed to generate sitemap:', error);
      throw error;
    }
  }

  /**
   * Get static page URLs
   */
  private getStaticPages(): SitemapUrl[] {
    const now = new Date().toISOString();
    
    return [
      {
        loc: `${this.baseUrl}/`,
        lastmod: now,
        changefreq: 'daily',
        priority: 1.0,
      },
      {
        loc: `${this.baseUrl}/about`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${this.baseUrl}/discover`,
        lastmod: now,
        changefreq: 'daily',
        priority: 0.9,
      },
      {
        loc: `${this.baseUrl}/create`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.9,
      },
      {
        loc: `${this.baseUrl}/pricing`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${this.baseUrl}/learning`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.6,
      },
      {
        loc: `${this.baseUrl}/privacy`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.3,
      },
      {
        loc: `${this.baseUrl}/terms`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.3,
      },
    ];
  }

  /**
   * Get story URLs from database
   */
  private async getStoryUrls(): Promise<SitemapUrl[]> {
    try {
      const { data: stories, error } = await supabase
        .from('stories')
        .select('id, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1000);

      if (error) {
        logger.error('Failed to fetch stories for sitemap:', error);
        return [];
      }

      return stories?.map(story => ({
        loc: `${this.baseUrl}/story/${story.id}`,
        lastmod: story.updated_at,
        changefreq: 'weekly' as const,
        priority: 0.8,
      })) || [];
    } catch (error) {
      logger.error('Error fetching story URLs:', error);
      return [];
    }
  }

  /**
   * Get genre URLs - using predefined genres for now
   */
  private async getGenreUrls(): Promise<SitemapUrl[]> {
    try {
      // Use predefined genres since we don't have a genres table
      const predefinedGenres = [
        'Fantasy',
        'Science Fiction',
        'Mystery',
        'Romance',
        'Adventure',
        'Horror',
        'Comedy',
        'Drama',
        'Thriller',
        'Historical Fiction'
      ];

      return predefinedGenres.map(genre => ({
        loc: `${this.baseUrl}/discover?genre=${encodeURIComponent(genre)}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.6,
      }));
    } catch (error) {
      logger.error('Error generating genre URLs:', error);
      return [];
    }
  }

  /**
   * Get character URLs - simplified for now
   */
  private async getCharacterUrls(): Promise<SitemapUrl[]> {
    try {
      // For now, return empty array since character URLs structure is not clear
      // This can be expanded when character management is fully implemented
      return [];
    } catch (error) {
      logger.error('Error fetching character URLs:', error);
      return [];
    }
  }

  /**
   * Generate XML from URLs
   */
  private generateXML(urls: SitemapUrl[]): string {
    const urlElements = urls.map(url => {
      let urlXml = `    <url>\n      <loc>${this.escapeXml(url.loc)}</loc>\n`;
      
      if (url.lastmod) {
        urlXml += `      <lastmod>${url.lastmod}</lastmod>\n`;
      }
      
      if (url.changefreq) {
        urlXml += `      <changefreq>${url.changefreq}</changefreq>\n`;
      }
      
      if (url.priority !== undefined) {
        urlXml += `      <priority>${url.priority.toFixed(1)}</priority>\n`;
      }
      
      urlXml += '    </url>';
      return urlXml;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin and private areas
Disallow: /admin/
Disallow: /auth/
Disallow: /api/
Disallow: /settings/
Disallow: /my-stories/

# Allow important pages
Allow: /
Allow: /about
Allow: /discover
Allow: /create
Allow: /pricing
Allow: /learning
Allow: /story/
Allow: /characters/

# Block common bot traps
Disallow: /wp-admin/
Disallow: /wp-content/
Disallow: /wp-includes/
Disallow: /*.php$
Disallow: /*.cgi$
Disallow: /*?*utm_*
Disallow: /*?*ref=*
Disallow: /*?*fbclid=*`;
  }
}

/**
 * Generate and save sitemap
 */
export async function generateAndSaveSitemap(options?: SitemapOptions): Promise<void> {
  try {
    const generator = new SitemapGenerator(options);
    const sitemap = await generator.generateSitemap();
    const robotsTxt = generator.generateRobotsTxt();

    // In a real implementation, you would save these to your server
    // For now, we'll log them or return them for manual saving
    logger.info(`Generated sitemap: ${sitemap.length} characters`);
    logger.info(`Generated robots.txt: ${robotsTxt.length} characters`);

    // You could also trigger a webhook or API call to save these files
    // await saveSitemapToServer(sitemap, robotsTxt);
    
    return;
  } catch (error) {
    logger.error('Failed to generate and save sitemap:', error);
    throw error;
  }
}

/**
 * Get sitemap for immediate use
 */
export async function getSitemap(options?: SitemapOptions): Promise<string> {
  const generator = new SitemapGenerator(options);
  return await generator.generateSitemap();
}

/**
 * Get robots.txt for immediate use
 */
export function getRobotsTxt(baseUrl?: string): string {
  const generator = new SitemapGenerator(baseUrl ? { baseUrl } : {});
  return generator.generateRobotsTxt();
}

export default SitemapGenerator;