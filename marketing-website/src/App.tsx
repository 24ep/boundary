import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { i18n } = useTranslation();

  // Apply Thai font class when Thai language is selected
  React.useEffect(() => {
    if (i18n.language === 'th') {
      document.documentElement.classList.add('thai-font');
    } else {
      document.documentElement.classList.remove('thai-font');
    }
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

export default App; 