import { Request, Response } from 'express';
import config from '../../config';

export class AuthController {
  static async authorize(req: Request, res: Response) {
    const authUrl = new URL('https://accounts.faceit.com');

    authUrl.searchParams.append('client_id', config.FACEIT_CLIENT_ID!);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', config.FACEIT_REDIRECT_URI!);
    authUrl.searchParams.append('code_challenge', req.session.codeChallenge!);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('scope', 'openid profile');
    authUrl.searchParams.append('redirect_popup', 'true');

    res.redirect(authUrl.toString());
  }

  static async callback(req: Request, res: Response) {
    const { code } = req.query;
    const verifier = req.session.codeVerifier;

    try {
      const tokenResponse = await fetch(
        'https://api.faceit.com/auth/v1/oauth/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
              `${config.FACEIT_CLIENT_ID}:${config.FACEIT_CLIENT_SECRET}`
            ).toString('base64')}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code as string,
            code_verifier: verifier!,
            redirect_uri: config.FACEIT_REDIRECT_URI!,
          }),
        }
      );

      const data = await tokenResponse.json();
      req.session.accessToken = data.access_token;
      //   console.log(data);
      res.send('Success');
    } catch (error) {
      res.send('Error');
    }
  }
}
