export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  adminCredentials: {
    username: process.env.ADMIN_USERNAME || 'TTT',
    password: process.env.ADMIN_PASSWORD || '666',
  },
};
