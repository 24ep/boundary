import { appkit } from '../services/api/appkit';

/**
 * Interface for screen-specific configuration from the CMS
 */
export interface ScreenConfig {
  background?: string | {
    mode: 'image' | 'gradient' | 'solid' | 'video';
    image?: string;
    gradient?: {
      angle: number;
      stops: { color: string; position: number }[];
    };
    solid?: string;
  };
  resizeMode?: string;
}

/**
 * Interface matching DynamicBackground's BackgroundConfig
 */
export interface BackgroundConfig {
  type?: 'gradient' | 'image' | 'color' | 'solid';
  gradient?: string[];
  angle?: number;
  image_url?: string;
  color?: string;
  value?: string;
  overlay_opacity?: number;
  resize_mode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

/**
 * Helper to fix image URLs for remote/local environments
 * Now uses the AppKit SDK's StorageModule for consistent URL construction
 */
const fixImageUrl = (url?: string): string => {
  if (!url) return '';
  return appkit.storage.getFileUrl(url);
};

/**
 * Maps a screen configuration from the CMS to a background configuration
 * compatible with the DynamicBackground component.
 */
export const mapScreenConfigToBackground = (screenConfig?: ScreenConfig): BackgroundConfig => {
  if (!screenConfig?.background) {
    // Default Gradient if no config
    return {
      type: 'gradient',
      gradient: ['#FA7272', '#FFBBB4']
    };
  }

  const bg = screenConfig.background;

  // Handle legacy string (simple hex or potential url)
  if (typeof bg === 'string') {
    if (bg.startsWith('http') || bg.startsWith('/')) {
      return {
        type: 'image',
        image_url: fixImageUrl(bg),
        resize_mode: (screenConfig.resizeMode as any) || 'cover'
      };
    }
    return {
      type: 'solid',
      color: bg
    };
  }

  // Handle ColorValue object
  if (bg.mode === 'image' && bg.image) {
    return {
      type: 'image',
      image_url: fixImageUrl(bg.image),
      resize_mode: (screenConfig.resizeMode as any) || 'cover'
    };
  }

  if (bg.mode === 'gradient' && bg.gradient) {
    // Sort stops and map to colors array for LinearGradient
    const sortedStops = [...bg.gradient.stops].sort((a, b) => a.position - b.position);
    return {
      type: 'gradient',
      gradient: sortedStops.map(s => s.color),
      angle: bg.gradient.angle
    };
  }

  if (bg.mode === 'solid' && bg.solid) {
    return {
      type: 'solid',
      color: bg.solid
    };
  }

  // Handle video/other fallbacks
  if (bg.mode === 'video') {
    return {
      type: 'solid',
      color: '#000000'
    };
  }

  // Default fallback
  return {
    type: 'gradient',
    gradient: ['#FA7272', '#FFBBB4']
  };
};
