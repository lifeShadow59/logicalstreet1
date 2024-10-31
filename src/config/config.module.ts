import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfig } from './typeorm.config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [TypeOrmConfig],
  exports: [TypeOrmConfig],
})
export class ConfigurationModule {}
