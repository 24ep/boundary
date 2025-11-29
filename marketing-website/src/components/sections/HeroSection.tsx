import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Smartphone, Download, Star, Globe, Users, MapPin, MessageCircle } from 'lucide-react';

const HeroSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl animate-bounce-gentle"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-secondary-400 rounded-full mix-blend-multiply filter blur-xl animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-accent-400 rounded-full mix-blend-multiply filter blur-xl animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container-max relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              {t('hero.title')}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button className="btn-primary flex items-center justify-center space-x-2">
                <Download size={20} />
                <span>{t('hero.cta')}</span>
                <ArrowRight size={16} />
              </button>
              
              <button className="btn-outline flex items-center justify-center space-x-2">
                <Play size={20} />
                <span>{t('hero.ctaSecondary')}</span>
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500"
            >
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>4.8/5</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4 text-primary-500" />
                <span>50+ Countries</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-primary-500" />
                <span>10K+ Families</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative mx-auto lg:mx-0 w-full max-w-md">
              {/* Phone Mockup */}
              <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] p-4 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Smartphone className="w-16 h-16 mx-auto text-primary-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bondarys App</h3>
                    <p className="text-sm text-gray-600">hourse Management Made Simple</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg"
              >
                <Users className="w-6 h-6 text-primary-600" />
              </motion.div>
              
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg"
              >
                <MapPin className="w-6 h-6 text-secondary-600" />
              </motion.div>
              
              <motion.div
                animate={{ y: [-5, 15, -5] }}
                transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                className="absolute top-1/2 -right-8 bg-white rounded-full p-3 shadow-lg"
              >
                <MessageCircle className="w-6 h-6 text-accent-600" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 