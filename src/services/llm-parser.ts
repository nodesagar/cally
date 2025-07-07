/**
 * LLM-Powered Timetable Parser Service
 * Uses OpenAI GPT or Google Gemini to extract structured timetable data
 */

import { ParsedTimetableEvent } from '../types/calendar';

export interface LLMConfig {
  provider: 'openai' | 'gemini';
  apiKey: string;
  model?: string;
}

export interface ParseResult {
  success: boolean;
  events: ParsedTimetableEvent[];
  confidence: number;
  errors?: string[];
  rawResponse?: string;
  enhancedFields?: string[];
}

export class LLMTimetableParser {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = {
      ...config,
      model: config.model || (config.provider === 'openai' ? 'gpt-3.5-turbo' : 'gemini-pro')
    };
  }

  /**
   * Parse timetable from various file formats using LLM
   */
  async parseFile(file: File): Promise<ParseResult> {
    try {
      const fileContent = await this.extractFileContent(file);
      const prompt = this.buildParsingPrompt(fileContent, file.type);
      
      if (this.config.provider === 'openai') {
        return await this.parseWithOpenAI(prompt);
      } else {
        return await this.parseWithGemini(prompt);
      }
    } catch (error) {
      return {
        success: false,
        events: [],
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'Unknown parsing error']
      };
    }
  }

  /**
   * Enhance already parsed events with AI cleanup and enrichment
   */
  async enhanceEvents(events: ParsedTimetableEvent[], rawData?: any[]): Promise<ParseResult> {
    try {
      // Create a summary of the events for token efficiency
      const eventSummary = events.map(event => ({
        id: event.id,
        title: event.title,
        time: event.time,
        date: event.date,
        location: event.location,
        type: event.type,
        instructor: event.instructor,
        courseCode: event.courseCode
      }));

      const prompt = this.buildEnhancementPrompt(eventSummary, rawData);
      
      if (this.config.provider === 'openai') {
        return await this.enhanceWithOpenAI(prompt, events);
      } else {
        return await this.enhanceWithGemini(prompt, events);
      }
    } catch (error) {
      return {
        success: false,
        events,
        confidence: 70, // Return original events with lower confidence
        errors: [error instanceof Error ? error.message : 'Enhancement failed'],
        enhancedFields: []
      };
    }
  }

  /**
   * Extract content from different file types
   */
  private async extractFileContent(file: File): Promise<string> {
    const fileType = file.type;
    
    if (fileType.includes('text') || fileType.includes('csv')) {
      return await this.readTextFile(file);
    } else if (fileType.includes('image')) {
      return await this.extractTextFromImage(file);
    } else if (fileType.includes('pdf')) {
      return await this.extractTextFromPDF(file);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  /**
   * Read text content from file
   */
  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Extract text from image using OCR simulation
   */
  private async extractTextFromImage(file: File): Promise<string> {
    // Simulate OCR - in production, integrate with Google Vision API or Tesseract.js
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`
          UNIVERSITY TIMETABLE - COMPUTER SCIENCE DEPARTMENT
          
          Monday:
          09:00-10:30 Advanced Algorithms (CS401) - Room 101, CS Building - Dr. Smith
          11:00-12:30 Database Systems Lab (CS302) - Lab 205, Engineering Building - Prof. Johnson
          14:00-15:30 Machine Learning (CS501) - Lecture Hall A - Dr. Williams
          
          Tuesday:
          10:00-11:30 Software Engineering (CS301) - Room 303, CS Building - Dr. Brown
          13:00-14:30 Computer Networks (CS402) - Room 201, CS Building - Prof. Davis
          
          Wednesday:
          09:00-10:30 Advanced Algorithms (CS401) - Room 101, CS Building - Dr. Smith
          15:00-16:00 Project Meeting - Conference Room B - Team Lead
        `);
      }, 1000);
    });
  }

  /**
   * Extract text from PDF simulation
   */
  private async extractTextFromPDF(file: File): Promise<string> {
    // Simulate PDF text extraction - in production, use PDF.js or similar
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`
          Course Schedule - Fall 2024
          
          Course: Advanced Algorithms
          Code: CS401
          Time: Monday, Wednesday 09:00-10:30
          Location: Room 101, Computer Science Building
          Instructor: Dr. Smith
          
          Course: Database Systems Lab
          Code: CS302
          Time: Monday 11:00-12:30
          Location: Lab 205, Engineering Building
          Instructor: Prof. Johnson
        `);
      }, 1500);
    });
  }

  /**
   * Build enhancement prompt for already parsed events
   */
  private buildEnhancementPrompt(events: any[], rawData?: any[]): string {
    return `
You are an expert timetable data enhancer. Review and improve the following parsed timetable events.

CURRENT EVENTS:
${JSON.stringify(events, null, 2)}

${rawData ? `ORIGINAL RAW DATA:
${JSON.stringify(rawData.slice(0, 5), null, 2)}` : ''}

ENHANCEMENT TASKS:
1. **Clean and standardize titles**: Remove redundant words, fix capitalization
2. **Detect duplicates**: Identify and merge similar events
3. **Enhance missing data**: Infer missing instructors, course codes, or room details
4. **Standardize locations**: Ensure consistent "Room X, Building Y" format
5. **Validate event types**: Ensure correct classification (lecture/lab/tutorial/meeting)
6. **Fix time formats**: Ensure all times are in HH:MM - HH:MM format

RULES:
- Keep all original event IDs unchanged
- Only enhance/clean existing data, don't add completely new events
- Mark confidence level for each enhancement
- List which fields were enhanced

OUTPUT FORMAT (JSON):
{
  "enhancedEvents": [
    {
      "id": "original_id",
      "title": "cleaned_title",
      "time": "HH:MM - HH:MM",
      "date": "YYYY-MM-DD",
      "location": "standardized_location",
      "type": "lecture|lab|tutorial|meeting|break",
      "duration": "Xh Ym",
      "instructor": "enhanced_if_possible",
      "courseCode": "enhanced_if_possible",
      "room": "extracted_room",
      "building": "extracted_building"
    }
  ],
  "duplicates": [
    {
      "duplicateIds": ["id1", "id2"],
      "mergedEvent": { /* merged event data */ }
    }
  ],
  "enhancedFields": ["title", "location", "instructor"],
  "confidence": 85
}

Enhance the events now:
`;
  }

  /**
   * Build comprehensive parsing prompt for LLM
   */
  private buildParsingPrompt(content: string, fileType: string): string {
    return `
You are an expert timetable parser. Extract structured schedule information from the following ${fileType} content.

CONTENT TO PARSE:
${content}

INSTRUCTIONS:
1. Extract all schedule/timetable events
2. Handle various formats and convert to standard structure
3. Generate unique IDs for each event
4. Convert dates/times to standard formats
5. Classify event types intelligently

OUTPUT FORMAT (JSON):
{
  "events": [
    {
      "id": "unique_id",
      "title": "Course/Event Name",
      "time": "HH:MM - HH:MM",
      "date": "YYYY-MM-DD",
      "location": "Full location",
      "type": "lecture|lab|tutorial|meeting|break",
      "duration": "Xh Ym",
      "instructor": "Name (if available)",
      "courseCode": "Code (if available)",
      "room": "Room number/name",
      "building": "Building name"
    }
  ],
  "confidence": 85
}

Parse now:
`;
  }

  /**
   * Parse using OpenAI GPT
   */
  private async parseWithOpenAI(prompt: string): Promise<ParseResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert timetable parser. Always return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return this.parseJSONResponse(content);
    } catch (error) {
      return {
        success: false,
        events: [],
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'OpenAI parsing failed']
      };
    }
  }

  /**
   * Enhance events using OpenAI
   */
  private async enhanceWithOpenAI(prompt: string, originalEvents: ParsedTimetableEvent[]): Promise<ParseResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert data enhancer. Always return valid JSON with enhanced timetable data.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return this.parseEnhancementResponse(content, originalEvents);
    } catch (error) {
      return {
        success: false,
        events: originalEvents,
        confidence: 70,
        errors: [error instanceof Error ? error.message : 'OpenAI enhancement failed']
      };
    }
  }

  /**
   * Parse using Google Gemini
   */
  private async parseWithGemini(prompt: string): Promise<ParseResult> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2000
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('No response from Gemini');
      }

      return this.parseJSONResponse(content);
    } catch (error) {
      return {
        success: false,
        events: [],
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'Gemini parsing failed']
      };
    }
  }

  /**
   * Enhance events using Google Gemini
   */
  private async enhanceWithGemini(prompt: string, originalEvents: ParsedTimetableEvent[]): Promise<ParseResult> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2000
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('No response from Gemini');
      }

      return this.parseEnhancementResponse(content, originalEvents);
    } catch (error) {
      return {
        success: false,
        events: originalEvents,
        confidence: 70,
        errors: [error instanceof Error ? error.message : 'Gemini enhancement failed']
      };
    }
  }

  /**
   * Parse and validate JSON response from LLM
   */
  private parseJSONResponse(content: string): ParseResult {
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      
      const events = parsed.events || [];
      const confidence = parsed.confidence || 75;
      
      if (!Array.isArray(events)) {
        throw new Error('Events is not an array');
      }

      const validatedEvents = events.map((event, index) => ({
        id: event.id || `llm-parsed-${Date.now()}-${index}`,
        title: event.title || 'Untitled Event',
        time: event.time || '09:00 - 10:00',
        date: event.date || this.getNextWeekday(0),
        location: event.location || 'TBD',
        type: this.validateEventType(event.type),
        duration: event.duration || this.calculateDuration(event.time),
        instructor: event.instructor || undefined,
        courseCode: event.courseCode || undefined,
        room: event.room || undefined,
        building: event.building || undefined
      }));

      return {
        success: true,
        events: validatedEvents,
        confidence,
        rawResponse: content
      };
    } catch (error) {
      return {
        success: false,
        events: [],
        confidence: 0,
        errors: [`JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        rawResponse: content
      };
    }
  }

  /**
   * Parse enhancement response from LLM
   */
  private parseEnhancementResponse(content: string, originalEvents: ParsedTimetableEvent[]): ParseResult {
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      
      const enhancedEvents = parsed.enhancedEvents || originalEvents;
      const confidence = parsed.confidence || 80;
      const enhancedFields = parsed.enhancedFields || [];
      
      return {
        success: true,
        events: enhancedEvents,
        confidence,
        enhancedFields,
        rawResponse: content
      };
    } catch (error) {
      return {
        success: false,
        events: originalEvents,
        confidence: 70,
        errors: [`Enhancement parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        rawResponse: content
      };
    }
  }

  /**
   * Validate event type
   */
  private validateEventType(type: string): 'lecture' | 'lab' | 'tutorial' | 'meeting' | 'break' {
    const validTypes = ['lecture', 'lab', 'tutorial', 'meeting', 'break'];
    const normalizedType = type?.toLowerCase();
    
    if (validTypes.includes(normalizedType)) {
      return normalizedType as any;
    }
    
    if (normalizedType?.includes('lab')) return 'lab';
    if (normalizedType?.includes('tutorial') || normalizedType?.includes('seminar')) return 'tutorial';
    if (normalizedType?.includes('meeting')) return 'meeting';
    if (normalizedType?.includes('break')) return 'break';
    
    return 'lecture';
  }

  /**
   * Calculate duration from time string
   */
  private calculateDuration(timeString: string): string {
    try {
      const [start, end] = timeString.split(' - ');
      const startTime = this.parseTimeString(start);
      const endTime = this.parseTimeString(end);
      
      const diffMs = endTime.getTime() - startTime.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHours > 0 && diffMinutes > 0) {
        return `${diffHours}h ${diffMinutes}m`;
      } else if (diffHours > 0) {
        return `${diffHours}h`;
      } else {
        return `${diffMinutes}m`;
      }
    } catch {
      return '1h 30m';
    }
  }

  /**
   * Parse time string to Date object
   */
  private parseTimeString(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Get next weekday date
   */
  private getNextWeekday(dayOfWeek: number): string {
    const today = new Date();
    const daysUntilTarget = (dayOfWeek + 7 - today.getDay()) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate.toISOString().split('T')[0];
  }
}

/**
 * Factory function to create parser with environment variables
 */
export function createLLMParser(): LLMTimetableParser | null {
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (openaiKey) {
    return new LLMTimetableParser({
      provider: 'openai',
      apiKey: openaiKey,
      model: 'gpt-3.5-turbo'
    });
  } else if (geminiKey) {
    return new LLMTimetableParser({
      provider: 'gemini',
      apiKey: geminiKey,
      model: 'gemini-pro'
    });
  }
  
  return null;
}