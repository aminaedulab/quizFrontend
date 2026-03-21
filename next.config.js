/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        // BACKEND_URL: process.env.backend_url,
        // AISERVER_URL: process.env.aiserver_url,
        NEXT_PUBLIC_BACKEND_URL:process.env.backend_url,
        NEXT_PUBLIC_AI_URL:process.env.aiserver_url,
        NEXT_PUBLIC_FILE_LOCATION:process.env.BASE_FILE_LOCATION,
        // CONTINUOUS_INVOICE_URL: process.env.CONTINUOUS_INVOICE_URL,
        // ERP_FEE_URL: process.env.ERPFEE_URL,
        // HOSTEL_SERVER_URL: process.env.HOSTEL_SERVER_URL,
        // HOSTEL_REDIRECT_URL: process.env.HOSTEL_REDIRECT_URL,
        // RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
        // ADMISSION_SERVER_URL: process.env.ADMISSION_SERVER_URL,
        // KEYCLOAK_URL: process.env.KEYCLOAK_URI,
        // KEYCLOAK_REALM: process.env.KEYCLOAK_REALMI,
        // KEYCLOAK_CLIENT: process.env.KEYCLOAK_CLIENTI,
        // KEYCLOAK_JSON: JSON.stringify({
        //     url: process.env.KEYCLOAK_URI,
        //     realm: process.env.KEYCLOAK_REALMI,
        //     clientId: process.env.KEYCLOAK_CLIENTI,
        // }),
        // NEXT_PUBLIC_CLARITY_KEY: process.env.CLARITY_KEY,
    },
    eslint: {
        dirs: ['app/'],
        ignoreDuringBuilds: true,
    },
    i18n: {
        locales: ['en-US', 'fr', 'nl-NL'],
        defaultLocale: 'en-US',
    },
    experimental: {
        turbo: {
            enabled: true,
        },
    },
};

module.exports = nextConfig;
