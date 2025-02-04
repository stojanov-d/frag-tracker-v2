import { Request, Response } from 'express';
import config from '../../config';
import { Client, GuildMember, TextChannel, UserResolvable } from 'discord.js';
import CustomClient from '../../client/CustomClient';

export class AuthController {
  static client: CustomClient;

  static setClient(client: CustomClient) {
    AuthController.client = client;
  }

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

      if (data.access_token) {
        req.session.accessToken = data.access_token;
        const discordId = req.session.discordId;

        const guild = AuthController.client.guilds.cache.get(
          config.DISCORD_GUILD_ID!
        );
        const member = await guild?.members.fetch(discordId as UserResolvable);

        if (member) {
          const verifiedRole = guild?.roles.cache.find(
            (r) => r.name === 'Verified'
          );
          if (verifiedRole) {
            await member.roles.add(verifiedRole);
            try {
              await member.send({
                content:
                  '✅ You have been successfully verified! You now have access to additional channels.',
              });
              const verificationChannel =
                await AuthController.client.channels.fetch(
                  '1319041752660709376'
                );
              if (verificationChannel && verificationChannel.isTextBased()) {
                await (verificationChannel as TextChannel).send({
                  content: `✅ ${member.user.tag} has been successfully verified!`,
                });
              }
            } catch (error) {
              console.log('Error sending messages:', error);
            }

            res.send('Verification successful! You can close this window.');
          }
        }
      } else {
        res.send('Authentication failed');
      }
    } catch (error) {
      res.send('Error during verification');
    }
  }
}
