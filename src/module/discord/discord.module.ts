// discord.module.ts
import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordController } from './discord.controller';
import { WikipediaModule } from '../wikipedia/wikipedia.module';

@Module({
    imports: [WikipediaModule],
    controllers: [DiscordController],
    providers: [DiscordService],
    exports: [DiscordService]
})
export class DiscordModule {}