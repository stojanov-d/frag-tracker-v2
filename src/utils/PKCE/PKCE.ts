import crypto from 'crypto';

export default class PKCE {
  private static BASE64URL_ENCODE(str: Buffer): string {
    return str
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  static generateVerifier(length: number = 43): string {
    return this.BASE64URL_ENCODE(crypto.randomBytes(32)).slice(0, length);
  }

  static generateChallenge(verifier: string): string {
    const hash = crypto.createHash('sha256').update(verifier).digest();
    return this.BASE64URL_ENCODE(hash);
  }
}
