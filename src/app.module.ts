// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WikipediaModule } from './module/wikipedia/wikipedia.module';
import { DiscordModule } from './module/discord/discord.module';

@Module({
    imports: [
		ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
		MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/discord-bot'),
        DiscordModule,
        WikipediaModule,
	],
    controllers: [],
    providers: [],
})
export class AppModule {}