import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Smartphone, QrCode } from 'lucide-react';

const DownloadSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="section-padding bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container-max">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('download.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t('download.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="btn-primary flex items-center justify-center space-x-2">
                <Download size={20} />
                <span>{t('download.appStore')}</span>
              </button>
              
              <button className="btn-secondary flex items-center justify-center space-x-2">
                <Download size={20} />
                <span>{t('download.googlePlay')}</span>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Phone Mockup */}
              <div className="relative bg-gray-900 rounded-[2rem] p-2 shadow-2xl">
                <div className="bg-white rounded-[1.5rem] p-4 w-64 h-80 flex items-center justify-center">
                  <div className="text-center">
                    <Smartphone className="w-12 h-12 mx-auto text-primary-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bondarys</h3>
                    <p className="text-sm text-gray-600 mb-4">hourse Management App</p>
                    
                    {/* QR Code Placeholder */}
                    <div className="bg-gray-100 rounded-lg p-4 mx-auto w-24 h-24 flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{t('download.qrCode')}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection; 