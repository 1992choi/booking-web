import type { NextConfig } from "next";

const API_SERVICE_URL = process.env.API_SERVICE_URL ?? "http://localhost:8080";
const RESERVATION_SERVICE_URL = process.env.RESERVATION_SERVICE_URL ?? "http://localhost:8081";
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL ?? "http://localhost:8082";
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL ?? "http://localhost:8083";
const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL ?? "http://localhost:8084";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // reservation 서비스 — 이관된 도메인 포함
      {
        source: "/api/v1/merchants/:path*",
        destination: `${RESERVATION_SERVICE_URL}/api/v1/merchants/:path*`,
      },
      {
        source: "/api/v1/resources/:path*",
        destination: `${RESERVATION_SERVICE_URL}/api/v1/resources/:path*`,
      },
      {
        source: "/api/v1/available-times/:path*",
        destination: `${RESERVATION_SERVICE_URL}/api/v1/available-times/:path*`,
      },
      {
        source: "/api/v1/admin/users/:path*",
        destination: `${API_SERVICE_URL}/api/v1/admin/users/:path*`,
      },
      {
        source: "/api/v1/admin/users",
        destination: `${API_SERVICE_URL}/api/v1/admin/users`,
      },
      {
        source: "/api/v1/admin/:path*",
        destination: `${RESERVATION_SERVICE_URL}/api/v1/admin/:path*`,
      },
      {
        source: "/api/v1/reservations/:path*",
        destination: `${RESERVATION_SERVICE_URL}/api/v1/reservations/:path*`,
      },
      // payment 서비스
      {
        source: "/api/v1/payments/:path*",
        destination: `${PAYMENT_SERVICE_URL}/api/v1/payments/:path*`,
      },
      // notification 서비스
      {
        source: "/api/v1/notifications/:path*",
        destination: `${NOTIFICATION_SERVICE_URL}/api/v1/notifications/:path*`,
      },
      // review 서비스
      {
        source: "/api/v1/reviews/:path*",
        destination: `${REVIEW_SERVICE_URL}/api/v1/reviews/:path*`,
      },
      {
        source: "/api/v1/reviews",
        destination: `${REVIEW_SERVICE_URL}/api/v1/reviews`,
      },
      // api 서비스 — 나머지 전부
      {
        source: "/api/v1/:path*",
        destination: `${API_SERVICE_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
