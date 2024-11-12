import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { postgraphile } from 'postgraphile';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

@Injectable()
export class PostGraphileMiddleware implements NestMiddleware {
  private jwksClient: JwksClient;

  constructor() {
    this.jwksClient = new JwksClient({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://dev-ankke0bl2iasgfy2.au.auth0.com/.well-known/jwks.json`,
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7, authHeader.length); // Extract JWT token
      const decodedHeader = jwt.decode(token, { complete: true });

      if (!decodedHeader || typeof decodedHeader === 'string') {
        return res.status(401).send('Invalid token');
      }

      const kid = decodedHeader.header.kid;

      try {
        // Fetch the signing key
        const key = await this.jwksClient.getSigningKey(kid);
        const signingKey = key.getPublicKey();

        // Verify the token
        jwt.verify(
          token,
          signingKey,
          { algorithms: ['RS256'] },
          (err, payload) => {
            if (err) {
              return res.status(401).send('Unauthorized');
            }
            const postgraphileMiddleware = postgraphile(
              'postgresql://postgres:password@localhost:6432/postgres',
              'public',
              {
                disableDefaultMutations: true,
              },
            );

            return postgraphileMiddleware(req, res, next);
          },
        );
      } catch (error) {
        return res.status(401).send('Unauthorized');
      }
    } else {
      return res.status(401).send('Unauthorized');
    }
  }
}
