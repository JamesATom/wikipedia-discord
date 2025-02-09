```markdown
# Wikipedia RecentChanges Discord Bot

A Discord bot that streams and filters Wikipedia recent changes, built with NestJS and MongoDB.

## Features

- Real-time Wikipedia changes streaming
- Language-based filtering
- Daily statistics tracking
- Discord command interface
- MongoDB integration for persistence

## Installing the Bot

To add the bot to your Discord server or use it as a DM, click the following link:

[Add Wikipedia Bot to Discord](https://discord.com/oauth2/authorize?client_id=1337760141847691315)

The bot requires the following permissions:
- Read Messages/View Channels
- Send Messages
- Read Message History
- Use External Emojis
- Add Reactions

After adding the bot:
1. Use `!setLang` to set your preferred language
2. Start tracking Wikipedia changes with `!recent`
3. View daily statistics using `!stats`

## Prerequisites

- Node.js (>=20.11.0)
- MongoDB Atlas account
- Discord Bot Token
- Yarn package manager

## Environment Variables

Create a `.env` file in the root directory:

```properties
PORT=8000
DISCORD_BOT_TOKEN=your_discord_bot_token
MONGODB_URI=your_mongodb_uri
```

## Installation

```bash
# Install dependencies
yarn install

# Start the application
yarn start:dev
```

## Discord Commands

- `!recent` - Show 5 latest Wikipedia changes
- `!setLang [language_code]` - Set preferred language (e.g., en, es)
- `!stats [yyyy-mm-dd]` - Show daily statistics

## Scalability Considerations

### Current Architecture
- EventSource for Wikipedia stream consumption
- MongoDB for data persistence
- NestJS for application framework

### Scaling Strategies

1. **Message Queue Implementation**
   - Implement Apache Kafka as message broker
   - Separate producers and consumers
   - Buffer Wikipedia events during peak loads

2. **Data Processing**
   - Use Apache Spark for stream processing
   - Implement batch processing for historical data
   - Add Redis caching layer for frequent queries

3. **Database Scaling**
   - MongoDB sharding for horizontal scaling
   - Implement read replicas
   - Index optimization for query performance

### High-Level Architecture

```plaintext
Wikipedia Stream → Kafka → Spark Streaming → MongoDB
                        ↓
                    Discord Bot
```

## Development

```bash
# Development mode
yarn start:dev

# Linting
yarn lint
```

## Deployment

The application is configured for DigitalOcean App Platform deployment:

```bash
# Build for DigitalOcean
yarn build:digitalocean
```

## Project Structure

```
src/
├── module/
│   ├── discord/
│   ├── wikipedia/
│   └── stats/
├── main.ts
└── app.module.ts
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
```