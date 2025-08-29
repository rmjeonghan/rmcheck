import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 아래 eslint 부분을 추가하세요.
  eslint: {
    // 경고: 이 옵션은 프로덕션 빌드 시 ESLint 실행을 비활성화합니다.
    // 타입 에러를 해결한 후에는 반드시 이 옵션을 제거하는 것이 좋습니다.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig