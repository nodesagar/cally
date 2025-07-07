export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
  recurrence?: string[];
  colorId?: string;
  visibility?: 'default' | 'public' | 'private';
}

export interface ParsedTimetableEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  location: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'meeting' | 'break';
  duration: string;
  instructor?: string;
  courseCode?: string;
  room?: string;
  building?: string;
}

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

export interface SyncResult {
  success: boolean;
  eventsCreated: number;
  eventsUpdated: number;
  eventsFailed: number;
  errors: Array<{
    eventId: string;
    error: string;
  }>;
  calendarId?: string;
}

export interface CalendarListItem {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  accessRole: string;
  backgroundColor?: string;
  foregroundColor?: string;
}