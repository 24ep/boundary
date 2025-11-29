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
  Globe,
  Bell,
  Lock,
  Eye,
  Zap
} from 'lucide-react';

const FeaturesPage: React.FC = () => {
  const { t } = useTranslation();

  const featureCategories = [
    {
      title: t('features.familyManagement.title'),
      description: t('features.familyManagement.description'),
      icon: Users,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      features: [
        { name: 'hourse Groups', description: 'Create and manage hourse groups with custom roles and permissions' },
        { name: 'Member Invitations', description: 'Invite hourse members via email or SMS with secure links' },
        { name: 'hourse Calendar', description: 'Shared events, appointments, and reminders for the whole hourse' },
        { name: 'hourse Gallery', description: 'Shared photo albums and memories with privacy controls' },
        { name: 'hourse Storage', description: 'Secure file storage and organization for hourse documents' }
      ]
    },
    {
      title: t('features.locationSafety.title'),
      description: t('features.locationSafety.description'),
      icon: MapPin,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
      features: [
        { name: 'Real-time Location', description: 'Track hourse members\' locations with privacy controls' },
        { name: 'Geofencing', description: 'Set up safety zones and receive alerts when hourse enters/leaves' },
        { name: 'Emergency Alerts', description: 'Panic button and emergency contacts for immediate help' },
        { name: 'Location History', description: 'View past locations and routes with detailed analytics' },
        { name: 'Safety Zones', description: 'Define safe, warning, and danger areas with custom alerts' }
      ]
    },
    {
      title: t('features.communication.title'),
      description: t('features.communication.description'),
      icon: MessageCircle,
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
      features: [
        { name: 'hourse Chat', description: 'Group and private messaging with rich media support' },
        { name: 'Video Calls', description: 'High-quality video calls with screen sharing capabilities' },
        { name: 'Voice Messages', description: 'Send and receive voice messages with transcription' },
        { name: 'File Sharing', description: 'Share photos, documents, and media securely' },
        { name: 'Notifications', description: 'Push, email, and SMS notifications with smart filtering' }
      ]
    }
  ];

  const securityFeatures = [
    { icon: Lock, title: 'End-to-end Encryption', description: 'All messages and calls are encrypted' },
    { icon: Shield, title: 'Two-factor Authentication', description: 'Enhanced account security' },
    { icon: Eye, title: 'Privacy Controls', description: 'Granular privacy settings for all features' },
    { icon: Zap, title: 'Secure Storage', description: 'Encrypted file storage and backup' }
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
            {t('features.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            {t('features.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="section-padding">
        <div className="container-max">
          {featureCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className={`mb-16 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${category.bgColor} rounded-xl mb-6`}>
                    <category.icon className={`w-8 h-8 ${category.color}`} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {category.title}
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    {category.description}
                  </p>
                  
                  <div className="space-y-4">
                    {category.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="bg-white rounded-2xl p-8 shadow-xl">
                    <div className="text-center">
                      <category.icon className={`w-16 h-16 ${category.color} mx-auto mb-4`} />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {category.title}
                      </h3>
                      <p className="text-gray-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security Features */}
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
              Security & Privacy
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Your hourse's data is protected with enterprise-grade security measures
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <feature.icon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage; 