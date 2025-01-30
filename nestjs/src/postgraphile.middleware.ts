import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  postgraphile,
  makePluginHook,
  makeExtendSchemaPlugin,
  gql,
} from 'postgraphile';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import PgPubsub from '@graphile/pg-pubsub';
import ConnectionFilterPlugin = require('postgraphile-plugin-connection-filter');

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

            const schemaName = 'public';
            const pluginHook = makePluginHook([PgPubsub]);
            const postgraphileMiddleware = postgraphile(
              'postgresql://postgres:password@localhost:6432/postgres',
              schemaName,
              {
                pluginHook,
                appendPlugins: [
                  makeExtendSchemaPlugin(({ pgSql: sql }) => ({
                    typeDefs: gql`
                      type NotifyEvent {
                        id: Int,
                        message: String,
                      }
                      type DataSubscription {
                        operation: String,
                        old: NotifyEvent,
                        new: NotifyEvent
                      }
                      extend type Subscription {
                        data: DataSubscription
                          @pgSubscription(topic: "postgraphile:${schemaName}.data"),
                        allDatas: [Datum]
                          @pgSubscription(topic: "postgraphile:${schemaName}.data")
                      }
                    `,
                    resolvers: {
                      Subscription: {
                        allDatas: {
                          async resolve(
                            _event,
                            _args,
                            _context,
                            { graphile: { selectGraphQLResultFromTable } },
                          ) {
                            // Re-query the `data` table to get the latest relevant data
                            const rows = await selectGraphQLResultFromTable(
                              sql.identifier(schemaName, 'data'),
                              (_tableAlias, _sqlBuilder) => {
                                // This function is currently empty but may be used for future filtering or modifications.
                              },
                            );
                            return rows;
                          },
                        },
                      },
                    },
                  })),
                  ConnectionFilterPlugin,
                ],
                graphileBuildOptions: {
                  connectionFilterArrays: false,
                  connectionFilterComputedColumns: false,
                },
                subscriptions: true,
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
