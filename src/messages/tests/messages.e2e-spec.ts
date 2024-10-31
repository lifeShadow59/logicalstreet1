// test/messages.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Message } from '../entities/message.entity';
import { AppModule } from 'src/app.module';
import { MessageStatus } from '../enums/message-status.enum';

describe('MessagesController (e2e)', () => {
  let app: INestApplication;
  let createdMessageId: number;

  // Before running tests, set up the application
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({}),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_TEST_NAME'),
            entities: [Message],
            synchronize: false,
          }),
          inject: [ConfigService],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same pipes and middleware as your main app
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  // Clean up after tests
  afterAll(async () => {
    await app.close();
  });

  // Test complete flow of message creation and retrieval
  describe('Message CRUD Flow', () => {
    it('should create a new message (POST /messages)', () => {
      return request(app.getHttpServer())
        .post('/messages')
        .send({
          message: 'Test E2E message',
          status: MessageStatus.ACTIVE,
          translations: {
            fr: 'Message de test E2E',
            es: 'Mensaje de prueba E2E',
          },
        })
        .expect(201)
        .expect((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.message).toBe('Test E2E message');
          expect(response.body.status).toBe(MessageStatus.ACTIVE);
          expect(response.body.translations).toHaveProperty('fr');
          expect(response.body.translations).toHaveProperty('es');
          createdMessageId = response.body.id;
        });
    });

    it('should retrieve the created message (GET /messages/:id)', () => {
      return request(app.getHttpServer())
        .get(`/messages/${createdMessageId}`)
        .expect(200)
        .expect((response) => {
          expect(response.body.id).toBe(createdMessageId);
          expect(response.body.message).toBe('Test E2E message');
          expect(response.body).not.toHaveProperty('translations');
        });
    });

    it('should retrieve message translation (GET /messages/:id/:language)', () => {
      return request(app.getHttpServer())
        .get(`/messages/${createdMessageId}/fr`)
        .expect(200)
        .expect((response) => {
          expect(response.body).toBe('Message de test E2E');
        });
    });

    it('should return 404 for non-existent translation', () => {
      return request(app.getHttpServer())
        .get(`/messages/${createdMessageId}/de`)
        .expect(404);
    });
  });

  // Test search functionality
  describe('Message Search', () => {
    it('should search messages with filters', () => {
      return request(app.getHttpServer())
        .get('/messages/search')
        .query({
          query: 'E2E',
          status: MessageStatus.ACTIVE,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
          page: 1,
          limit: 10,
        })
        .expect(200)
        .expect((response) => {
          expect(response.body).toHaveProperty('items');
          expect(response.body).toHaveProperty('meta');
          expect(response.body.items.length).toBeGreaterThan(0);
          expect(response.body.items[0].message).toContain('E2E');
        });
    });

    it('should handle invalid search parameters', () => {
      return request(app.getHttpServer())
        .get('/messages/search')
        .query({
          sortBy: 'invalidField',
          page: 'invalid',
        })
        .expect(400);
    });
  });

  // Test validation
  describe('Validation', () => {
    it('should reject message creation with invalid status', () => {
      return request(app.getHttpServer())
        .post('/messages')
        .send({
          message: 'Test message',
          status: 'invalid_status',
        })
        .expect(400);
    });

    it('should reject empty message', () => {
      return request(app.getHttpServer())
        .post('/messages')
        .send({
          status: MessageStatus.ACTIVE,
        })
        .expect(400);
    });
  });
});
