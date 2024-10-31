// src/messages/tests/messages.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagesService } from '../services/messages.service';
import { Message } from '../entities/message.entity';
import { MessageStatus } from '../enums/message-status.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SearchMessageDto } from '../dto/message.dto';

describe('MessagesService', () => {
  let service: MessagesService;
  let repository: Repository<Message>;

  const mockMessage: Message = {
    id: 1,
    message: "Hello, I'm a message",
    status: MessageStatus.ACTIVE,
    translations: {
      fr: 'Bonjour, je suis un message',
      es: 'Hola, soy un mensaje',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Improved QueryBuilder mock with proper chaining
  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockMessage], 1]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(Message),
          useValue: {
            create: jest.fn().mockReturnValue(mockMessage),
            save: jest.fn().mockResolvedValue(mockMessage),
            findOne: jest.fn().mockResolvedValue(mockMessage),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    repository = module.get<Repository<Message>>(getRepositoryToken(Message));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return paginated results with default parameters', async () => {
      const searchDto = {};
      const expectedResult = {
        items: [mockMessage],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      const result = await service.search(searchDto);

      expect(result).toEqual(expectedResult);
      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    });

    it('should apply search filters correctly', async () => {
      const searchDto: SearchMessageDto = {
        query: 'hello',
        status: MessageStatus.ACTIVE,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        page: 2,
        limit: 5,
      };

      await service.search(searchDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(message.message) LIKE LOWER(:query)',
        { query: '%hello%' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'message.status = :status',
        { status: MessageStatus.ACTIVE },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'message.createdAt',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });

    it('should throw BadRequestException for invalid sort field', async () => {
      const searchDto = {
        sortBy: 'invalidField' as any,
      };

      await expect(service.search(searchDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle database errors', async () => {
      mockQueryBuilder.getManyAndCount.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(service.search({})).rejects.toThrow(BadRequestException);
    });
  });
});
