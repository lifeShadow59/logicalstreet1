import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { SearchMessageDto } from '../dto/message.dto';
import {
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Message } from 'src/entities/message.entity';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Search messages',
    description: 'Search messages with filters and sorting options',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Text to search in messages',
    example: 'hello',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'pending', 'spam', 'deleted'],
    description: 'Filter by message status',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'message'],
    description: 'Field to sort by',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort direction',
    example: 'DESC',
  })
  @ApiOkResponse({
    description: 'List of messages matching the criteria',
    example: {
      items: [
        {
          id: 1,
          message: "Hello, I'm a message",
          status: 'active',
          createdAt: '2024-05-23T15:58:35+00:00',
          updatedAt: '2024-05-23T15:58:35+00:00',
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      },
    },
  })
  async search(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    searchDto: SearchMessageDto,
  ): Promise<{
    items: Message[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return this.messagesService.search(searchDto);
  }

  // ------------------------------------------------------------

  @Get(':id')
  @ApiOperation({
    summary: 'Get a message by ID',
    description:
      'Retrieves a message by its unique identifier without translations',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The unique identifier of the message',
    example: '1',
  })
  @ApiOkResponse({
    description: 'The message has been found',
    type: Message,
    schema: {
      example: {
        id: 1,
        message: "Hello, I'm a message",
        status: 'active',
        createdAt: '2024-05-23T15:58:35+00:00',
        updatedAt: '2024-05-23T15:58:35+00:00',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Message not found',
  })
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(+id);
  }

  // ------------------------------------------------------------

  @Get(':id/:language')
  @ApiOperation({
    summary: 'Get message translation',
    description: 'Retrieves a specific language translation for a message',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The unique identifier of the message',
    example: '1',
  })
  @ApiParam({
    name: 'language',
    required: true,
    description: 'The language code for the translation',
    example: 'fr',
    schema: {
      type: 'string',
      pattern: '^[a-z]{2}$',
    },
  })
  @ApiOkResponse({
    description: 'The translation has been found',
    schema: {
      type: 'string',
      example: 'Bonjour, je suis un message',
    },
  })
  @ApiNotFoundResponse({
    description: 'Message or translation not found',
  })
  async findTranslation(
    @Param('id', ParseIntPipe) id: string,
    @Param('language') language: string,
  ) {
    return this.messagesService.findTranslation(+id, language);
  }
}