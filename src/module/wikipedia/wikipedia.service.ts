// wikipedia.service.ts
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Observable, Subject, share } from 'rxjs';
import { EventSource } from 'eventsource';
import { WikiStatsService } from './wikipedia.stats.service';

interface WikiEvent {
    wiki: string;
    title: string;
    user: string;
    timestamp: number;
    meta: {
        uri: string;
    };
}

@Injectable()
export class WikipediaService implements OnModuleDestroy {
    private readonly logger = new Logger(WikipediaService.name);
    private readonly WIKI_STREAM_URL = 'https://stream.wikimedia.org/v2/stream/recentchange';
    private recentEvents: Map<string, WikiEvent[]> = new Map();
    private eventSourceMap: Map<string, EventSource> = new Map();
    private eventSubjects: Map<string, Subject<WikiEvent>> = new Map();

    constructor(private wikiStatsService: WikiStatsService) {}

    getStream(lang = 'en'): Observable<WikiEvent> {
        // Return existing stream if available
        if (this.eventSubjects.has(lang)) {
            return this.eventSubjects.get(lang).asObservable();
        }

        // Create new subject for this language
        const subject = new Subject<WikiEvent>();
        this.eventSubjects.set(lang, subject);

        // Create EventSource if it doesn't exist
        if (!this.eventSourceMap.has(lang)) {
            const eventSource = new EventSource(this.WIKI_STREAM_URL, {
                withCredentials: false,
            });

            eventSource.onopen = () => {
                this.logger.log(`Connected to Wikipedia stream for ${lang}`);
            };

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.wiki?.startsWith(lang)) {
                        this.cacheEvent(lang, data);
                        subject.next(data);
                    }
                } catch (err) {
                    this.logger.error('Parse error:', err);
                }
            };

            eventSource.onerror = (error) => {
                this.logger.error(`EventSource error for ${lang}:`, error);
                // Don't close on error, let the EventSource retry automatically
                if (error.type === 'error') {
                    this.logger.log(`Connection lost for ${lang}, waiting for automatic reconnection...`);
                }
            };

            this.eventSourceMap.set(lang, eventSource);
        }

        // Return shared observable that doesn't complete when unsubscribed
        return subject.asObservable().pipe(share());
    }

    onModuleDestroy() {
        this.cleanup();
    }

    cleanup(lang?: string) {
        if (lang) {
            this.closeConnection(lang);
        } else {
            // Cleanup all connections
            for (const [lang] of this.eventSourceMap) {
                this.closeConnection(lang);
            }
        }
    }

    private closeConnection(lang: string) {
        const eventSource = this.eventSourceMap.get(lang);
        if (eventSource) {
            this.logger.log(`Closing EventSource for ${lang}`);
            eventSource.close();
            this.eventSourceMap.delete(lang);
        }

        const subject = this.eventSubjects.get(lang);
        if (subject) {
            subject.complete();
            this.eventSubjects.delete(lang);
        }
    }

    private async cacheEvent(lang: string, event: WikiEvent) {
        const events = this.recentEvents.get(lang) || [];
        events.unshift(event);
        if (events.length > 20) events.pop();
        this.recentEvents.set(lang, events);
    
        // Track stats with additional user details
        await this.wikiStatsService.incrementDailyStats(
            lang,
            event.timestamp,
            event.user,
            event.user, 
        );
    }

    getRecentEvents(lang: string, count = 5): WikiEvent[] {
        return (this.recentEvents.get(lang) || []).slice(0, count);
    }
}