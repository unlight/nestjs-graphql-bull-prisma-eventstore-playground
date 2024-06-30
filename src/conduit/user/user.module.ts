import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CqrxModule } from 'nestjs-cqrx';
import { UserController } from './user.controller';

@Module({
  imports: [
    CqrxModule.forFeature([]),
    BullModule.registerQueue({
      name: 'user',
    }),
  ],
  controllers: [UserController],
  providers: [],
})
export class UserModule {}
