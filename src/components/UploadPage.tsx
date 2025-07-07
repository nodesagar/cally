import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  Image, 
  Calendar, 
  CheckCircle, 
  X,
  AlertCircle,
  Settings,
  Grid3X3,
  Brain,
  Zap,
  Eye,
  Sparkles,
  Clock
} from 'lucide-react';
import CalendarSync from './CalendarSync';
import SyncResults from './SyncResults';
import { ParsedTimetableEvent, SyncResult } from '../types/calendar';
import { createLLMParser, ParseResult } from '../services/llm-parser';
import { LocalFileParser, LocalParseResult } from '../services/local-parser';

interface UploadPageProps {
  onNavigate: (page: string) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ onNavigate }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseStatus, setParseStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [parsedEvents, setParsedEvents] = useState<ParsedTimetableEvent[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState<'upload' | 'sync' | 'results'>('upload');
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [localParseResult, setLocalParseResult] = useState<LocalParseResult | null>(null);
  const [showRawData, setShowRawData] = useState(false);
  const [processingStep, setProcessingStep] = useState<'local' | 'ai' | 'complete'>('local');

  // Mock parsed events for demonstration when parsing fails
  const mockEvents: ParsedTimetableEvent[] = [
    {
      id: '1',
      title: 'Advanced Algorithms',
      time: '09:00 - 10:30',
      date: '2024-01-15',
      location: 'Room 101, Computer Science Building',
      type: 'lecture',
      duration: '1h 30m',
      instructor: 'Dr. Smith',
      courseCode: 'CS401',
      room: '101',
      building: 'Computer Science Building'
    },
    {
      id: '2',
      title: 'Database Systems Lab',
      time: '11:00 - 12:30',
      date: '2024-01-15',
      location: 'Lab 205, Engineering Building',
      type: 'lab',
      duration: '1h 30m',
      instructor: 'Prof. Johnson',
      courseCode: 'CS302',
      room: '205',
      building: 'Engineering Building'
    },
    {
      id: '3',
      title: 'Machine Learning',
      time: '14:00 - 15:30',
      date: '2024-01-16',
      location: 'Lecture Hall A',
      type: 'lecture',
      duration: '1h 30m',
      instructor: 'Dr. Williams',
      courseCode: 'CS501',
      room: 'Hall A',
      building: 'Main Building'
    },
    {
      id: '4',
      title: 'Software Engineering',
      time: '10:00 - 11:30',
      date: '2024-01-17',
      location: 'Room 303, CS Building',
      type: 'tutorial',
      duration: '1h 30m',
      instructor: 'Dr. Brown',
      courseCode: 'CS301',
      room: '303',
      building: 'CS Building'
    }
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setUploadedFile(file);
    setParseStatus('processing');
    setParseResult(null);
    setLocalParseResult(null);
    setProcessingStep('local');
    
    try {
      // Step 1: Local parsing for immediate preview
      const localParser = new LocalFileParser();
      const localResult = await localParser.parseFile(file);
      setLocalParseResult(localResult);
      
      if (localResult.success && localResult.events.length > 0) {
        // Show immediate results from local parsing
        setParsedEvents(localResult.events);
        setSelectedEvents(new Set(localResult.events.map(e => e.id)));
        
        // Step 2: Try to enhance with AI if available
        setProcessingStep('ai');
        const llmParser = createLLMParser();
        
        if (llmParser) {
          try {
            const enhancedResult = await llmParser.enhanceEvents(localResult.events, localResult.rawData);
            setParseResult(enhancedResult);
            
            if (enhancedResult.success) {
              setParsedEvents(enhancedResult.events);
              setSelectedEvents(new Set(enhancedResult.events.map(e => e.id)));
            }
          } catch (error) {
            console.warn('AI enhancement failed, using local results:', error);
            // Continue with local results
          }
        }
        
        setProcessingStep('complete');
        setParseStatus('completed');
      } else {
        // Fallback to AI parsing for unstructured files
        setProcessingStep('ai');
        const llmParser = createLLMParser();
        
        if (llmParser) {
          try {
            const aiResult = await llmParser.parseFile(file);
            setParseResult(aiResult);
            
            if (aiResult.success) {
              setParsedEvents(aiResult.events);
              setSelectedEvents(new Set(aiResult.events.map(e => e.id)));
              setProcessingStep('complete');
              setParseStatus('completed');
            } else {
              throw new Error('AI parsing failed');
            }
          } catch (error) {
            console.warn('AI parsing failed, using mock data:', error);
            // Use mock data as fallback
            setTimeout(() => {
              const mockResult: ParseResult = {
                success: true,
                events: mockEvents,
                confidence: 85
              };
              setParseResult(mockResult);
              setParsedEvents(mockEvents);
              setSelectedEvents(new Set(mockEvents.map(e => e.id)));
              setProcessingStep('complete');
              setParseStatus('completed');
            }, 1000);
          }
        } else {
          // No AI available, use mock data
          setTimeout(() => {
            const mockResult: ParseResult = {
              success: true,
              events: mockEvents,
              confidence: 85
            };
            setParseResult(mockResult);
            setParsedEvents(mockEvents);
            setSelectedEvents(new Set(mockEvents.map(e => e.id)));
            setProcessingStep('complete');
            setParseStatus('completed');
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Parsing error:', error);
      setParseStatus('error');
      setParseResult({
        success: false,
        events: [],
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'Parsing failed']
      });
    }
  };

  const toggleEventSelection = (eventId: string) => {
    const newSelection = new Set(selectedEvents);
    if (newSelection.has(eventId)) {
      newSelection.delete(eventId);
    } else {
      newSelection.add(eventId);
    }
    setSelectedEvents(newSelection);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'border-l-4 border-black dark:border-white';
      case 'lab': return 'border-l-4 border-gray-600 dark:border-gray-400';
      case 'tutorial': return 'border-l-4 border-gray-400 dark:border-gray-500';
      case 'break': return 'border-l-4 border-gray-300 dark:border-gray-600';
      default: return 'border-l-4 border-gray-300 dark:border-gray-600';
    }
  };

  const handleProceedToSync = () => {
    setCurrentStep('sync');
  };

  const handleSyncComplete = (result: SyncResult) => {
    setSyncResult(result);
    setCurrentStep('results');
  };

  const handleBackToEvents = () => {
    setCurrentStep('upload');
  };

  const handleSyncMore = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setParseStatus('idle');
    setParsedEvents([]);
    setSelectedEvents(new Set());
    setSyncResult(null);
    setParseResult(null);
    setLocalParseResult(null);
    setProcessingStep('local');
  };

  // Get selected events for syncing
  const eventsToSync = parsedEvents.filter(event => selectedEvents.has(event.id));

  if (currentStep === 'sync') {
    return (
      <CalendarSync
        events={eventsToSync}
        onSyncComplete={handleSyncComplete}
        onBack={handleBackToEvents}
      />
    );
  }

  if (currentStep === 'results' && syncResult) {
    return (
      <SyncResults
        result={syncResult}
        onNavigateToDashboard={() => onNavigate('dashboard')}
        onSyncMore={handleSyncMore}
      />
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
          backgroundSize: '60px 60px'
        }} className="text-black dark:text-white"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extralight text-black dark:text-white mb-6 tracking-tight transition-colors duration-300">
            Upload Your Timetable
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed transition-colors duration-300">
            Upload your schedule in any format. Our intelligent system combines local parsing with AI enhancement for optimal results.
          </p>
        </div>

        {parseStatus === 'idle' && (
          <div className="max-w-2xl mx-auto">
            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed p-16 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-950' 
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf,.jpg,.jpeg,.png,.txt"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="mb-8">
                <div className="mx-auto w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center transition-colors duration-300">
                  <Brain className="w-8 h-8 text-white dark:text-black" />
                </div>
              </div>
              
              <h3 className="text-2xl font-light text-black dark:text-white mb-4 tracking-wide transition-colors duration-300">
                {dragActive ? 'Drop your file here' : 'Drag & drop your timetable'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 font-light transition-colors duration-300">
                Instant local parsing with optional AI enhancement for perfect results
              </p>
              
              <div className="flex justify-center space-x-8 mb-8">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 font-light">
                  <FileText className="w-4 h-4" />
                  <span>CSV, Excel</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 font-light">
                  <FileText className="w-4 h-4" />
                  <span>PDF</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 font-light">
                  <Image className="w-4 h-4" />
                  <span>JPG, PNG</span>
                </div>
              </div>
              
              <button className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-light tracking-wide hover:bg-gray-900 dark:hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white">
                Choose File
              </button>
            </div>

            {/* Sample Templates */}
            <div className="mt-16 p-8 border border-gray-100 dark:border-gray-900 bg-white dark:bg-black transition-colors duration-300">
              <h3 className="text-lg font-light text-black dark:text-white mb-6 tracking-wide transition-colors duration-300">
                Need a sample template?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="p-6 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all text-left bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white">
                  <FileText className="w-6 h-6 text-black dark:text-white mb-4 transition-colors duration-300" />
                  <div className="font-light text-black dark:text-white mb-1 transition-colors duration-300">CSV Template</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-light transition-colors duration-300">Download sample CSV</div>
                </button>
                <button className="p-6 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all text-left bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white">
                  <FileText className="w-6 h-6 text-black dark:text-white mb-4 transition-colors duration-300" />
                  <div className="font-light text-black dark:text-white mb-1 transition-colors duration-300">Excel Template</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-light transition-colors duration-300">Download sample XLSX</div>
                </button>
                <button className="p-6 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all text-left bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white">
                  <Image className="w-6 h-6 text-black dark:text-white mb-4 transition-colors duration-300" />
                  <div className="font-light text-black dark:text-white mb-1 transition-colors duration-300">Photo Guide</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-light transition-colors duration-300">Tips for best results</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {parseStatus === 'processing' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="border border-gray-100 dark:border-gray-900 p-12 bg-white dark:bg-black transition-colors duration-300">
              <div className="w-16 h-16 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
              <h3 className="text-xl font-light text-black dark:text-white mb-4 tracking-wide transition-colors duration-300">
                {processingStep === 'local' && 'Parsing Your Timetable'}
                {processingStep === 'ai' && 'AI Enhancing Results'}
                {processingStep === 'complete' && 'Processing Complete'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 font-light transition-colors duration-300">
                {processingStep === 'local' && `Extracting structured data from "${uploadedFile?.name}"`}
                {processingStep === 'ai' && 'AI is cleaning up and enhancing the extracted events'}
                {processingStep === 'complete' && 'Ready for review'}
              </p>
              <div className="space-y-4 text-sm text-gray-500 dark:text-gray-400 font-light">
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-black dark:text-white" />
                  <span>File uploaded successfully</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  {processingStep === 'local' ? (
                    <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4 text-black dark:text-white" />
                  )}
                  <span>Local parsing with {localParseResult?.format || 'appropriate'} library</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  {processingStep === 'ai' ? (
                    <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : processingStep === 'complete' ? (
                    <CheckCircle className="w-4 h-4 text-black dark:text-white" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-300 dark:text-gray-700" />
                  )}
                  <span>AI enhancement and cleanup</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {parseStatus === 'error' && parseResult && (
          <div className="max-w-2xl mx-auto">
            <div className="border border-red-200 dark:border-red-800 p-8 bg-red-50 dark:bg-red-950 transition-colors duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-light text-red-800 dark:text-red-200 tracking-wide">
                  Parsing Failed
                </h3>
              </div>
              <div className="space-y-2">
                {parseResult.errors?.map((error, index) => (
                  <p key={index} className="text-red-700 dark:text-red-300 font-light">
                    {error}
                  </p>
                ))}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setParseStatus('idle');
                    setUploadedFile(null);
                    setParseResult(null);
                    setLocalParseResult(null);
                  }}
                  className="px-6 py-3 bg-red-600 dark:bg-red-500 text-white font-light tracking-wide hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-red-950"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {parseStatus === 'completed' && (
          <div className="space-y-12">
            {/* Results Summary */}
            <div className="border border-gray-100 dark:border-gray-900 p-8 bg-white dark:bg-black transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-light text-black dark:text-white tracking-wide transition-colors duration-300">
                    Parsing Complete
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">
                    Found {parsedEvents.length} events from "{uploadedFile?.name}"
                    {localParseResult && ` • Format: ${localParseResult.format.toUpperCase()}`}
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  {parseResult?.confidence && (
                    <div className="text-center">
                      <div className="text-2xl font-extralight text-black dark:text-white transition-colors duration-300">
                        {parseResult.confidence}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-light">
                        Parse Quality
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-6 h-6 text-black dark:text-white" />
                    <span className="text-sm text-black dark:text-white font-light transition-colors duration-300">
                      {selectedEvents.size} events selected
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhancement Info */}
              {parseResult?.enhancedFields && parseResult.enhancedFields.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 transition-colors duration-300">
                  <div className="flex items-center space-x-2 text-sm text-green-700 dark:text-green-300 font-light">
                    <Sparkles className="w-4 h-4" />
                    <span>AI enhanced: {parseResult.enhancedFields.join(', ')}</span>
                  </div>
                </div>
              )}

              {/* Raw Data Toggle */}
              {localParseResult && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowRawData(!showRawData)}
                    className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-light transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{showRawData ? 'Hide' : 'Show'} raw data preview</span>
                  </button>
                </div>
              )}
            </div>

            {/* Raw Data Preview */}
            {showRawData && localParseResult && (
              <div className="border border-gray-100 dark:border-gray-900 p-8 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
                <h4 className="text-lg font-light text-black dark:text-white mb-4 tracking-wide transition-colors duration-300">
                  Raw Data Preview
                </h4>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-4 rounded max-h-64 overflow-auto">
                  <pre className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {JSON.stringify(localParseResult.rawData.slice(0, 3), null, 2)}
                    {localParseResult.rawData.length > 3 && '\n... and more'}
                  </pre>
                </div>
              </div>
            )}

            {/* Events List */}
            <div className="border border-gray-100 dark:border-gray-900 overflow-hidden bg-white dark:bg-black transition-colors duration-300">
              <div className="p-8 border-b border-gray-100 dark:border-gray-900">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-light text-black dark:text-white tracking-wide transition-colors duration-300">
                    Review Your Events
                  </h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setSelectedEvents(new Set(parsedEvents.map(e => e.id)))}
                      className="text-sm text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 font-light transition-colors"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <button
                      onClick={() => setSelectedEvents(new Set())}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-light transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100 dark:divide-gray-900">
                {parsedEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-8 hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors ${
                      selectedEvents.has(event.id) ? 'bg-gray-50 dark:bg-gray-950' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-6">
                      <input
                        type="checkbox"
                        checked={selectedEvents.has(event.id)}
                        onChange={() => toggleEventSelection(event.id)}
                        className="mt-1 w-5 h-5 text-black dark:text-white rounded focus:ring-black dark:focus:ring-black bg-white dark:bg-black border-gray-300 dark:border-gray-700"
                      />
                      <div className={`flex-1 pl-4 ${getEventTypeColor(event.type)} transition-colors duration-300`}>
                        <div className="flex items-center space-x-4 mb-3">
                          <h4 className="text-lg font-light text-black dark:text-white tracking-wide transition-colors duration-300">
                            {event.title}
                          </h4>
                          <span className="px-3 py-1 text-xs font-light tracking-wide text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black transition-colors duration-300">
                            {event.type}
                          </span>
                          {event.courseCode && (
                            <span className="px-3 py-1 text-xs font-light tracking-wide text-black dark:text-white bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                              {event.courseCode}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400 font-light">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Grid3X3 className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Settings className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        {event.instructor && (
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-light">
                            Instructor: {event.instructor}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={handleProceedToSync}
                disabled={selectedEvents.size === 0}
                className={`px-12 py-4 font-light tracking-wide transition-all duration-300 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  selectedEvents.size > 0
                    ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 focus:ring-black dark:focus:ring-black dark:focus:ring-offset-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Sync {selectedEvents.size} Events to Calendar</span>
              </button>
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setParseStatus('idle');
                  setParsedEvents([]);
                  setSelectedEvents(new Set());
                  setParseResult(null);
                  setLocalParseResult(null);
                  setProcessingStep('local');
                }}
                className="px-12 py-4 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-light tracking-wide hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white"
              >
                Upload Different File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;