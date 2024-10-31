import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Message } from '../entities/message.entity';
import { SearchMessageDto } from '../dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async findOne(id: number): Promise<Omit<Message, 'translations'>> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    const { translations, ...messageWithoutTranslations } = message;
    return messageWithoutTranslations;
  }

  async findTranslation(id: number, language: string): Promise<string> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    if (!message.translations[language]) {
      throw new NotFoundException(
        `Translation for language ${language} not found`,
      );
    }
    return message.translations[language];
  }

  async search(searchDto: SearchMessageDto): Promise<Message[]> {
    const {
      query,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = searchDto;

    const whereClause: any = {};
    if (query) {
      whereClause.message = Like(`%${query}%`);
    }
    if (status) {
      whereClause.status = status;
    }

    return this.messageRepository.find({
      where: whereClause,
      order: { [sortBy]: sortOrder },
    });
  }
}
