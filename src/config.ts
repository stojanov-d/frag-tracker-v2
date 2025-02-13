import 'dotenv/config';

export function validateConfig() {
  const requiredEnvVars = [
    'DISCORD_BOT_TOKEN',
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'DISCORD_GUILD_ID',
    'FACEIT_CLIENT_ID',
    'FACEIT_CLIENT_SECRET',
    'FACEIT_API_KEY',
    'FACEIT_REDIRECT_URI',
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
    'BASE_URI',
    'AUTH_URI',
    'SESSION_SECRET_KEY',
    'EXPRESS_PORT',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}
const config = {
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,

  FACEIT_CLIENT_ID: process.env.FACEIT_CLIENT_ID,
  FACEIT_CLIENT_SECRET: process.env.FACEIT_CLIENT_SECRET,
  FACEIT_API_KEY: process.env.FACEIT_API_KEY,
  FACEIT_REDIRECT_URI: process.env.FACEIT_REDIRECT_URI,

  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PORT: process.env.POSTGRES_PORT,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_DB: process.env.POSTGRES_DB,

  BASE_URI: process.env.BASE_URI,
  AUTH_URI: process.env.AUTH_URI,
  SESSION_SECRET_KEY: process.env.SESSION_SECRET_KEY,
  EXPRESS_PORT: process.env.EXPRESS_PORT,
};

export default config;
