// CRITICAL: Polyfill MUST be the absolute first thing that runs
import './src/utils/platformConstantsPolyfill';
// Suppress non-critical Jimp errors
import './src/utils/jimpErrorHandler';
// Then load other polyfills
import './src/utils/webPolyfills';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
