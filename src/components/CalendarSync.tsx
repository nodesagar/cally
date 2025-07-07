import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Settings, 
  Plus,
  ExternalLink,
  Shield,
  Clock,
  Users,
  RefreshCw
} from 'lucide-react';
import { GoogleAuthService } from '../services/google-auth';
import { GoogleCalendarService } from '../services/google-calendar';
import { ParsedTimetableEvent, CalendarListItem, SyncResult } from '../types/calendar';

interface CalendarSyncProps {
  events: ParsedTimetableEvent[];
  onSyncComplete: (result: SyncResult) => void;
  onBack: () => void;
}

interface SyncProgress {
  completed: number;
  total: number;
  currentEvent: string;
}

const CalendarSync: React.FC<CalendarSyncProps> = ({ events, onSyncComplete, onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email: string; name: string; picture?: string } | null>(null);
  const [calendars, setCalendars] = useState<CalendarListItem[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>('');
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createNewCalendar, setCreateNewCalendar] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('ChronoSync Timetable');

  const authService = GoogleAuthService.getInstance();
  const calendarService = GoogleCalendarService.getInstance();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserInfo();
      loadCalendars();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = () => {
    setIsAuthenticated(authService.isAuthenticated());
  };

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      await authService.authenticate();
      setIsAuthenticated(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loadUserInfo = async () => {
    try {
      const info = await authService.getUserInfo();
      setUserInfo(info);
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  const loadCalendars = async () => {
    setIsLoadingCalendars(true);
    try {
      const calendarList = await calendarService.getCalendarList();
      setCalendars(calendarList);
      
      // Auto-select primary calendar
      const primaryCalendar = calendarList.find(cal => cal.primary);
      if (primaryCalendar) {
        setSelectedCalendar(primaryCalendar.id);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load calendars');
    } finally {
      setIsLoadingCalendars(false);
    }
  };

  const handleCreateCalendar = async () => {
    try {
      const calendarId = await calendarService.createTimetableCalendar(newCalendarName);
      await loadCalendars();
      setSelectedCalendar(calendarId);
      setCreateNewCalendar(false);
      setNewCalendarName('ChronoSync Timetable');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create calendar');
    }
  };

  const handleSync = async () => {
    if (!selectedCalendar) {
      setError('Please select a calendar');
      return;
    }

    setIsSyncing(true);
    setError(null);
    setSyncProgress(null);

    try {
      const result = await calendarService.syncEvents(
        selectedCalendar,
        events,
        (progress) => setSyncProgress(progress)
      );

      onSyncComplete(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setIsAuthenticated(false);
      setUserInfo(null);
      setCalendars([]);
      setSelectedCalendar('');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-black relative transition-colors duration-300">
        {/* Mesh Background */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} className="text-black dark:text-white"></div>
        </div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                <Calendar className="w-10 h-10 text-white dark:text-black" />
              </div>
              <h1 className="text-3xl font-extralight text-black dark:text-white mb-4 tracking-tight transition-colors duration-300">
                Connect to Google Calendar
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed transition-colors duration-300">
                Sign in with your Google account to sync your timetable events to Google Calendar.
              </p>
            </div>

            {/* Security Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 border border-gray-100 dark:border-gray-900 bg-white dark:bg-black transition-colors duration-300">
                <Shield className="w-8 h-8 text-black dark:text-white mx-auto mb-4 transition-colors duration-300" />
                <h3 className="font-light text-black dark:text-white mb-2 transition-colors duration-300">Secure OAuth</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">
                  Industry-standard OAuth 2.0 authentication
                </p>
              </div>
              <div className="p-6 border border-gray-100 dark:border-gray-900 bg-white dark:bg-black transition-colors duration-300">
                <Clock className="w-8 h-8 text-black dark:text-white mx-auto mb-4 transition-colors duration-300" />
                <h3 className="font-light text-black dark:text-white mb-2 transition-colors duration-300">Limited Access</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">
                  Only calendar permissions, no other data
                </p>
              </div>
              <div className="p-6 border border-gray-100 dark:border-gray-900 bg-white dark:bg-black transition-colors duration-300">
                <Users className="w-8 h-8 text-black dark:text-white mx-auto mb-4 transition-colors duration-300" />
                <h3 className="font-light text-black dark:text-white mb-2 transition-colors duration-300">Your Control</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">
                  Revoke access anytime from Google settings
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-8 p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 transition-colors duration-300">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-light">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleAuthenticate}
                disabled={isAuthenticating}
                className="w-full px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-light tracking-wide hover:bg-gray-900 dark:hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>

              <button
                onClick={onBack}
                className="w-full px-8 py-4 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-light tracking-wide hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white"
              >
                Back to Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black relative transition-colors duration-300">
      {/* Mesh Background */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} className="text-black dark:text-white"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extralight text-black dark:text-white mb-4 tracking-tight transition-colors duration-300">
                Sync to Google Calendar
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">
                Choose a calendar and sync your {events.length} events
              </p>
            </div>
            
            {userInfo && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-light text-black dark:text-white transition-colors duration-300">
                    {userInfo.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    {userInfo.email}
                  </div>
                </div>
                {userInfo.picture && (
                  <img 
                    src={userInfo.picture} 
                    alt={userInfo.name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-light transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Selection */}
        <div className="border border-gray-100 dark:border-gray-900 p-8 mb-8 bg-white dark:bg-black transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-light text-black dark:text-white tracking-wide transition-colors duration-300">
              Select Calendar
            </h2>
            <button
              onClick={loadCalendars}
              disabled={isLoadingCalendars}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingCalendars ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isLoadingCalendars ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600 dark:text-gray-400 font-light">Loading calendars...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {calendars.map((calendar) => (
                <label
                  key={calendar.id}
                  className="flex items-center space-x-4 p-4 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer transition-all"
                >
                  <input
                    type="radio"
                    name="calendar"
                    value={calendar.id}
                    checked={selectedCalendar === calendar.id}
                    onChange={(e) => setSelectedCalendar(e.target.value)}
                    className="w-4 h-4 text-black dark:text-white"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-light text-black dark:text-white transition-colors duration-300">
                        {calendar.summary}
                      </span>
                      {calendar.primary && (
                        <span className="px-2 py-1 text-xs bg-black dark:bg-white text-white dark:text-black font-light">
                          Primary
                        </span>
                      )}
                    </div>
                    {calendar.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-light mt-1 transition-colors duration-300">
                        {calendar.description}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </label>
              ))}

              {/* Create New Calendar Option */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <button
                  onClick={() => setCreateNewCalendar(!createNewCalendar)}
                  className="flex items-center space-x-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 font-light transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create new calendar</span>
                </button>

                {createNewCalendar && (
                  <div className="mt-4 p-4 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={newCalendarName}
                        onChange={(e) => setNewCalendarName(e.target.value)}
                        placeholder="Calendar name"
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 font-light focus:ring-2 focus:ring-black dark:focus:ring-black focus:border-black dark:focus:border-white bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors duration-300"
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={handleCreateCalendar}
                          className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-light tracking-wide hover:bg-gray-900 dark:hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white"
                        >
                          Create
                        </button>
                        <button
                          onClick={() => setCreateNewCalendar(false)}
                          className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-light tracking-wide hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sync Progress */}
        {isSyncing && syncProgress && (
          <div className="border border-gray-100 dark:border-gray-900 p-8 mb-8 bg-white dark:bg-black transition-colors duration-300">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-black dark:text-white mx-auto mb-4 transition-colors duration-300" />
              <h3 className="text-lg font-light text-black dark:text-white mb-2 tracking-wide transition-colors duration-300">
                Syncing Events
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-light mb-4 transition-colors duration-300">
                {syncProgress.currentEvent}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-2">
                <div 
                  className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(syncProgress.completed / syncProgress.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">
                {syncProgress.completed} of {syncProgress.total} events
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="border border-red-200 dark:border-red-800 p-6 mb-8 bg-red-50 dark:bg-red-950 transition-colors duration-300">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-light text-red-800 dark:text-red-200 mb-1">Sync Error</h3>
                <p className="text-red-700 dark:text-red-300 font-light">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={handleSync}
            disabled={!selectedCalendar || isSyncing}
            className={`px-12 py-4 font-light tracking-wide transition-all duration-300 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              selectedCalendar && !isSyncing
                ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 focus:ring-black dark:focus:ring-black dark:focus:ring-offset-white'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                <span>Sync {events.length} Events</span>
              </>
            )}
          </button>
          
          <button
            onClick={onBack}
            disabled={isSyncing}
            className="px-12 py-4 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-light tracking-wide hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white"
          >
            Back to Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarSync;