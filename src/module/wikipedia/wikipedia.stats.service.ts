// wikipedia.stats.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WikiStat, WikiStatDocument } from './schema/wikipedia.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class WikiStatsService implements OnModuleInit {
    private readonly logger = new Logger(WikiStatsService.name);
    private readonly MAX_RECORDS = 10; 
    private readonly RETENTION_HOURS = 6;

    constructor(
        @InjectModel(WikiStat.name) private wikiStatModel: Model<WikiStatDocument>
    ) {}

    async onModuleInit() {
        await this.cleanupOldData();
    }

    @Cron('0 */6 * * *') // Run every 6 hours
    private async cleanupOldData() {
        try {
            // Get document count
            const count = await this.wikiStatModel.countDocuments();
            this.logger.log(`Current record count: ${count}`);

            // Calculate cutoff date (keep only last 24 hours of data)
            const cutoffDate = new Date();
            cutoffDate.setHours(cutoffDate.getHours() - this.RETENTION_HOURS);

            if (count > this.MAX_RECORDS) {
                const result = await this.wikiStatModel.deleteMany({
                    date: { $lt: cutoffDate }
                });

                this.logger.log(`Cleaned up ${result.deletedCount} old records`);
            }
        } catch (error) {
            this.logger.error('Failed to cleanup old data:', error);
        }
    }

    async incrementDailyStats(lang: string, timestamp: number, editor: string, displayName: string): Promise<void> {
        const date = new Date(timestamp * 1000);
        date.setHours(0, 0, 0, 0);
        
        const safeEditor = editor?.toString() || 'anonymous';
        const safeDisplayName = displayName?.toString() || safeEditor;

        try {
            // Check record count before inserting
            const count = await this.wikiStatModel.countDocuments();
            
            if (count > this.MAX_RECORDS) {
                await this.cleanupOldData();
            }

            await this.wikiStatModel.findOneAndUpdate(
                { lang, date },
                {
                    $inc: { 
                        changeCount: 1,
                        [`topEditors.${safeEditor.replace(/\./g, '_')}.changeCount`]: 1 
                    },
                    $set: {
                        [`topEditors.${safeEditor.replace(/\./g, '_')}.displayName`]: safeDisplayName
                    }
                },
                { upsert: true, new: true }
            );
        } catch (error) {
            this.logger.error(`Failed to update stats for ${lang} on ${date}:`, error);
        }
    }

    async getDailyStats(lang: string, dateStr: string): Promise<WikiStatDocument> {
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);

        return this.wikiStatModel.findOne({ lang, date }).exec();
    }
}