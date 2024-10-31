import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { MessageStatus } from '../enums/message-status.enum';

export class SearchMessageDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsEnum(MessageStatus)
  @IsOptional()
  status?: MessageStatus;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  sortBy?: 'createdAt' | 'updatedAt' | 'message';

  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}