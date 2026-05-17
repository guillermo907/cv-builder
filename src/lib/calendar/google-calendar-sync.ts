type SyncableEvent = {
  id: string;
  title: string;
  description?: string | null;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  venueName: string;
  venueAddress?: string | null;
  calendarExternalId?: string | null;
};

type GoogleCalendarSyncConfig = {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
};

export class GoogleCalendarSyncService {
  constructor(private readonly config: GoogleCalendarSyncConfig = {}) {}

  isConfigured() {
    return Boolean(this.config.clientId && this.config.clientSecret && this.config.redirectUri);
  }

  async syncConfirmedEvent(event: SyncableEvent) {
    return {
      status: this.isConfigured() ? "ready-for-api-call" : "configuration-missing",
      eventId: event.id,
      externalId: event.calendarExternalId ?? null,
      payloadPreview: {
        summary: event.title,
        description: event.description ?? "",
        location: [event.venueName, event.venueAddress].filter(Boolean).join(", "),
        start: {
          dateTime: event.startsAt.toISOString(),
          timeZone: event.timezone
        },
        end: {
          dateTime: event.endsAt.toISOString(),
          timeZone: event.timezone
        }
      }
    };
  }
}
