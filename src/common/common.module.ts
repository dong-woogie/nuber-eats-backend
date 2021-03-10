import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './common.constants';
import { CommonService } from './common.service';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useValue: new PubSub(),
    },
    CommonService,
  ],
  exports: [PUB_SUB, CommonService],
})
export class CommonModule {}
