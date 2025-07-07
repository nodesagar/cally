import { GoogleAuthService } from './google-auth';
import { GOOGLE_CALENDAR_ENDPOINTS } from '../config/google-calendar';
import { CalendarEvent, ParsedTimetableEvent, SyncResult, CalendarListItem } from '../types/calendar';

/**
 * Google Calendar API Service
 * Handles all calendar operations including event creation, updating, and deletion
 */

export const GOOGLE_CALENDAR_CONFIG = {
  clientId: '669534448156-0p2nuj3p0bmihipj2coolpf8vh3b1sbq.apps.googleusercontent.com',
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
};

// GOOGLE_CALENDAR_ENDPOINTS is imported from '../config/google-calendar'

const DEFAULT_CALENDAR_SETTINGS = {
  timeZone: 'UTC',
  eventColors: {
    lecture: '1',
    lab: '2',
    tutorial: '3',
    exam: '4',
    meeting: '5',
    break: '6'
  },
  reminderDefaults: [
    { method: 'email' as const, minutes: 24 * 60 },
    { method: 'popup' as const, minutes: 10 }
  ]
};

export class GoogleCalendarService {
  private static instance: GoogleCalendarService;
  private authService: GoogleAuthService;

  private constructor() {
    this.authService = GoogleAuthService.getInstance();
  }

  public static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  
  /**
   * Gets list of user's calendars
   */
  public async getCalendarList(): Promise<CalendarListItem[]> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      
      const response = await fetch(GOOGLE_CALENDAR_ENDPOINTS.CALENDAR_LIST, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch calendars: ${response.statusText}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendar list:', error);
      throw new Error(`Failed to fetch calendars: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a new calendar for timetable events
   */
  public async createTimetableCalendar(name: string = 'ChronoSync Timetable'): Promise<string> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      
      const calendarData = {
        summary: name,
        description: 'Calendar created by ChronoSync for timetable events',
        timeZone: DEFAULT_CALENDAR_SETTINGS.timeZone
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calendarData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create calendar: ${response.statusText}`);
      }

