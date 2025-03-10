
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

[Add Wikipedia Bot to Discord Server](https://discord.com/oauth2/authorize?client_id=1337760141847691315&permissions=0&integration_type=0&scope=applications.commands+bot)

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

- Node.js (>=18.x)
- MongoDB Atlas account
- Discord Bot Token
- Yarn package manager

## Environment Variables

Create a `.env` file in the root directory:

```

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








## Scalability Considerations

### Current Architecture
- EventSource for Wikipedia stream consumption
- MongoDB for data persistence
- NestJS for application framework

### Future Scaling with Message Queues and Stream Processing

#### Apache Kafka Integration
Apache Kafka would serve as a distributed event streaming platform, enabling:
- Handling millions of Wikipedia changes per minute
- Multiple bot instances processing events simultaneously
- Reliable event buffering during high load periods
- Event replay capabilities for data recovery

**Planned Kafka Topics:**
```plaintext
wikipedia.raw      → Raw Wikipedia event stream
wikipedia.filtered → Language-filtered events
wikipedia.stats    → Aggregated statistics
```

#### Apache Spark Streaming Benefits
Spark Streaming would enable real-time data processing:
- Complex analytics on Wikipedia changes
- Real-time aggregation for statistics
- Batch processing for historical data analysis
- Efficient language-based filtering at scale

**Example Spark Streaming Pipeline:**
```plaintext
1. Ingest events from Kafka
2. Filter by language preference
3. Calculate real-time metrics
4. Store processed data in MongoDB
```

### Scaled Architecture Components

1. **Event Ingestion Layer**
   - Multiple Wikipedia stream consumers
   - Kafka clusters for event distribution
   - Event buffering and replay capability

2. **Processing Layer**
   - Spark Streaming for real-time processing
   - Multiple processing nodes for horizontal scaling
   - Redis caching for frequent queries

3. **Storage Layer**
   - MongoDB sharding for horizontal scaling
   - Read replicas for query optimization
   - Time-series optimized collections

4. **Bot Layer**
   - Multiple bot instances
   - Load balancing across instances
   - Instance auto-scaling based on load

### High-Level Scaled Architecture

```plaintext
                                    ┌─────────────┐
                                    │   Redis     │
                                    │   Cache     │
                                    └─────────────┘
                                          ▲
Wikipedia Stream → Kafka Cluster → Spark Streaming → MongoDB Cluster
        │                               │                  ▲
        └───────────────────┐     ┌────┘                  │
                           ▼     ▼                        │
                      Discord Bot Cluster ────────────────┘
                      (Multiple Instances)
```

### Implementation Priorities

1. **Phase 1: Current Implementation**
   - Single bot instance
   - Direct Wikipedia stream consumption
   - Basic MongoDB storage

2. **Phase 2: Message Queue Integration**
   - Kafka implementation
   - Event buffering
   - Multiple bot support

3. **Phase 3: Stream Processing**
   - Spark Streaming integration
   - Real-time analytics
   - Advanced statistics

4. **Phase 4: Full Scale**
   - Complete distributed system
   - Auto-scaling
   - Monitoring and alerting
```