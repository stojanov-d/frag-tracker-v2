import { Sequelize } from 'sequelize';
import config from './config';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.POSTGRES_HOST,
  port: parseInt(config.POSTGRES_PORT!),
  username: config.POSTGRES_USER,
  password: config.POSTGRES_PASSWORD,
  database: config.POSTGRES_DB,
  logging: false,
});
