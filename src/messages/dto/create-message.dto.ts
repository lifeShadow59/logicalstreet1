import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsObject,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { MessageStatus } from '../enums/message-status.enum';

export class CreateMessageDto {
  @ApiProperty({
    description: 'The message content',
    example: "Hello, I'm a message",
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Message status',
    enum: MessageStatus,
    default: MessageStatus.PENDING,
    example: MessageStatus.PENDING,
  })
  @IsEnum(MessageStatus)
  status: MessageStatus = MessageStatus.PENDING;

  @ApiPropertyOptional({
    description: 'Message translations',
    example: {
      fr: 'Bonjour, je suis un message',
      es: 'Hola, soy un mensaje',
    },
    additionalProperties: { type: 'string' },
  })
  @IsObject()
  @IsOptional()
  translations?: Record<string, string> = {};
}
