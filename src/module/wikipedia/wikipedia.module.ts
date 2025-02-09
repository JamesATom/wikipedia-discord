// wikipedia.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WikiStat, WikiStatSchema } from './schema/wikipedia.schema';
import { WikipediaService } from './wikipedia.service';
import { WikiStatsService } from './wikipedia.stats.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: WikiStat.name,
                schema: WikiStatSchema,
            },
        ]),
    ],
    providers: [WikipediaService, WikiStatsService],
    exports: [WikipediaService, WikiStatsService],
})
export class WikipediaModule {}
