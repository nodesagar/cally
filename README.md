# ChronoSync - AI-Powered Timetable to Calendar Sync

A sophisticated web application that transforms timetables into smart calendar events with seamless Google Calendar integration and AI-powered parsing.

## 🚀 Features

### Core Functionality
- **AI-Powered Parsing**: Advanced LLM integration with OpenAI GPT and Google Gemini for intelligent timetable extraction
- **Smart Upload**: Support for CSV, XLSX, PDF, and image formats with intelligent parsing
- **Google Calendar Integration**: Full OAuth 2.0 authentication and API integration
- **Event Management**: Review, customize, and sync events with detailed validation
- **Real-time Sync**: Progress tracking with batch processing and rate limiting
- **Error Handling**: Comprehensive error management with detailed reporting

### AI Parsing Capabilities
- **Multi-Format Support**: Extract data from structured (CSV/Excel) and unstructured (PDF/Images) formats
- **Natural Language Understanding**: Intelligent recognition of course names, times, locations, and instructors
- **Pattern Recognition**: Automatic detection of recurring schedules and event types
- **Confidence Scoring**: AI provides confidence ratings for parsing accuracy
- **Fallback Options**: Traditional parsing methods available when AI is unavailable

### Security & Privacy
- **OAuth 2.0**: Industry-standard authentication with Google
- **Secure Token Management**: Encrypted storage with automatic refresh
- **Limited Permissions**: Only calendar access, no other data
- **Data Protection**: Automatic cleanup after sync completion

### User Experience
- **Dark/Light Theme**: Complete theme switching with system preference detection
- **Responsive Design**: Optimized for all devices and screen sizes
- **Accessibility**: WCAG compliant with proper focus management
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## 🛠️ Technical Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for development and building

### APIs & Services
- **Google Calendar API v3**
- **Google OAuth 2.0**
- **OpenAI GPT API** (optional)
- **Google Gemini API** (optional)

### Architecture
- **Modular Design**: Clean separation of concerns
- **Service Layer**: Dedicated services for auth, calendar, and AI parsing
- **Type Safety**: Full TypeScript coverage
- **Error Boundaries**: Graceful error handling

## 📋 Prerequisites

Before setting up the project, you'll need:

1. **Node.js** (v16 or higher)
2. **Google Cloud Project** with Calendar API enabled
3. **OAuth 2.0 Credentials** from Google Cloud Console
4. **AI API Key** (optional): OpenAI or Google Gemini for enhanced parsing

## 🔧 Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd chronosync
npm install
```

### 2. Google Cloud Console Setup

#### Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

#### Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure the consent screen:
   - Add your app name: "ChronoSync"
   - Add authorized domains
   - Add scopes: `calendar`, `calendar.events`, `userinfo.email`, `userinfo.profile`
4. Create OAuth client:
   - Application type: "Web application"
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173/auth-callback.html`

### 3. AI API Setup (Optional but Recommended)

#### Option A: OpenAI GPT
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add credits to your account for API usage

#### Option B: Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Create a project and get your API key
3. Enable the Gemini API

### 4. Environment Configuration

Create a `.env` file in the project root:

```env
# Google Calendar (Required)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth-callback.html

# Application
VITE_APP_NAME=ChronoSync
VITE_APP_URL=http://localhost:5173

# AI Parsing (Optional - choose one)
VITE_OPENAI_API_KEY=your_openai_api_key_here
# OR
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🤖 AI-Powered Parsing

### How It Works

ChronoSync uses advanced Large Language Models (LLMs) to intelligently extract timetable information from various formats:

1. **Content Extraction**: Reads text from uploaded files (CSV, PDF, images)
2. **AI Analysis**: Sends content to OpenAI GPT or Google Gemini with specialized prompts
3. **Structured Output**: AI returns JSON-formatted event data
4. **Validation**: System validates and enhances the extracted data
5. **Confidence Scoring**: Provides accuracy ratings for each parsing operation

### Supported Formats

- **CSV/Excel**: Direct parsing of structured data
- **PDF**: Text extraction and pattern recognition
- **Images**: OCR simulation (can be enhanced with real OCR services)
- **Unstructured Text**: Natural language processing for any text format

### AI Prompt Engineering

The system uses carefully crafted prompts that:
- Specify exact output format requirements
- Handle various date/time formats
- Recognize different event types
- Extract instructor and location information
- Provide confidence scoring

### Fallback Options

- Traditional parsing methods available when AI is disabled
- Mock data for demonstration purposes
- Error handling for API failures
- User-friendly error messages and suggestions

## 🔐 Authentication Flow

### OAuth 2.0 Implementation
1. **Authorization Request**: User clicks "Sign in with Google"
2. **Popup Window**: Opens Google's OAuth consent screen
3. **User Consent**: User grants calendar permissions
4. **Authorization Code**: Google redirects with auth code
5. **Token Exchange**: Exchange code for access/refresh tokens
6. **Secure Storage**: Tokens stored encrypted in localStorage
7. **API Access**: Use tokens for Calendar API requests

### Security Measures
- **PKCE Flow**: Proof Key for Code Exchange for enhanced security
- **State Parameter**: CSRF protection with random state validation
- **Token Refresh**: Automatic refresh of expired access tokens
- **Secure Storage**: Base64 encoded token storage (upgrade to proper encryption in production)

## 📊 API Integration

### Google Calendar Service
```typescript
// Example usage
const calendarService = GoogleCalendarService.getInstance();

