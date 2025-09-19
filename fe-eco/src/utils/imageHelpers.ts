// Placeholder for missing images
export const PLACEHOLDER_IMAGE = '/images/placeholder.svg';
export const DEFAULT_AVATAR = '/images/avatars/default.svg';

// Base URL for backend images - adjust this based on your backend setup
const BASE_IMAGE_URL = import.meta.env.VITE_BACKEND_URL || 'https://be-ecom-2hfk.onrender.com';

// Image helper functions
export const getImageUrl = (imagePath?: string, fallback: string = PLACEHOLDER_IMAGE): string => {
  if (!imagePath) return fallback;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's a local path starting with /, use as is (for static assets)
  if (imagePath.startsWith('/')) return imagePath;
  
  // For database image names (just filename), construct full URL
  if (!imagePath.includes('/')) {
    // If it's just a filename, add the images/ prefix
    return `${BASE_IMAGE_URL}/images/${imagePath}`;
  }
  
  // For paths like 'images/filename.jpg', construct full URL
  if (imagePath.startsWith('images/')) {
    return `${BASE_IMAGE_URL}/${imagePath}`;
  }
  
  // Default case - assume it's a filename and add images/ prefix
  return `${BASE_IMAGE_URL}/images/${imagePath}`;
};

export const getProductImageUrl = (imageName?: string): string => {
  if (!imageName) return PLACEHOLDER_IMAGE;
  
  // If it's already a full URL, return as is
  if (imageName.startsWith('http')) return imageName;
  
  // If it's a local static asset path, return as is
  if (imageName.startsWith('/')) return imageName;
  
  // For database image names (just filename), construct backend URL
  return `${BASE_IMAGE_URL}/images/${imageName}`;
};

export const getUserAvatarUrl = (avatarName?: string): string => {
  if (!avatarName) return DEFAULT_AVATAR;
  
  // If it's already a full URL, return as is
  if (avatarName.startsWith('http')) return avatarName;
  
  // If it's a local static asset path, return as is
  if (avatarName.startsWith('/')) return avatarName;
  
  // For database avatar names (just filename), construct backend URL
  return `${BASE_IMAGE_URL}/images/avatars/${avatarName}`;
};

export const getOptimizedImageUrl = (imagePath?: string, width?: number, height?: number): string => {
  const baseUrl = getImageUrl(imagePath);
  if (!width && !height) return baseUrl;
  
  // Add optimization parameters if backend supports it
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  
  return baseUrl.includes('?') 
    ? `${baseUrl}&${params.toString()}`
    : `${baseUrl}?${params.toString()}`;
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.target as HTMLImageElement;
  if (target.src !== PLACEHOLDER_IMAGE) {
    target.src = PLACEHOLDER_IMAGE;
  }
};

export const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.target as HTMLImageElement;
  if (target.src !== DEFAULT_AVATAR) {
    target.src = DEFAULT_AVATAR;
  }
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (srcArray: string[]): Promise<void> => {
  const promises = srcArray.map(src => preloadImage(src).catch(() => {})); // Ignore failures
  await Promise.all(promises);
};
