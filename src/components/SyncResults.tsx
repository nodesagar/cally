import React from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Calendar,
  ArrowRight,
  RefreshCw,
  Download
} from 'lucide-react';
import { SyncResult } from '../types/calendar';

interface SyncResultsProps {
  result: SyncResult;
  onNavigateToDashboard: () => void;
  onSyncMore: () => void;
}

const SyncResults: React.FC<SyncResultsProps> = ({ 
  result, 
  onNavigateToDashboard, 
  onSyncMore 
}) => {
  const successRate = result.eventsCreated / (result.eventsCreated + result.eventsFailed) * 100;

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
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
            {result.success ? (
              <CheckCircle className="w-10 h-10 text-white dark:text-black" />
            ) : (
              <AlertCircle className="w-10 h-10 text-white dark:text-black" />
            )}
          </div>
          
          <h1 className="text-4xl font-extralight text-black dark:text-white mb-4 tracking-tight transition-colors duration-300">
            {result.success ? 'Sync Complete!' : 'Sync Completed with Issues'}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed transition-colors duration-300">
            {result.success 
              ? 'Your timetable has been successfully synced to Google Calendar.'
              : 'Some events were synced successfully, but there were issues with others.'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border border-gray-100 dark:border-gray-900 p-8 bg-white dark:bg-black transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-gray-600 dark:text-gray-400 tracking-wide transition-colors duration-300">
                  Events Created
                </p>
                <p className="text-3xl font-extralight text-black dark:text-white transition-colors duration-300">
                  {result.eventsCreated}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-black dark:text-white transition-colors duration-300" />
            </div>
          </div>

          <div className="border border-gray-100 dark:border-gray-900 p-8 bg-white dark:bg-black transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-gray-600 dark:text-gray-400 tracking-wide transition-colors duration-300">
                  Success Rate
                </p>
                <p className="text-3xl font-extralight text-black dark:text-white transition-colors duration-300">
                  {Math.round(successRate)}%
                </p>
              </div>
              <Calendar className="w-8 h-8 text-black dark:text-white transition-colors duration-300" />
            </div>
          </div>

          <div className="border border-gray-100 dark:border-gray-900 p-8 bg-white dark:bg-black transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-gray-600 dark:text-gray-400 tracking-wide transition-colors duration-300">
                  Failed Events
                </p>
                <p className="text-3xl font-extralight text-black dark:text-white transition-colors duration-300">
                  {result.eventsFailed}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-black dark:text-white transition-colors duration-300" />
            </div>
          </div>
        </div>

        {/* Error Details */}
        {result.errors.length > 0 && (
          <div className="border border-red-200 dark:border-red-800 p-8 mb-12 bg-red-50 dark:bg-red-950 transition-colors duration-300">
            <h3 className="text-lg font-light text-red-800 dark:text-red-200 mb-6 tracking-wide">
              Events That Failed to Sync
            </h3>
            <div className="space-y-4">
              {result.errors.map((error, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-light text-red-800 dark:text-red-200">
                      Event ID: {error.eventId}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 font-light">
                      {error.error}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="border border-gray-100 dark:border-gray-900 p-8 mb-12 bg-white dark:bg-black transition-colors duration-300">
          <h3 className="text-lg font-light text-black dark:text-white mb-6 tracking-wide transition-colors duration-300">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => window.open('https://calendar.google.com', '_blank')}
              className="flex items-center justify-between p-6 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all group focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white"
            >
              <div className="flex items-center space-x-4">
                <Calendar className="w-6 h-6 text-black dark:text-white transition-colors duration-300" />
                <div className="text-left">
                  <p className="font-light text-black dark:text-white transition-colors duration-300">
                    View in Google Calendar
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">
                    See your synced events
                  </p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => {
                const data = JSON.stringify(result, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sync-report.json';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center justify-between p-6 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all group focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white"
            >
              <div className="flex items-center space-x-4">
                <Download className="w-6 h-6 text-black dark:text-white transition-colors duration-300" />
                <div className="text-left">
                  <p className="font-light text-black dark:text-white transition-colors duration-300">
                    Download Report
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">
                    Save sync details
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={onNavigateToDashboard}
            className="px-12 py-4 bg-black dark:bg-white text-white dark:text-black font-light tracking-wide hover:bg-gray-900 dark:hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white"
          >
            <Calendar className="w-5 h-5" />
            <span>Go to Dashboard</span>
          </button>
          
          <button
            onClick={onSyncMore}
            className="px-12 py-4 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-light tracking-wide hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Sync More Events</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncResults;