// config/index.js
module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  db: {
    url: process.env.DATABASE_URL
  },
  socket: {
    cors: {
      origin: process.env.CLIENT_URLS.split(',')
    }
  }
};