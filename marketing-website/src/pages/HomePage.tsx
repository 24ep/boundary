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
  ArrowRight,
  Star,
  Download,
  Globe
} from 'lucide-react';
import HeroSection from '../components/sections/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import StatsSection from '../components/sections/StatsSection';
import DownloadSection from '../components/sections/DownloadSection';

const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-16">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <DownloadSection />
    </div>
  );
};

export default HomePage; 