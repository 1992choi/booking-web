/** robots.txt/sitemap.xml 등 절대 URL이 필요한 메타데이터에서 공용으로 쓰는 배포 주소.
 *  프로덕션 배포 시 NEXT_PUBLIC_SITE_URL을 실제 도메인으로 설정해야 한다. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3333';
