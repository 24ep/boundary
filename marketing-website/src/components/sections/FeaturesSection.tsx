import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  MessageCircle, 
  Shield, 
  Smartphone, 
  Heart,
  Calendar,
  Image,
  FileText,
  ShoppingCart,
  Target,
  Globe
} from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Users,
      title: t('features.familyManagement.title'),
      description: t('features.familyManagement.description'),
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      icon: MapPin,
      title: t('features.locationSafety.title'),
      description: t('features.locationSafety.description'),
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      icon: MessageCircle,
      title: t('features.communication.title'),
      description: t('features.communication.description'),
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
    },
    {
      icon: Globe,
      title: t('features.socialFeatures.title'),
      description: t('features.socialFeatures.description'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Smartphone,
      title: t('features.integratedApps.title'),
      description: t('features.integratedApps.description'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Shield,
      title: t('features.security.title'),
      description: t('features.security.description'),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <section className="section-padding">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('features.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.bgColor} rounded-lg mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 