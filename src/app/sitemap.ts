import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants/site';

// 업체 상세(/owners/{id})는 인증 없이 열람 가능한 공개 페이지지만, 업체 목록을 가져오는
// API(axios 클라이언트)가 브라우저 상대경로(next.config.ts rewrites)에 의존하고 있어
// 서버에서 실행되는 이 파일에서는 그대로 호출할 수 없다. 백엔드 주소를 직접 바라보는
// fetch로 바꾸면 전체 업체 목록을 포함시킬 수 있다 — 지금은 정적 공개 경로만 등록.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/signup`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
