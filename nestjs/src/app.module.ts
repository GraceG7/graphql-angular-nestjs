import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PostGraphileMiddleware } from './postgraphile.middleware';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PostGraphileMiddleware).forRoutes('/postgraphile');
  }
}
