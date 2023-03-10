export default () => ({
  port: process.env.PORT || 8081,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '040799',
    name: process.env.DATABASE_NAME || 'elykp_dev',
  },
  jwt: {
    secret: 'not_very_secret',
    expiresIn: '15m',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: process.env.MAIL_PORT || 465,
    from: process.env.MAIL_FROM || `"Elykp" <${process.env.MAIL_USER}>`,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  auth: {
    refreshTokenExpirationS: 1 * 30 * 24 * 60 * 60, // 1 month
    emailVerificationExpirationS: 15 * 60, // 15 minutes
    resetPasswordExpirationS: 15 * 60, // 15 minutes
  },
  baseUrl: process.env.BASE_URL || 'http://localhost:8081',
  baseIp: '42.114.22.81',
  redirectUrl:
    process.env.REDIRECT_URL || 'https://localhost:5173/signin-callback.html',
  admin: {
    email: 'blackparadise0407@gmail.com',
    password: '040799',
  },
  geo: {
    apiKey: process.env.GEO_API_KEY,
    apiUrl: 'https://api.ipgeolocation.io/ipgeo',
  },
  google: {
    clientId: process.env.GG_CLIENT_ID,
    clientSecret: process.env.GG_CLIENT_SECRET,
    redirectUri: process.env.GG_REDIRECT_URI,
  },
  discord: {
    webhookUrl: process.env.DC_WEBHOOK_URL,
  },
});
