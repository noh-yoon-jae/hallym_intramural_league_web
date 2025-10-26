/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ['https://intramural-api-v1.kro.kr'],
    async rewrites() {
        return [
            // {
            //     source: '/api/:path*',
            //     destination: 'http://localhost:3001/api/:path*', // 백엔드 주소로 프록시
            // },
            {
                source: '/api/:path*',
                destination: 'https://intramural-api-v1.kro.kr/api/:path*', // 백엔드 주소로 프록시
            },
        ];
    },
};
export default nextConfig;