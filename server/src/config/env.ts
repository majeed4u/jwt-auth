import { cleanEnv, str, port } from 'envalid'
import { config } from "dotenv";
config()

const env = cleanEnv(process.env, {
  PORT: port(),
  DATABASE_URL: str(),
  NODE_ENV: str(),
  JWT_SECRET: str(),
  JWT_EXPIRATION: str({ default: '1h' }),
  JWT_REFRESH_TOKEN_EXPIRATION: str({ default: '7d' }),
  JWT_ACCESS_TOKEN_EXPIRATION: str({ default: '15m' }),
  JWT_REFRESH_SECRET: str()
})


export default env