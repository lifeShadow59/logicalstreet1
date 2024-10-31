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

  async search(searchDto: SearchMessageDto): Promise<{
    items: Message[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      query,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = searchDto;

    const queryBuilder = this.messageRepository.createQueryBuilder('message');

    // Add search conditions
    if (query) {
      queryBuilder.andWhere('message.message ILIKE :query', {
        query: `%${query}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('message.status = :status', { status });
    }

    // Add sorting
    queryBuilder.orderBy(`message.${sortBy}`, sortOrder);

    // Add pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Get results and total count
    const [items, total] = await queryBuilder.getManyAndCount();

    // Return paginated result
    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
