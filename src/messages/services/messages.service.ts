import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { SearchMessageDto } from '../dto/message.dto';
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      const message = this.messageRepository.create({
        ...createMessageDto,
        translations: createMessageDto.translations || {},
      });

      return await this.messageRepository.save(message);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create message: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<Omit<Message, 'translations'>> {
    try {
      const message = await this.messageRepository.findOne({ where: { id } });
      if (!message) {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }
      const { translations, ...messageWithoutTranslations } = message;
      return messageWithoutTranslations;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to find message: ${error.message}`);
    }
  }

  async findTranslation(id: number, language: string): Promise<string> {
    try {
      const message = await this.messageRepository.findOne({ where: { id } });
      if (!message) {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }
      if (!message.translations || !message.translations[language]) {
        throw new NotFoundException(
          `Translation for language ${language} not found`,
        );
      }
      return message.translations[language];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to find translation: ${error.message}`,
      );
    }
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
    try {
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
        queryBuilder.andWhere('LOWER(message.message) LIKE LOWER(:query)', {
          query: `%${query}%`,
        });
      }

      if (status) {
        queryBuilder.andWhere('message.status = :status', { status });
      }

      // Validate sortBy field exists in entity
      const allowedSortFields = ['createdAt', 'updatedAt', 'message'];
      if (!allowedSortFields.includes(sortBy)) {
        throw new BadRequestException(`Invalid sort field: ${sortBy}`);
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
    } catch (error) {
      throw new BadRequestException(
        `Failed to search messages: ${error.message}`,
      );
    }
  }
}
