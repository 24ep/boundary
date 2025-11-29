import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/features', label: t('nav.features') },
    { path: '/pricing', label: t('nav.pricing') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container-max">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Bondarys</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'text-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200">
                <Globe size={16} />
                <span>{i18n.language === 'th' ? 'ไทย' : 'EN'}</span>
                <ChevronDown size={14} />
              </button>
              <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg ${
                    i18n.language === 'en' ? 'text-primary-600' : 'text-gray-700'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage('th')}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg ${
                    i18n.language === 'th' ? 'text-primary-600' : 'text-gray-700'
                  }`}
                >
                  ไทย
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <Link
              to="/download"
              className="btn-primary text-sm"
            >
              {t('nav.download')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-4 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block text-base font-medium ${
                      location.pathname === item.path
                        ? 'text-primary-600'
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Mobile Language Switcher */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`text-sm font-medium ${
                        i18n.language === 'en' ? 'text-primary-600' : 'text-gray-700'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => changeLanguage('th')}
                      className={`text-sm font-medium ${
                        i18n.language === 'th' ? 'text-primary-600' : 'text-gray-700'
                      }`}
                    >
                      ไทย
                    </button>
                  </div>
                </div>

                {/* Mobile CTA */}
                <Link
                  to="/download"
                  onClick={() => setIsOpen(false)}
                  className="block w-full btn-primary text-center"
                >
                  {t('nav.download')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar; 