// Web polyfills - lazy loaded to avoid early React Native access

const getRN = () => {
  try {
    return require('react-native');
  } catch {
    return null;
  }
};

// BackHandler polyfill for web
(function() {
  const RN = getRN();
  if (!RN) return;
  
  if (RN.Platform?.OS === 'web') {
    const BackHandler = {
      addEventListener: () => ({ remove: () => {} }),
      removeEventListener: () => {},
      exitApp: () => {},
      goBack: () => {},
    };
    
    (global as any).BackHandler = BackHandler;
    
    try {
      const rnWeb = require('react-native-web');
      if (rnWeb && !rnWeb.BackHandler) {
        rnWeb.BackHandler = BackHandler;
      }
    } catch {}
  }
})();

export const webPolyfills = {
  get BackHandler() {
    const RN = getRN();
    if (!RN) {
      return {
        addEventListener: () => ({ remove: () => {} }),
        removeEventListener: () => {},
        exitApp: () => {},
        goBack: () => {},
      };
    }
    return RN.Platform?.OS === 'web' ? {
      addEventListener: () => ({ remove: () => {} }),
      removeEventListener: () => {},
      exitApp: () => {},
      goBack: () => {},
    } : RN.BackHandler;
  },
};
