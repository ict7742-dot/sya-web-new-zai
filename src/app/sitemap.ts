import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://systematicyield.in';

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/courses/ict`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    const posts = await db.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: { slug: true, updatedAt: true, category: true, author: true },
    });

    const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    // Category pages — one URL per distinct category.
    const categories = Array.from(new Set(posts.map((p) => p.category))) as string[];
    const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Author pages — one URL per distinct author.
    const authors = Array.from(new Set(posts.map((p) => p.author))) as string[];
    const authorEntries: MetadataRoute.Sitemap = authors.map((author) => ({
      url: `${baseUrl}/blog/author/${author.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    return [...staticEntries, ...blogEntries, ...categoryEntries, ...authorEntries];
  } catch (error) {
    // Loud, distinctive log so this is searchable in Vercel/Logflare streams.
    console.error(
      '[SITEMAP FALLBACK] Database query failed — returning static-only sitemap.',
      'This usually means DATABASE_URL is wrong, the schema is out of sync,',
      'or the DB is unreachable from this runtime.',
      'Error:',
      error instanceof Error ? error.message : String(error),
    );
    return staticEntries;
  }
}
