import 'dotenv/config'

const port = process.env.PORT ?? 3000

const configs = {
  MONGODB_HOST: process.env.MONGODB_HOST ?? 'mongodb://127.0.0.1:27017/test-db',
  PORT: port,
  TOKEN_KEY: process.env.TOKEN_KEY!,
}

export default configs
