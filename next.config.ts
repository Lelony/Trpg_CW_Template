import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 여기에 설정 추가 */
  output: 'export',
  basePath: '/Trpg_CW_Template',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
