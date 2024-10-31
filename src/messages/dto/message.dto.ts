import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsInt,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MessageStatus } from '../enums/message-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchMessageDto {
  @ApiPropertyOptional({
    description: 'Text to search in messages',
    example: 'hello',
  })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({
    description: 'Message status filter',
    enum: ['active', 'pending', 'spam', 'deleted'],
    example: 'active',
  })
  @IsEnum(['active', 'pending', 'spam', 'deleted'])
  @IsOptional()
  status?: 'active' | 'pending' | 'spam' | 'deleted';

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['createdAt', 'updatedAt', 'message'],
    example: 'createdAt',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  sortBy?: 'createdAt' | 'updatedAt' | 'message' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    minimum: 1,
    default: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    default: 10,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
