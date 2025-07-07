// config/google-calendar.ts
import { GoogleCalendarConfig } from '../types/calendar';

// Google Calendar API Configuration
export const GOOGLE_CALENDAR_CONFIG: GoogleCalendarConfig = {
  clientId: '669534448156-0p2nuj3p0bmihipj2coolpf8vh3b1sbq.apps.googleusercontent.com',
  clientSecret: '', // Not needed for client-side auth
  // Use the current domain for redirect - make sure this matches Google Console
  redirectUri: `${window.location.origin}`, // Simplified - no /auth/callback
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
};

// Calendar API endpoints
export const GOOGLE_CALENDAR_ENDPOINTS = {
  AUTH: 'https://oauth2.googleapis.com/auth/v2/auth',
  TOKEN: 'https://oauth2.googleapis.com/token',
  REVOKE: 'https://oauth2.googleapis.com/revoke',
  CALENDAR_LIST: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
  EVENTS: (calendarId: string) => `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
  USER_INFO: 'https://www.googleapis.com/oauth2/v2/userinfo'
};

// Default calendar settings
export const DEFAULT_CALENDAR_SETTINGS = {
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use user's timezone
  reminderDefaults: [
    { method: 'popup' as const, minutes: 15 },
    { method: 'email' as const, minutes: 60 }
  ],
  eventColors: {
    lecture: '1',  // Blue
    lab: '2',      // Green
    tutorial: '3', // Purple
    exam: '4',     // Red
    meeting: '5',  // Orange
    break: '6'     // Yellow
  }
};