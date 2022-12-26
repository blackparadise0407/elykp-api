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
    from: process.env.MAIL_FROM || `"No Reply" <${process.env.MAIL_USER}>`,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  geolocation: {
    url: `https://api.ipgeolocation.io/ipgeo`,
    apiKey: process.env.GEO_API_KEY,
  },
  auth: {
    refreshTokenExpirationMs: 1 * 30 * 24 * 60 * 60, // 1 month
    emailVerificationExpirationMs: 15 * 60, // 15 minutes
  },
  baseUrl: process.env.BASE_URL || 'http://localhost:8081',
  admin: {
    email: 'blackparadise0407@gmail.com',
    password: '040799',
  },
});
