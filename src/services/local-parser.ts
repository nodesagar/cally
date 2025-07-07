/**
 * Local File Parser Service
 * Handles immediate parsing of structured files (CSV, Excel) using client-side libraries
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ParsedTimetableEvent } from '../types/calendar';

export interface LocalParseResult {
  success: boolean;
  events: ParsedTimetableEvent[];
  rawData: any[];
  errors?: string[];
  format: 'csv' | 'excel' | 'text' | 'unknown';
}

export class LocalFileParser {
  /**
   * Parse file locally using appropriate library
   */
  async parseFile(file: File): Promise<LocalParseResult> {
    try {
      const fileType = this.detectFileType(file);
      
      switch (fileType) {
        case 'csv':
          return await this.parseCSV(file);
        case 'excel':
          return await this.parseExcel(file);
        case 'text':
          return await this.parseText(file);
        default:
          return {
            success: false,
            events: [],
            rawData: [],
            errors: [`Unsupported file type: ${file.type}`],
            format: 'unknown'
          };
      }
    } catch (error) {
      return {
        success: false,
        events: [],
        rawData: [],
        errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
        format: 'unknown'
      };
    }
  }

  /**
   * Detect file type from file object
   */
  private detectFileType(file: File): 'csv' | 'excel' | 'text' | 'unknown' {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    if (fileName.endsWith('.csv') || fileType.includes('csv')) {
      return 'csv';
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return 'excel';
    } else if (fileType.includes('text') || fileName.endsWith('.txt')) {
      return 'text';
    }

    return 'unknown';
  }

  /**
   * Parse CSV file using PapaParse
   */
  private async parseCSV(file: File): Promise<LocalParseResult> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
        complete: (results) => {
          try {
            const events = this.convertRowsToEvents(results.data, 'csv');
            resolve({
              success: true,
              events,
              rawData: results.data,
              errors: results.errors.map(e => e.message),
              format: 'csv'
            });
          } catch (error) {
            resolve({
              success: false,
              events: [],
              rawData: results.data,
              errors: [error instanceof Error ? error.message : 'CSV conversion failed'],
              format: 'csv'
            });
          }
        },
        error: (error) => {
          resolve({
            success: false,
            events: [],
            rawData: [],
            errors: [error.message],
            format: 'csv'
          });
        }
      });
    });
  }

  /**
   * Parse Excel file using SheetJS
   */
  private async parseExcel(file: File): Promise<LocalParseResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON with headers
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: ''
          });
          
          if (jsonData.length === 0) {
            resolve({
              success: false,
              events: [],
              rawData: [],
              errors: ['Excel file is empty'],
              format: 'excel'
            });
            return;
          }

          // Convert to object format with headers
          const headers = (jsonData[0] as string[]).map(h => h.toString().trim().toLowerCase());
          const rows = jsonData.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = (row as any[])[index] || '';
            });
            return obj;
          });

          const events = this.convertRowsToEvents(rows, 'excel');
          
          resolve({
            success: true,
            events,
            rawData: rows,
            format: 'excel'
          });
        } catch (error) {
          resolve({
            success: false,
            events: [],
            rawData: [],
            errors: [error instanceof Error ? error.message : 'Excel parsing failed'],
            format: 'excel'
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          events: [],
          rawData: [],
          errors: ['Failed to read Excel file'],
          format: 'excel'
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Parse text file
   */
  private async parseText(file: File): Promise<LocalParseResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const lines = content.split('\n').filter(line => line.trim());
          
          // Try to detect if it's CSV-like
          if (lines.some(line => line.includes(',') || line.includes(';'))) {
            // Parse as CSV
            Papa.parse(content, {
              header: true,
              skipEmptyLines: true,
              delimiter: content.includes(';') ? ';' : ',',
              transformHeader: (header) => header.trim().toLowerCase(),
              complete: (results) => {
                const events = this.convertRowsToEvents(results.data, 'csv');
                resolve({
                  success: true,
                  events,
                  rawData: results.data,
                  format: 'text'
                });
              }
            });
          } else {
            // Treat as unstructured text - return for LLM processing
            resolve({
              success: false,
              events: [],
              rawData: [{ content }],
              errors: ['Unstructured text detected - requires AI parsing'],
              format: 'text'
            });
          }
        } catch (error) {
          resolve({
            success: false,
            events: [],
            rawData: [],
            errors: [error instanceof Error ? error.message : 'Text parsing failed'],
            format: 'text'
          });
        }
      };

      reader.readAsText(file);
    });
  }

  /**
   * Convert parsed rows to timetable events
   */
  private convertRowsToEvents(rows: any[], format: string): ParsedTimetableEvent[] {
    const events: ParsedTimetableEvent[] = [];
    
    rows.forEach((row, index) => {
      try {
        const event = this.mapRowToEvent(row, index);
        if (event) {
          events.push(event);
        }
      } catch (error) {
        console.warn(`Failed to convert row ${index}:`, error);
      }
    });

    return events;
  }

  /**
   * Map a single row to a timetable event
   */
  private mapRowToEvent(row: any, index: number): ParsedTimetableEvent | null {
    // Common field mappings
    const fieldMappings = {
      title: ['title', 'course', 'subject', 'event', 'name', 'course name', 'event name'],
      time: ['time', 'schedule', 'period', 'hours', 'timing'],
      date: ['date', 'day', 'when'],
      location: ['location', 'room', 'venue', 'place', 'where'],
      type: ['type', 'category', 'kind'],
      instructor: ['instructor', 'teacher', 'professor', 'lecturer', 'prof'],
      courseCode: ['code', 'course code', 'subject code', 'id'],
      duration: ['duration', 'length']
    };

    const event: Partial<ParsedTimetableEvent> = {
      id: `local-parsed-${Date.now()}-${index}`
    };

    // Map fields using flexible matching
    Object.entries(fieldMappings).forEach(([eventField, possibleKeys]) => {
      const value = this.findValueByKeys(row, possibleKeys);
      if (value) {
        (event as any)[eventField] = value;
      }
    });

    // Validate required fields
    if (!event.title) {
      return null;
    }

    // Set defaults and process fields
    event.title = this.cleanTitle(event.title);
    event.time = this.normalizeTime(event.time || '09:00 - 10:30');
    event.date = this.normalizeDate(event.date || this.getNextWeekday(1));
    event.location = event.location || 'TBD';
    event.type = this.normalizeEventType(event.type || 'lecture');
    event.duration = event.duration || this.calculateDuration(event.time);

    // Extract room and building from location
    const locationParts = this.parseLocation(event.location);
    event.room = locationParts.room;
    event.building = locationParts.building;

    return event as ParsedTimetableEvent;
  }

  /**
   * Find value by trying multiple possible keys
   */
  private findValueByKeys(row: any, keys: string[]): string | undefined {
    for (const key of keys) {
      const value = row[key] || row[key.replace(/\s+/g, '')] || row[key.replace(/\s+/g, '_')];
      if (value && typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return undefined;
  }

  /**
   * Clean and normalize title
   */
  private cleanTitle(title: string): string {
    return title.trim().replace(/\s+/g, ' ');
  }

  /**
   * Normalize time format
   */
  private normalizeTime(time: string): string {
    // Handle various time formats
    time = time.trim();
    
    // Convert 12-hour to 24-hour format
    if (time.includes('AM') || time.includes('PM')) {
      time = this.convert12to24(time);
    }
    
    // Ensure proper format
    if (!time.includes(' - ')) {
      // If single time, assume 1.5 hour duration
      const startTime = time;
      const endTime = this.addMinutes(startTime, 90);
      return `${startTime} - ${endTime}`;
    }
    
    return time;
  }

  /**
   * Convert 12-hour to 24-hour format
   */
  private convert12to24(time: string): string {
    return time.replace(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/gi, (match, hours, minutes = '00', period) => {
      let h = parseInt(hours);
      if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
      if (period.toUpperCase() === 'AM' && h === 12) h = 0;
      return `${h.toString().padStart(2, '0')}:${minutes}`;
    });
  }

  /**
   * Add minutes to time string
   */
  private addMinutes(timeStr: string, minutes: number): string {
    const [hours, mins] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes, 0, 0);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  /**
   * Normalize date format
   */
  private normalizeDate(date: string): string {
    try {
      // Handle day names
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIndex = dayNames.findIndex(day => date.toLowerCase().includes(day));
      
      if (dayIndex !== -1) {
        return this.getNextWeekday(dayIndex);
      }
      
      // Try to parse as date
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
      
      // Default to next Monday
      return this.getNextWeekday(1);
    } catch {
      return this.getNextWeekday(1);
    }
  }

  /**
   * Get next occurrence of weekday
   */
  private getNextWeekday(dayOfWeek: number): string {
    const today = new Date();
    const daysUntilTarget = (dayOfWeek + 7 - today.getDay()) % 7 || 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate.toISOString().split('T')[0];
  }

  /**
   * Normalize event type
   */
  private normalizeEventType(type: string): 'lecture' | 'lab' | 'tutorial' | 'meeting' | 'break' {
    const normalized = type.toLowerCase();
    
    if (normalized.includes('lab')) return 'lab';
    if (normalized.includes('tutorial') || normalized.includes('seminar')) return 'tutorial';
    if (normalized.includes('meeting')) return 'meeting';
    if (normalized.includes('break')) return 'break';
    
    return 'lecture';
  }

  /**
   * Calculate duration from time string
   */
  private calculateDuration(timeString: string): string {
    try {
      const [start, end] = timeString.split(' - ');
      const [startHours, startMinutes] = start.split(':').map(Number);
      const [endHours, endMinutes] = end.split(':').map(Number);
      
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      const diffMinutes = endTotalMinutes - startTotalMinutes;
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else {
        return `${minutes}m`;
      }
    } catch {
      return '1h 30m';
    }
  }

  /**
   * Parse location into room and building
   */
  private parseLocation(location: string): { room?: string; building?: string } {
    const parts = location.split(',').map(p => p.trim());
    
    if (parts.length >= 2) {
      return {
        room: parts[0],
        building: parts[1]
      };
    } else if (location.toLowerCase().includes('room')) {
      return {
        room: location,
        building: undefined
      };
    } else {
      return {
        room: undefined,
        building: location
      };
    }
  }
}