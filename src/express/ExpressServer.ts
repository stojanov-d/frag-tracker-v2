import express, { Application } from 'express';
import session from 'express-session';
import cors from 'cors';
import Routes from './routes/Routes';

export default class ExpressServer {
  private app: Application;

  constructor() {
    this.app = express();

    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(
      session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === 'production' },
      })
    );

    this.app.use(new Routes().router);
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      console.log(`[Express] Server running on port ${port}`);
    });
  }
}
