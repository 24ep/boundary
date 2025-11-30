// PlatformConstants polyfill - MUST run before ANY React Native code
// Patches at the lowest level possible

(function() {
  if (typeof global === 'undefined') return;
  
  // Create polyfill object immediately
  const polyfill: any = {
    reactNativeVersion: { major: 0, minor: 81, patch: 5 },
    get Version() {
      try {
        const RN = require('react-native');
        return RN?.Platform?.Version || 'unknown';
      } catch {
        return 'unknown';
      }
    },
    get OS() {
      try {
        const RN = require('react-native');
        return RN?.Platform?.OS || 'unknown';
      } catch {
        return 'unknown';
      }
    },
    get: (key: string) => {
      if (key === 'reactNativeVersion') return { major: 0, minor: 81, patch: 5 };
      try {
        const RN = require('react-native');
        const Platform = RN?.Platform;
        if (key === 'Version') return Platform?.Version || 'unknown';
        return Platform?.OS || 'unknown';
      } catch {
        return 'unknown';
      }
    },
  };

  // Set on global IMMEDIATELY
  (global as any).PlatformConstants = polyfill;

  // Try to patch NativeModules immediately (if available)
  try {
    const RN = require('react-native');
    if (RN?.NativeModules) {
      (RN.NativeModules as any).PlatformConstants = polyfill;
    }
  } catch {
    // React Native not loaded yet, will patch later
  }

  // Also patch after a delay
  setTimeout(() => {
    try {
      const RN = require('react-native');
      if (RN?.NativeModules && !RN.NativeModules.PlatformConstants) {
        (RN.NativeModules as any).PlatformConstants = polyfill;
      }
      if (RN?.Platform && !RN.Platform.Constants) {
        (RN.Platform as any).Constants = polyfill;
      }
    } catch {}
  }, 0);
})();

export {};
