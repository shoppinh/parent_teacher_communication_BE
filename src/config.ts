import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
    JWT_EXPIRED_TIME: process.env.JWT_EXPIRED_TIME,
    MONGO: {
      MONGODB_URL: process.env.MONGODB_URL,
      MONGO_DB_NAME: process.env.MONGO_DB_NAME,
      MONGO_DB_USER: process.env.MONGO_DB_USER,
      MONGO_DB_PASS: process.env.MONGO_DB_PASS,
    },
  };
});
