import { Request, Response, NextFunction } from 'express';
import PKCE from '../../utils/PKCE/PKCE';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    codeVerifier: string;
    codeChallenge: string;
    accessToken: string;
    discordId: string;
  }
}

export const pkceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const verifier = PKCE.generateVerifier();
  const challenge = PKCE.generateChallenge(verifier);

  req.session.codeVerifier = verifier;
  req.session.codeChallenge = challenge;
  req.session.discordId = req.query.discordId as string;

  next();
};
