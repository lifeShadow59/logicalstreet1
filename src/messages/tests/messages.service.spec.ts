// src/messages/tests/messages.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagesService } from '../services/messages.service';
import { Message } from '../entities/message.entity';
import { MessageStatus } from '../enums/message-status.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
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

  const mockCreate = jest.fn();
  const mockSave = jest.fn();
  const mockFindOne = jest.fn();
  const mockCreateQueryBuilder = jest.fn(() => ({
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(Message),
          useValue: {
            create: mockCreate,
            save: mockSave,
            findOne: mockFindOne,
            createQueryBuilder: mockCreateQueryBuilder,
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

  describe('create', () => {
    const createMessageDto: CreateMessageDto = {
      message: "Hello, I'm a message",
      status: MessageStatus.ACTIVE,
      translations: {
        fr: 'Bonjour, je suis un message',
        es: 'Hola, soy un mensaje',
      },
    };

    it('should create a message successfully', async () => {
      mockCreate.mockReturnValue(mockMessage);
      mockSave.mockResolvedValue(mockMessage);

      const result = await service.create(createMessageDto);

      expect(result).toEqual(mockMessage);
      expect(mockCreate).toHaveBeenCalledWith({
        ...createMessageDto,
        translations: createMessageDto.translations,
      });
      expect(mockSave).toHaveBeenCalled();
    });

    it('should create a message with empty translations', async () => {
      const dtoWithoutTranslations: CreateMessageDto = {
        message: "Hello, I'm a message",
        status: MessageStatus.ACTIVE,
      };

      const expectedMessage = { ...mockMessage, translations: {} };
      mockCreate.mockReturnValue(expectedMessage);
      mockSave.mockResolvedValue(expectedMessage);

      const result = await service.create(dtoWithoutTranslations);

      expect(result.translations).toEqual({});
      expect(mockCreate).toHaveBeenCalledWith({
        ...dtoWithoutTranslations,
        translations: {},
      });
    });

    it('should throw BadRequestException on save error', async () => {
      mockCreate.mockReturnValue(mockMessage);
      mockSave.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createMessageDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a message without translations', async () => {
      mockFindOne.mockResolvedValue(mockMessage);

      const result = await service.findOne(1);

      expect(result).not.toHaveProperty('translations');
      expect(result.id).toBe(mockMessage.id);
      expect(result.message).toBe(mockMessage.message);
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when message not found', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on database error', async () => {
      mockFindOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findOne(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findTranslation', () => {
    it('should return translation for specified language', async () => {
      mockFindOne.mockResolvedValue(mockMessage);

      const result = await service.findTranslation(1, 'fr');

      expect(result).toBe(mockMessage.translations.fr);
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when message not found', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(service.findTranslation(1, 'fr')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when translation not found', async () => {
      mockFindOne.mockResolvedValue(mockMessage);

      await expect(service.findTranslation(1, 'de')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when translations is null', async () => {
      const messageWithoutTranslations = { ...mockMessage, translations: null };
      mockFindOne.mockResolvedValue(messageWithoutTranslations);

      await expect(service.findTranslation(1, 'fr')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('search', () => {
    const mockItems = [mockMessage];
    const mockTotal = 1;

    beforeEach(() => {
      const qb = repository.createQueryBuilder();
      (qb.getManyAndCount as jest.Mock).mockResolvedValue([
        mockItems,
        mockTotal,
      ]);
    });

    it('should return paginated results with default parameters', async () => {
      const searchDto: SearchMessageDto = {};

      const result = await service.search(searchDto);

      expect(result.items).toEqual(mockItems);
      expect(result.meta).toEqual({
        total: mockTotal,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
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

      const qb = repository.createQueryBuilder();
      expect(qb.andWhere).toHaveBeenCalledWith(
        'LOWER(message.message) LIKE LOWER(:query)',
        { query: '%hello%' },
      );
      expect(qb.andWhere).toHaveBeenCalledWith('message.status = :status', {
        status: MessageStatus.ACTIVE,
      });
      expect(qb.orderBy).toHaveBeenCalledWith('message.createdAt', 'DESC');
      expect(qb.skip).toHaveBeenCalledWith(5);
      expect(qb.take).toHaveBeenCalledWith(5);
    });

    it('should throw BadRequestException for invalid sort field', async () => {
      const searchDto: SearchMessageDto = {
        sortBy: 'invalidField' as any,
      };

      await expect(service.search(searchDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle database errors', async () => {
      const qb = repository.createQueryBuilder();
      (qb.getManyAndCount as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.search({})).rejects.toThrow(BadRequestException);
    });
  });
});
