# Messages API Service

A RESTful API service built with NestJS for managing messages with translations.

## 🚀 Features

- CRUD operations for messages
- Multi-language translation support
- Advanced search with filters and pagination
- PostgreSQL database integration
- Swagger API documentation
- Automated testing (Unit & E2E)
- CI/CD with GitHub Actions
- AWS EC2 Deployment
- PM2 Process Management

## 📋 Prerequisites

- Node.js (v18.x or later)
- PostgreSQL (v13 or later)
- npm or yarn
- PM2 (for production deployment)

## 🛠️ Installation

1. Clone the repository

```bash
git clone https://github.com/lifeShadow59/logicalstreet1.git
cd logicalstreet1
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server

```bash
npm run start:dev
```

## 🗄️ Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=yourdatabase
```

## 🚦 API Endpoints

### Messages

```typescript
// Create a new message
POST /messages
Body: {
  "message": "Hello, I'm a message",
  "status": "active",
  "translations": {
    "fr": "Bonjour, je suis un message",
    "es": "Hola, soy un mensaje"
  }
}

// Get a message
GET /messages/:id

// Get message translation
GET /messages/:id/:language

// Search messages
GET /messages/search?query=hello&status=active&page=1&limit=10
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## 📦 Build

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

## 🚀 Deployment

### GitHub Actions CI/CD

The project uses GitHub Actions for CI/CD. The workflow includes:

1. Building and testing
2. Creating environment files
3. Deploying to AWS EC2

### AWS EC2 Deployment

1. Configure self-hosted runner on EC2:

```bash
# On your EC2 instance
# Follow GitHub Actions self-hosted runner setup instructions
```

2. Set up GitHub Secrets:

```plaintext
AWS_SSH_KEY
PROD_ENV_FILE
GITHUB_TOKEN
```

3. Start the application on EC2:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start dist/main.js --name "1232"

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup
```

### PM2 Commands

```bash
# Start application
pm2 start dist/main.js --name "logicalstreet1"

# View status
pm2 status

# View logs
pm2 logs logicalstreet1

# Restart application
pm2 restart logicalstreet1

# Stop application
pm2 stop logicalstreet1

# Delete from PM2
pm2 delete logicalstreet1
```

## 📝 API Documentation

Access Swagger documentation at:

```
https://logicalstreet1.walify.app/api
```

## 🛠️ Technologies Used

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Swagger/OpenAPI
- Jest
- GitHub Actions
- AWS EC2
- PM2

## 📁 Project Structure

```
src/
├── messages/
│   ├── controllers/
│   ├── services/
│   ├── entities/
│   ├── dto/
│   └── tests/
├── database/
├── config/
└── main.ts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Authors

- [@lifeShadow59](https://github.com/lifeShadow59)

## 🙏 Acknowledgments

- NestJS Documentation
- TypeORM Documentation
- AWS Documentation
