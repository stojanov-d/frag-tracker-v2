import express, { Application } from 'express';
import session from 'express-session';
import cors from 'cors';
import Routes from './routes/Routes';
import { AuthController } from './controllers/AuthController';
import CustomClient from '../client/CustomClient';
import config from '../config';

export default class ExpressServer {
  private app: Application;
  private client: CustomClient;

  constructor(client: CustomClient) {
    this.client = client;
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(
      session({
        secret: config.SESSION_SECRET_KEY!,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === 'production' },
      })
    );
    AuthController.setClient(client);
    this.app.use(new Routes().router);
  }

  public start(port: number): Promise<any> {
    return new Promise((resolve) => {
      const server = this.app.listen(port, () => {
        resolve(server);
      });
    });
  }
}
