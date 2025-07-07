import React from 'react';
import { Calendar, Github, Twitter, Mail, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { label: 'Features', action: () => onNavigate('home') },
        { label: 'Upload', action: () => onNavigate('upload') },
        { label: 'Dashboard', action: () => onNavigate('dashboard') },
        { label: 'Pricing', action: () => {} },
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', action: () => {} },
        { label: 'Documentation', action: () => {} },
        { label: 'Contact Us', action: () => {} },
        { label: 'Status', action: () => {} },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About', action: () => {} },
        { label: 'Blog', action: () => {} },
        { label: 'Careers', action: () => {} },
        { label: 'Press', action: () => {} },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', action: () => {} },
        { label: 'Terms of Service', action: () => {} },
        { label: 'Cookie Policy', action: () => {} },
        { label: 'GDPR', action: () => {} },
      ]
    }
  ];

  return (
    <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-900 relative transition-colors duration-300">
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-black dark:bg-white rounded-lg">
                  <Calendar className="w-6 h-6 text-white dark:text-black" />
                </div>
                <span className="ml-3 text-xl font-light tracking-wide text-black dark:text-white transition-colors duration-300">
                  ChronoSync
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-8 max-w-md transition-colors duration-300">
                Transform your timetable into smart calendar events with intelligent parsing and seamless integration across all your devices.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                <button className="p-3 border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-950 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white">
                  <Github className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors" />
                </button>
                <button className="p-3 border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-950 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white">
                  <Twitter className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors" />
                </button>
                <button className="p-3 border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-950 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {footerLinks.map((section, index) => (
                  <div key={index}>
                    <h3 className="text-sm font-medium text-black dark:text-white mb-6 tracking-wide transition-colors duration-300">
                      {section.title}
                    </h3>
                    <ul className="space-y-4">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <button
                            onClick={link.action}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-light transition-colors duration-300"
                          >
                            {link.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-12 border-t border-gray-100 dark:border-gray-900">
          <div className="max-w-2xl">
            <h3 className="text-lg font-light text-black dark:text-white mb-4 tracking-wide transition-colors duration-300">
              Stay Updated
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-light mb-6 transition-colors duration-300">
              Get the latest updates on new features and calendar integrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-800 font-light focus:ring-2 focus:ring-black dark:focus:ring-black focus:border-black dark:focus:border-white bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors duration-300"
              />
              <button className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-light tracking-wide hover:bg-gray-900 dark:hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-black focus:ring-offset-2 dark:focus:ring-offset-white">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-gray-100 dark:border-gray-900">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">
              <span>© {currentYear} ChronoSync. All rights reserved.</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 font-light transition-colors duration-300">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-black dark:text-white transition-colors duration-300" />
              <span>for students worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;