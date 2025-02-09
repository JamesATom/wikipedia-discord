// discord.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client, GatewayIntentBits, Message, Partials } from 'discord.js';
import { WikipediaService } from '../wikipedia/wikipedia.service';
import { WikiStatsService } from '../wikipedia/wikipedia.stats.service';
import { Subscription } from 'rxjs';

@Injectable()
export class DiscordService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DiscordService.name);
    private client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.MessageContent
        ],
        partials: [Partials.Channel]
    });
    private userLanguages = new Map<string, string>();
    private wikiStreamSubscriptions = new Map<string, Subscription>();

    constructor(
        private wikiService: WikipediaService,
        private wikiStatsService: WikiStatsService
    ) {}

    async onModuleInit() {
        try {
            await this.client.login(process.env.DISCORD_BOT_TOKEN);

            this.client.once('ready', () => {
                this.logger.log(`Bot logged in as ${this.client.user.tag}`);
                this.setupWikiStream();
            });

            this.client.on('messageCreate', this.handleMessage.bind(this));
        } catch (error) {
            this.logger.error('Failed to initialize bot:', error);
        }
    }

    async onModuleDestroy() {
        // Cleanup all subscriptions
        for (const [lang, subscription] of this.wikiStreamSubscriptions) {
            subscription.unsubscribe();
        }
        this.wikiStreamSubscriptions.clear();
        
        // Cleanup Wikipedia service
        this.wikiService.cleanup();
        
        // Logout Discord client
        await this.client.destroy();
    }

    private async handleMessage(message: Message) {
        if (message.author.bot) return;

        try {
            switch (message.content.toLowerCase()) {
                case '!help':
                    await this.handleHelp(message);
                    break;

                case '!ping':
                    await message.reply('Pong! Bot is working!');
                    break;

                case '!recent':
                    const lang = this.getLanguage(message.author.id);
                    if (!this.wikiStreamSubscriptions.has(lang)) {
                        this.setupWikiStream(lang);
                    }
                    const events = this.wikiService.getRecentEvents(lang);
                    await this.sendRecentChanges(message, events);
                    break;                    
            }

            if (message.content.startsWith('!stats')) {
                await this.handleStats(message);
            }

            if (message.content.startsWith('!setLang')) {
                await this.handleSetLang(message);
            }
        } catch (error) {
            this.logger.error('Error handling message:', error);
            await message.reply('Sorry, something went wrong!');
        }
    }

    private async handleSetLang(message: Message) {
        const lang = message.content.split(' ')[1];
        if (lang && lang.match(/^[a-z]{2,3}$/)) {
            this.userLanguages.set(message.author.id, lang);
            await message.reply(`Language set to ${lang}`);
            this.setupWikiStream(lang);
        } else {
            await message.reply('Please provide a valid language code (e.g., en, es, fr)');
        }
    }

    private async sendRecentChanges(message: Message, events: any[]) {
        if (!events.length) {
            await message.reply('No recent changes found.');
            return;
        }
    
        const formattedChanges = events.map(e => {
            const timestamp = new Date(e.timestamp * 1000).toLocaleString();
            return `📝 ${e.title}\n👤 ${e.user}\n🔗 ${e.meta?.uri || 'No URL'}\n⏰ ${timestamp}\n`;
        }).join('\n');
    
        await message.reply(formattedChanges);
    }

    private setupWikiStream(lang = 'en') {
        if (!this.wikiStreamSubscriptions.has(lang)) {
            const subscription = this.wikiService.getStream(lang).subscribe({
                next: (event) => {
                    // this.logger.debug(`New wiki change for ${lang}: ${event.title}`);
                },
                error: (error) => {
                    // this.logger.error(`Wiki stream error for ${lang}:`, error);
                }
            });
            this.wikiStreamSubscriptions.set(lang, subscription);
        }
    }

    private async handleStats(message: Message) {
        try {
            const parts = message.content.split(' ');
            const dateInput = parts[1];
            const lang = this.getLanguage(message.author.id);
    
            // If no date provided, use current date
            const date = dateInput || new Date().toISOString().split('T')[0];
    
            // Validate date format
            if (dateInput && !this.isValidDate(dateInput)) {
                await message.reply('Invalid date format. Please use YYYY-MM-DD (e.g., !stats 2025-02-09)');
                return;
            }
    
            const stats = await this.wikiStatsService.getDailyStats(lang, date);
            
            if (!stats) {
                await message.reply(`No statistics found for ${date} (${lang})`);
                return;
            }
    
            // Convert topEditors object to array of [name, count] entries
            const topEditorsArray = Object.entries(stats.topEditors || {})
                .sort(([, a], [, b]) => (b.changeCount || 0) - (a.changeCount || 0))
                .slice(0, 5)
                .map(([name, editor], index) => `${index + 1}. ${editor.displayName}: ${editor.changeCount} changes`);
    
            const response = [
                `📊 Statistics for ${date} (${lang}):`,
                `📝 Total changes: ${stats.changeCount}`,
                '',
                '👥 Top 5 editors:',
                topEditorsArray.length ? topEditorsArray.join('\n') : 'No editors yet'
            ].join('\n');
    
            await message.reply(response);
        } catch (error) {
            this.logger.error('Error fetching stats:', error);
            await message.reply('An error occurred while fetching statistics.');
        }
    }

    // Add helper method for date validation
    private isValidDate(dateStr: string): boolean {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateStr)) return false;

        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date.getTime());
    }

    getLanguage(userId: string) {
        return this.userLanguages.get(userId) || 'en';
    }

    getBotTag(): string {
        return this.client.user?.tag ?? 'Not connected';
    }

    getBotStatus() {
        return {
            isReady: this.client.isReady(),
            tag: this.getBotTag(),
            guilds: this.client.guilds.cache.size,
            activeUsers: this.userLanguages.size
        };
    }

    // Update help message to include stats command
    private async handleHelp(message: Message) {
        await message.reply(
            'Available commands:\n' +
            '!setLang [code] - Set your language (e.g., !setLang en)\n' +
            '!recent - Show recent changes\n' +
            '!stats [YYYY-MM-DD] - Show daily statistics (e.g., !stats 2025-02-09)\n' +
            '!ping - Check if bot is alive'
        );
    }
}