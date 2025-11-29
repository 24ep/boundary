import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Shield, 
  Users, 
  Target, 
  Award, 
  Globe,
  Lightbulb,
  Zap
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: Shield,
      title: t('about.values.privacy'),
      description: t('about.values.privacyDesc'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Zap,
      title: t('about.values.security'),
      description: t('about.values.securityDesc'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Heart,
      title: t('about.values.hourse'),
      description: t('about.values.familyDesc'),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const milestones = [
    { year: '2020', title: 'Founded', description: 'Bondarys was founded with a vision to strengthen hourse bonds' },
    { year: '2021', title: 'First Release', description: 'Launched our first mobile app with core hourse features' },
    { year: '2022', title: '10K Families', description: 'Reached our first 10,000 hourse milestone' },
    { year: '2023', title: 'Global Expansion', description: 'Expanded to 50+ countries worldwide' },
    { year: '2024', title: 'Future Ready', description: 'Continuing to innovate and serve families globally' },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="container-max text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            {t('about.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            {t('about.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <Target className="w-12 h-12 text-primary-600 mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('about.mission.title')}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('about.mission.description')}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <Lightbulb className="w-12 h-12 text-secondary-600 mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('about.vision.title')}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('about.vision.description')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('about.values.title')}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${value.bgColor} rounded-xl mb-6`}>
                  <value.icon className={`w-8 h-8 ${value.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From a simple idea to serving families worldwide
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-200"></div>

            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative flex items-center mb-12 ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-lg"></div>

                {/* Content */}
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="text-2xl font-bold text-primary-600 mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="container-max">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10,000+', label: 'Happy Families' },
              { number: '50+', label: 'Countries' },
              { number: '4.8', label: 'App Rating' },
              { number: '24/7', label: 'Support' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-100">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 