import { Module } from '@nestjs/common';
import { ProfileController } from './entrypoints/rest/controller/profile.controller';
import { ProfileService } from './application/service/profile.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
