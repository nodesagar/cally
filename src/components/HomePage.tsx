import React from 'react';
import { 
  Upload, 
  Calendar, 
  Zap, 
  Shield, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  FileText,
  Grid3X3
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Smart Upload",
      description: "Support for CSV, XLSX, PDF, and image formats with intelligent parsing"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Calendar Sync",
      description: "Seamless integration with Google Calendar, Outlook, and Apple Calendar"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Processing",
      description: "Lightning-fast timetable processing with real-time preview"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "End-to-end encryption with automatic data deletion after sync"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Your Timetable",
      description: "Drag and drop your schedule file or take a photo of your printed timetable"
    },
    {
      number: "02",
      title: "Review & Customize",
      description: "Preview extracted events and add custom details like locations and reminders"
    },
    {
      number: "03",
      title: "Sync to Calendar",
      description: "One-click integration with your preferred calendar application"
    }
  ];

  const stats = [
    { number: "50K+", label: "Students & Professionals" },
    { number: "200+", label: "Institutions Supported" },
    { number: "99.9%", label: "Accuracy Rate" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Hero Section with Mesh Background */}
      <section className="relative overflow-hidden">
        {/* Mesh Grid Background */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            color: 'rgb(0 0 0 / 1)'
          }} className="text-black dark:text-white"></div>
        </div>
        
        {/* Subtle Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`
        }} className="text-black dark:text-white"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-full text-gray-700 dark:text-gray-300 text-sm font-light tracking-wide bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-colors duration-300">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Now supporting 200+ institutions
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extralight text-black dark:text-white mb-8 tracking-tight leading-tight transition-colors duration-300">
              Transform Your
              <br />
              <span className="font-light">Timetable</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed transition-colors duration-300">
              Upload any timetable format and watch as ChronoSync intelligently extracts your schedule, 
              enhances it with smart details, and syncs it perfectly with your calendar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('upload')}
                className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-light tracking-wide hover:bg-gray-900 dark:hover:bg-gray-100 transition-all duration-300 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-light tracking-wide hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-950 relative transition-colors duration-300">
        {/* Subtle Mesh Lines */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(45deg, currentColor 1px, transparent 1px),
              linear-gradient(-45deg, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} className="text-black dark:text-white"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-black dark:text-white mb-6 tracking-tight transition-colors duration-300">
              Why Choose ChronoSync?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light transition-colors duration-300">
              Built by students, for students. We understand the challenges of managing complex schedules.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 hover:border-gray-200 dark:hover:border-gray-800 transition-all duration-300 group"
              >
                <div className="mb-6 text-black dark:text-white group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-light text-black dark:text-white mb-4 tracking-wide transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white dark:bg-black relative transition-colors duration-300">
        {/* Diagonal Mesh Pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(30deg, currentColor 1px, transparent 1px),
              linear-gradient(150deg, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }} className="text-black dark:text-white"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-black dark:text-white mb-6 tracking-tight transition-colors duration-300">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light transition-colors duration-300">
              Three simple steps to transform your timetable into a perfectly organized calendar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="mb-8">
                  <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-lg font-light mx-auto transition-colors duration-300">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-light text-black dark:text-white mb-4 tracking-wide transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed transition-colors duration-300">
                  {step.description}
                </p>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-12 h-px bg-gray-200 dark:bg-gray-800 transform -translate-x-6 transition-colors duration-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-black dark:bg-white relative overflow-hidden transition-colors duration-300">
        {/* Inverted Mesh on Contrasting Background */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} className="text-white dark:text-black"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extralight text-white dark:text-black mb-6 tracking-tight transition-colors duration-300">
              Trusted Worldwide
            </h2>
            <p className="text-lg text-gray-300 dark:text-gray-700 max-w-2xl mx-auto font-light transition-colors duration-300">
              Join thousands of students and professionals who have streamlined their scheduling.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-extralight text-white dark:text-black mb-2 tracking-tight transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-300 dark:text-gray-700 font-light tracking-wide transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-black relative transition-colors duration-300">
        {/* Radial Mesh Pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} className="text-black dark:text-white"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extralight text-black dark:text-white mb-8 tracking-tight transition-colors duration-300">
            Ready to Simplify Your Schedule?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 font-light transition-colors duration-300">
            Join thousands of students and professionals who have transformed their time management.
          </p>
          <button
            onClick={() => onNavigate('upload')}
            className="px-12 py-4 bg-black dark:bg-white text-white dark:text-black font-light tracking-wide hover:bg-gray-900 dark:hover:bg-gray-100 transition-all duration-300 flex items-center justify-center mx-auto group focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white"
          >
            Start Your Free Trial
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;