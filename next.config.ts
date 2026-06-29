import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // reservation 서비스 (8081) — 이관된 도메인 포함
      {
        source: "/api/v1/merchants/:path*",
        destination: "http://localhost:8081/api/v1/merchants/:path*",
      },
      {
        source: "/api/v1/resources/:path*",
        destination: "http://localhost:8081/api/v1/resources/:path*",
      },
      {
        source: "/api/v1/available-times/:path*",
        destination: "http://localhost:8081/api/v1/available-times/:path*",
      },
      {
        source: "/api/v1/admin/users/:path*",
        destination: "http://localhost:8080/api/v1/admin/users/:path*",
      },
      {
        source: "/api/v1/admin/users",
        destination: "http://localhost:8080/api/v1/admin/users",
      },
      {
        source: "/api/v1/admin/:path*",
        destination: "http://localhost:8081/api/v1/admin/:path*",
      },
      {
        source: "/api/v1/reservations/:path*",
        destination: "http://localhost:8081/api/v1/reservations/:path*",
      },
      // payment 서비스 (8082)
      {
        source: "/api/v1/payments/:path*",
        destination: "http://localhost:8082/api/v1/payments/:path*",
      },
      // notification 서비스 (8083)
      {
        source: "/api/v1/notifications/:path*",
        destination: "http://localhost:8083/api/v1/notifications/:path*",
      },
      // api 서비스 (8080) — 나머지 전부
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8080/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
