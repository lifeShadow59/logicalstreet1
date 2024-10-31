import { ConfigService } from '@nestjs/config';
import { TypeOrmConfig } from './typeorm.config';
import { config } from 'dotenv';

const configService = new ConfigService();
const typeOrmConfig = new TypeOrmConfig(configService);

config();
export default typeOrmConfig.getDataSource();
