import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Bell,
  Settings,
  Download,
  Share2,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  Grid3X3
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  location: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'meeting' | 'break';
  status: 'synced' | 'pending' | 'failed';
  calendar: 'Google' | 'Outlook' | 'Apple';
  reminders: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Advanced Algorithms',
      time: '09:00 - 10:30',
      date: '2024-01-15',
      location: 'Room 101, Computer Science Building',
      type: 'lecture',
      status: 'synced',
      calendar: 'Google',
      reminders: ['15 min before', '1 hour before']
    },
    {
      id: '2',
      title: 'Database Systems Lab',
      time: '11:00 - 12:30',
      date: '2024-01-15',
      location: 'Lab 205, Engineering Building',
      type: 'lab',
      status: 'synced',
      calendar: 'Google',
      reminders: ['30 min before']
    },
    {
      id: '3',
      title: 'Machine Learning',
      time: '14:00 - 15:30',
      date: '2024-01-16',
      location: 'Lecture Hall A',
      type: 'lecture',
      status: 'pending',
      calendar: 'Google',
      reminders: ['15 min before']
    },
    {
      id: '4',
      title: 'Software Engineering',
      time: '10:00 - 11:30',
      date: '2024-01-17',
      location: 'Room 303, CS Building',
      type: 'tutorial',
      status: 'synced',
      calendar: 'Google',
      reminders: ['15 min before', '1 hour before']
    },
    {
      id: '5',
      title: 'Project Meeting',
      time: '15:00 - 16:00',
      date: '2024-01-17',
      location: 'Conference Room B',
      type: 'meeting',
      status: 'failed',
      calendar: 'Google',
      reminders: ['10 min before']
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'border-l-4 border-black dark:border-white';
      case 'lab': return 'border-l-4 border-gray-600 dark:border-gray-400';
      case 'tutorial': return 'border-l-4 border-gray-400 dark:border-gray-500';
      case 'meeting': return 'border-l-4 border-gray-500 dark:border-gray-400';
      case 'break': return 'border-l-4 border-gray-300 dark:border-gray-600';
      default: return 'border-l-4 border-gray-300 dark:border-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'text-black dark:text-white';
      case 'pending': return 'text-gray-600 dark:text-gray-400';
      case 'failed': return 'text-gray-400 dark:text-gray-500';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = selectedFilter === 'all' || event.type === selectedFilter || event.status === selectedFilter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = [
    { label: 'Total Events', value: events.length, icon: <Calendar className="w-5 h-5" />, color: 'bg-black dark:bg-white' },
    { label: 'Synced', value: events.filter(e => e.status === 'synced').length, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-gray-700 dark:bg-gray-300' },
    { label: 'Pending', value: events.filter(e => e.status === 'pending').length, icon: <Clock className="w-5 h-5" />, color: 'bg-gray-500 dark:bg-gray-400' },
    { label: 'Failed', value: events.filter(e => e.status === 'failed').length, icon: <AlertCircle className="w-5 h-5" />, color: 'bg-gray-400 dark:bg-gray-500' }
  ];

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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-extralight text-black dark:text-white tracking-tight transition-colors duration-300">Dashboard</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">
                Manage your synced calendar events and settings
              </p>
            </div>
            <div className="mt-6 sm:mt-0 flex space-x-4">
              <button
                onClick={() => onNavigate('upload')}
                className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-light tracking-wide hover:bg-gray-900 dark:hover:bg-gray-100 transition-all duration-300 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-black"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New</span>
              </button>
              <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-light tracking-wide hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all duration-300 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-black">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="border border-gray-100 dark:border-gray-800 p-8 bg-white dark:bg-black transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-light text-gray-600 dark:text-gray-400 tracking-wide transition-colors duration-300">{stat.label}</p>
                  <p className="text-3xl font-extralight text-black dark:text-white transition-colors duration-300">{stat.value}</p>
                </div>
                <div className={`p-3 ${stat.color} text-white dark:text-black transition-colors duration-300`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="border border-gray-100 dark:border-gray-800 p-8 mb-12 bg-white dark:bg-black transition-colors duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 font-light focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-200 dark:border-gray-700 px-4 py-3 font-light focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-black text-black dark:text-white transition-colors duration-300"
                >
                  <option value="all">All Events</option>
                  <option value="lecture">Lectures</option>
                  <option value="lab">Labs</option>
                  <option value="tutorial">Tutorials</option>
                  <option value="meeting">Meetings</option>
                  <option value="synced">Synced</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 text-sm font-light tracking-wide transition-all ${
                    viewMode === 'list' 
                      ? 'bg-black dark:bg-white text-white dark:text-black' 
                      : 'bg-white dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-3 text-sm font-light tracking-wide transition-all ${
                    viewMode === 'calendar' 
                      ? 'bg-black dark:bg-white text-white dark:text-black' 
                      : 'bg-white dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  Calendar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-black transition-colors duration-300">
          <div className="p-8 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-light text-black dark:text-white tracking-wide transition-colors duration-300">
                Your Events ({filteredEvents.length})
              </h2>
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-black">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-black">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredEvents.map((event) => (
              <div key={event.id} className="p-8 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <div className="flex items-start justify-between">
                  <div className={`flex-1 pl-4 ${getEventTypeColor(event.type)} transition-colors duration-300`}>
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-lg font-light text-black dark:text-white tracking-wide transition-colors duration-300">
                        {event.title}
                      </h3>
                      <span className="px-3 py-1 text-xs font-light tracking-wide text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black transition-colors duration-300">
                        {event.type}
                      </span>
                      <div className={`flex items-center space-x-2 ${getStatusColor(event.status)} transition-colors duration-300`}>
                        {getStatusIcon(event.status)}
                        <span className="text-sm font-light capitalize">{event.status}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 font-light transition-colors duration-300">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4" />
                        <span>{event.reminders.length} reminders</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Grid3X3 className="w-4 h-4" />
                        <span>{event.calendar} Calendar</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-6">
                    <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-black">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-black">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-black">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="p-16 text-center">
              <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-6 transition-colors duration-300" />
              <h3 className="text-lg font-light text-black dark:text-white mb-3 tracking-wide transition-colors duration-300">
                No events found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 font-light transition-colors duration-300">
                {searchTerm || selectedFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first timetable to get started'
                }
              </p>
              <button
                onClick={() => onNavigate('upload')}
                className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-light tracking-wide hover:bg-gray-900 dark:hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-black"
              >
                Upload Timetable
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;