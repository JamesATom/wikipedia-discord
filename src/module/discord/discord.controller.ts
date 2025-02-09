// discord.controller.ts
import { Controller, Get } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Controller('discord')
export class DiscordController {
    constructor(private readonly discordService: DiscordService) {}

    @Get('status')
    getBotStatus() {
        return {
            status: 'online',
            botTag: this.discordService.getBotTag(),
            uptime: process.uptime()
        };
    }
}