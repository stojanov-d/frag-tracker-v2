import { Router } from 'express';
import { pkceMiddleware } from '../middleware/PkceMiddleware';
import { AuthController } from '../controllers/AuthController';

export default class Routes {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public init(): void {
    this.router.get('/faceit/auth', pkceMiddleware, AuthController.authorize);
    this.router.get('/faceit/callback', AuthController.callback);
  }
}
