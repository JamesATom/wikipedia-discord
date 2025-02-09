// wikipedia.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WikiStatDocument = WikiStat & Document;

@Schema({ timestamps: true })
export class WikiStat {
    @Prop({ required: true })
    lang: string;

    @Prop({ required: true })
    date: Date;

    @Prop({ default: 0 })
    changeCount: number;

    @Prop({ type: Object, default: {} })
    topEditors: Record<string, { displayName: string, changeCount: number }>;
}

export const WikiStatSchema = SchemaFactory.createForClass(WikiStat);
WikiStatSchema.index({ lang: 1, date: 1 }, { unique: true });