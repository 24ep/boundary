import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, Globe, Star, Heart } from 'lucide-react';

const StatsSection: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    {
      icon: Users,
      value: t('hero.stats.families'),
      label: t('hero.stats.familiesLabel'),
      color: 'text-primary-600',
    },
    {
      icon: Globe,
      value: t('hero.stats.countries'),
      label: t('hero.stats.countriesLabel'),
      color: 'text-secondary-600',
    },
    {
      icon: Star,
      value: t('hero.stats.rating'),
      label: t('hero.stats.ratingLabel'),
      color: 'text-accent-600',
    },
  ];

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection; 