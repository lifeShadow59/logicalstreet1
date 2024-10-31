import { Controller, Get, Param, Query } from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { SearchMessageDto } from '../dto/message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(+id);
  }

  @Get(':id/:language')
  findTranslation(
    @Param('id') id: string,
    @Param('language') language: string,
  ) {
    return this.messagesService.findTranslation(+id, language);
  }

  @Get('search')
  search(@Query() searchDto: SearchMessageDto) {
    return this.messagesService.search(searchDto);
  }
}
