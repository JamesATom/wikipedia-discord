// wikipedia.stats.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WikiStat, WikiStatDocument } from './schema/wikipedia.schema';

@Injectable()
export class WikiStatsService {
    private readonly logger = new Logger(WikiStatsService.name);

    constructor(
        @InjectModel(WikiStat.name) private wikiStatModel: Model<WikiStatDocument>
    ) {}

    async incrementDailyStats(lang: string, timestamp: number, editor: string, displayName: string): Promise<void> {
        const date = new Date(timestamp * 1000);
        date.setHours(0, 0, 0, 0);
    
        try {
            await this.wikiStatModel.findOneAndUpdate(
                { lang, date },
                {
                    $inc: { 
                        changeCount: 1,
                        [`topEditors.${editor.replace('.', '_')}.changeCount`]: 1 
                    },
                    $set: {
                        [`topEditors.${editor.replace('.', '_')}.displayName`]: displayName
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