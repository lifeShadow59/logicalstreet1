import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

@Injectable()
export class TypeOrmConfig {
  constructor(private configService: ConfigService) {}
  getOrmConfig(): TypeOrmModuleOptions {
    console.log('DB_HOST', this.configService.get<string>('DB_HOST'));
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      cache: true,
      logger: 'debug',
      logging: 'all',
      logNotifications: true,
    };
  }

  public getDataSource(): DataSource {
    return new DataSource(this.getOrmConfig() as DataSourceOptions);
  }
}
