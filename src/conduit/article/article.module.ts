import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CqrxModule } from 'nestjs-cqrx';

@Module({
  imports: [
    CqrxModule.forFeature([]),
    BullModule.registerQueue({
      name: 'user',
    }),
  ],
  controllers: [],
  providers: [],
})
export class UserModule {}