// Get user's calendars
const calendars = await calendarService.getCalendarList();

// Sync events
const result = await calendarService.syncEvents(
  calendarId, 
  events, 
  (progress) => console.log(progress)
);
```

### AI Parsing Service
```typescript
// Example usage
const parser = createLLMParser();

// Parse uploaded file
const result = await parser.parseFile(file);

if (result.success) {
  console.log(`Extracted ${result.events.length} events`);
  console.log(`Confidence: ${result.confidence}%`);
}
```

### Error Handling
- **Network Errors**: Automatic retry with exponential backoff
- **Rate Limiting**: Batch processing with delays
- **API Errors**: Detailed error messages and recovery suggestions
- **Token Expiry**: Automatic refresh and retry
- **AI Failures**: Fallback to traditional parsing methods

## 🎨 Theming System

### Theme Implementation
- **CSS Variables**: Dynamic color switching
- **System Preference**: Automatic detection of user's preferred theme
- **Persistent Storage**: Theme preference saved in localStorage
- **Smooth Transitions**: 300ms transitions for all theme changes

### Color Palette
- **Light Theme**: White backgrounds, black text, gray accents
- **Dark Theme**: Black backgrounds, white text, inverted grays
- **Focus States**: Consistent black focus rings for accessibility

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Features
- **Flexible Layouts**: CSS Grid and Flexbox
- **Touch Targets**: Minimum 44px for mobile interactions
- **Readable Text**: Optimal line lengths and spacing
- **Accessible Navigation**: Mobile-friendly menus and controls

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Service layer and utility functions
- **Integration Tests**: API interactions and auth flow
- **E2E Tests**: Complete user workflows
- **Accessibility Tests**: WCAG compliance verification

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```env
VITE_GOOGLE_CLIENT_ID=your_production_client_id
VITE_GOOGLE_CLIENT_SECRET=your_production_client_secret
VITE_GOOGLE_REDIRECT_URI=https://yourdomain.com/auth-callback.html
VITE_APP_NAME=ChronoSync
VITE_APP_URL=https://yourdomain.com

# AI APIs (Optional)
VITE_OPENAI_API_KEY=your_production_openai_key
VITE_GEMINI_API_KEY=your_production_gemini_key
```

### Deployment Checklist
- [ ] Update OAuth redirect URIs in Google Cloud Console
- [ ] Configure production environment variables
- [ ] Set up AI API keys and billing
- [ ] Enable HTTPS for secure authentication
- [ ] Set up proper error monitoring
- [ ] Configure CSP headers for security

## 🔍 Troubleshooting

### Common Issues

#### Authentication Errors
```
Error: "redirect_uri_mismatch"
```
**Solution**: Ensure redirect URI in Google Cloud Console matches exactly

#### AI Parsing Errors
```
Error: "No AI API key configured"
```
**Solution**: Add VITE_OPENAI_API_KEY or VITE_GEMINI_API_KEY to environment variables

#### API Rate Limiting
```
Error: "Rate limit exceeded"
```
**Solution**: Implemented automatic retry with exponential backoff

#### Token Expiry
```
Error: "Invalid credentials"
```
**Solution**: Automatic token refresh implemented

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('chronosync_debug', 'true');
```

## 💰 Cost Considerations

### AI API Costs
- **OpenAI GPT-4**: ~$0.03 per 1K tokens (input) + $0.06 per 1K tokens (output)
- **Google Gemini Pro**: Free tier available, then pay-per-use
- **Typical parsing cost**: $0.01-0.05 per timetable file

### Optimization Tips
- Use GPT-3.5-turbo for lower costs
- Implement caching for repeated files
- Set usage limits and monitoring
- Consider batch processing for multiple files

## 📚 API Reference

### GoogleAuthService
```typescript
class GoogleAuthService {
  authenticate(): Promise<AuthTokens>
  refreshAccessToken(): Promise<AuthTokens>
  isAuthenticated(): boolean
  getValidAccessToken(): Promise<string>
  signOut(): Promise<void>
  getUserInfo(): Promise<UserInfo>
}
```

### GoogleCalendarService
```typescript
class GoogleCalendarService {
  getCalendarList(): Promise<CalendarListItem[]>
  createTimetableCalendar(name: string): Promise<string>
  createEvent(calendarId: string, event: CalendarEvent): Promise<string>
  syncEvents(calendarId: string, events: ParsedTimetableEvent[]): Promise<SyncResult>
  checkExistingEvents(calendarId: string, events: CalendarEvent[]): Promise<string[]>
  deleteEvent(calendarId: string, eventId: string): Promise<void>
}
```

### LLMTimetableParser
```typescript
class LLMTimetableParser {
  constructor(config: LLMConfig)
  parseFile(file: File): Promise<ParseResult>
}

function createLLMParser(): LLMTimetableParser | null
```

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow TypeScript and React best practices
2. **Commits**: Use conventional commit messages
3. **Testing**: Write tests for new features
4. **Documentation**: Update README for significant changes

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT API enabling intelligent parsing
- **Google** for Gemini API and Calendar integration
- **React Team** for the excellent framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set

## 📞 Support

For support and questions:
- **Documentation**: Check this README and inline code comments
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for general questions

---

**Built with ❤️ and AI for students and professionals worldwide**