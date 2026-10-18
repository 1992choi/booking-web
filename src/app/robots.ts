import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 인증이 필요한 개인/운영 화면은 크롤링 대상에서 제외
      disallow: ['/my/', '/merchant/', '/admin/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