      const calendar = await response.json();
      return calendar.id;
    } catch (error) {
      console.error('Error creating calendar:', error);
      throw new Error(`Failed to create calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Converts parsed timetable event to Google Calendar event format
   */
  private convertToCalendarEvent(timetableEvent: ParsedTimetableEvent): CalendarEvent {
    const [startTime, endTime] = this.parseTimeRange(timetableEvent.time, timetableEvent.date);
    
    return {
      id: timetableEvent.id,
      title: timetableEvent.title,
      description: this.buildEventDescription(timetableEvent),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      location: timetableEvent.location,
      colorId: DEFAULT_CALENDAR_SETTINGS.eventColors[timetableEvent.type] || '1',
      reminders: {
        useDefault: false,
        overrides: DEFAULT_CALENDAR_SETTINGS.reminderDefaults
      }
    };
  }

  /**
   * Parses time range string and combines with date
   */
  private parseTimeRange(timeRange: string, dateString: string): [Date, Date] {
    const [startTimeStr, endTimeStr] = timeRange.split(' - ');
    const baseDate = new Date(dateString);
    
    const startTime = this.parseTime(startTimeStr, baseDate);
    const endTime = this.parseTime(endTimeStr, baseDate);
    
    return [startTime, endTime];
  }

  /**
   * Parses time string and combines with date
   */
  private parseTime(timeStr: string, baseDate: Date): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }


  

  /**
   * Builds detailed event description
   */
  private buildEventDescription(event: ParsedTimetableEvent): string {
    const parts = [
      `Course: ${event.title}`,
      `Type: ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}`,
      `Duration: ${event.duration}`
    ];

    if (event.courseCode) {
      parts.push(`Course Code: ${event.courseCode}`);
    }

    if (event.instructor) {
      parts.push(`Instructor: ${event.instructor}`);
    }

    if (event.room) {
      parts.push(`Room: ${event.room}`);
    }

    if (event.building) {
      parts.push(`Building: ${event.building}`);
    }

    parts.push('', 'Created by ChronoSync');
    
    return parts.join('\n');
  }

  /**
   * Creates a single event in Google Calendar
   */
  public async createEvent(calendarId: string, event: CalendarEvent): Promise<string> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      
      const eventData: {
        summary: string;
        description?: string;
        start: { dateTime: string; timeZone: string };
        end: { dateTime: string; timeZone: string };
        location?: string;
        colorId?: string;
        reminders?: any;
        visibility?: "default" | "public" | "private";
        attendees?: { email: string }[];
        recurrence?: string[];
      } = {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.startTime,
          timeZone: DEFAULT_CALENDAR_SETTINGS.timeZone
        },
        end: {
          dateTime: event.endTime,
          timeZone: DEFAULT_CALENDAR_SETTINGS.timeZone
        },
        location: event.location,
        colorId: event.colorId,
        reminders: event.reminders,
        visibility: event.visibility || 'default'
      };

      if (event.attendees && event.attendees.length > 0) {
        eventData.attendees = event.attendees.map(email => ({ email }));
      }

      if (event.recurrence && event.recurrence.length > 0) {
        eventData.recurrence = event.recurrence;
      }

      const response = await fetch(GOOGLE_CALENDAR_ENDPOINTS.EVENTS(calendarId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create event: ${errorData.error?.message || response.statusText}`);
      }

      const createdEvent = await response.json();
      return createdEvent.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error(`Failed to create event "${event.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Syncs multiple timetable events to Google Calendar
   */
  public async syncEvents(
    calendarId: string, 
    timetableEvents: ParsedTimetableEvent[],
    onProgress?: (progress: { completed: number; total: number; currentEvent: string }) => void
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsFailed: 0,
      errors: [],
      calendarId
    };

    try {
      // Convert timetable events to calendar events
      const calendarEvents = timetableEvents.map(event => this.convertToCalendarEvent(event));
      
      // Process events in batches to avoid rate limiting
      const batchSize = 5;
      const batches = this.chunkArray(calendarEvents, batchSize);
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        // Process batch with delay to respect rate limits
        const batchPromises = batch.map(async (event, index) => {
          const globalIndex = batchIndex * batchSize + index;
          
          try {
            onProgress?.({
              completed: globalIndex,
              total: calendarEvents.length,
              currentEvent: event.title
            });

            // Add small delay between requests
            if (index > 0) {
              await this.delay(200);
            }

            const eventId = await this.createEvent(calendarId, event);
            result.eventsCreated++;
            
            return { success: true, eventId, originalId: event.id };
          } catch (error) {
            result.eventsFailed++;
            result.errors.push({
              eventId: event.id,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            
            return { success: false, originalId: event.id, error };
          }
        });

        // Wait for batch to complete
        await Promise.all(batchPromises);
        
        // Delay between batches
        if (batchIndex < batches.length - 1) {
          await this.delay(1000);
        }
      }

      result.success = result.eventsFailed === 0;
      
      onProgress?.({
        completed: calendarEvents.length,
        total: calendarEvents.length,
        currentEvent: 'Sync completed'
      });

      return result;
    } catch (error) {
      console.error('Error syncing events:', error);
      throw new Error(`Failed to sync events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Checks for existing events to avoid duplicates
   */
  public async checkExistingEvents(calendarId: string, events: CalendarEvent[]): Promise<string[]> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      
      // Get events from the calendar for the date range
      const startDate = new Date(Math.min(...events.map(e => new Date(e.startTime).getTime())));
      const endDate = new Date(Math.max(...events.map(e => new Date(e.endTime).getTime())));
      
      const params = new URLSearchParams({
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime'
      });

      const response = await fetch(`${GOOGLE_CALENDAR_ENDPOINTS.EVENTS(calendarId)}?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch existing events: ${response.statusText}`);
      }

      const data = await response.json();
      const existingEvents = data.items || [];
      
      // Return IDs of events that already exist (based on title and time)
      return events
        .filter(newEvent => 
          existingEvents.some((existing: any) => 
            existing.summary === newEvent.title &&
            existing.start?.dateTime === newEvent.startTime
          )
        )
        .map(event => event.id);
    } catch (error) {
      console.error('Error checking existing events:', error);
      return []; // Return empty array if check fails
    }
  }

  /**
   * Deletes an event from Google Calendar
   */
  public async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      
      const response = await fetch(`${GOOGLE_CALENDAR_ENDPOINTS.EVENTS(calendarId)}/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete event: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error(`Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Utility function to chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Utility function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}