import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  ArrowUp
} from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-max">
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-xl font-bold">Bondarys</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                {t('footer.description')}
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Mail size={16} />
                  <span>{t('contact.info.email')}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Phone size={16} />
                  <span>{t('contact.info.phone')}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <MapPin size={16} />
                  <span>{t('contact.info.address')}</span>
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.links.product')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/features" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t('footer.links.features')}
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t('footer.links.pricing')}
                  </Link>
                </li>
                <li>
                  <Link to="/download" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t('footer.links.download')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.links.company')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t('footer.links.about')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t('footer.links.contact')}
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t('footer.links.careers')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">{t('footer.social')}</span>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  );
};

export default Footer; 