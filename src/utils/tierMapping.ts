// Centralized tier mapping utilities
// This handles the mapping between database tier names and display names

export type DatabaseTier = 'Free' | 'Premium' | 'Pro' | 'Family' | 'Enterprise';
export type DisplayTier = 'Free' | 'Core' | 'Pro' | 'Family' | 'Enterprise';

/**
 * Maps database tier names to display tier names
 * Database stores "Premium" but UI shows "Core" to match pricing page
 */
export const mapTierToDisplay = (databaseTier: string): string => {
  switch (databaseTier) {
    case 'Premium':
      return 'Core'; // Premium is displayed as "Core" to match pricing page
    case 'Pro':
      return 'Pro';
    case 'Free':
      return 'Free';
    case 'Family':
      return 'Family';
    case 'Enterprise':
      return 'Enterprise';
    default:
      return databaseTier;
  }
};

/**
 * Maps display tier names back to database tier names
 * For when we need to query the database with the correct tier name
 */
export const mapDisplayToTier = (displayTier: string): string => {
  switch (displayTier) {
    case 'Core':
      return 'Premium'; // Core maps back to Premium in database
    case 'Pro':
      return 'Pro';
    case 'Free':
      return 'Free';
    case 'Family':
      return 'Family';
    case 'Enterprise':
      return 'Enterprise';
    default:
      return displayTier;
  }
};

/**
 * Tier hierarchy for comparison (using display names)
 */
export const TIER_HIERARCHY: Record<string, number> = {
  'Free': 0,
  'Core': 1,
  'Premium': 1, // Same level as Core for backward compatibility
  'Pro': 2,
  'Family': 2, // Same level as Pro
  'Enterprise': 3
};

/**
 * Check if a user has access to features of a specific tier
 * Handles both database and display tier names
 */
export const hasAccessToTier = (userTier: string, requiredTier: string): boolean => {
  const userLevel = TIER_HIERARCHY[userTier] || TIER_HIERARCHY[mapTierToDisplay(userTier)] || 0;
  const requiredLevel = TIER_HIERARCHY[requiredTier] || TIER_HIERARCHY[mapDisplayToTier(requiredTier)] || 0;
  
  return userLevel >= requiredLevel;
};

/**
 * Check if user has premium features (Core tier or higher)
 * Accepts both "Premium" (database) and "Core" (display) as premium tiers
 */
export const hasPremiumAccess = (userTier: string): boolean => {
  return hasAccessToTier(userTier, 'Core') || userTier === 'Premium';
};

/**
 * Check if user has pro features
 */
export const hasProAccess = (userTier: string): boolean => {
  return hasAccessToTier(userTier, 'Pro');
};

/**
 * Get tier icon name for UI components
 */
export const getTierIcon = (tier: string) => {
  const displayTier = mapTierToDisplay(tier);
  switch (displayTier) {
    case 'Free':
      return 'Zap';
    case 'Core':
      return 'Crown';
    case 'Pro':
      return 'Sparkles';
    case 'Family':
      return 'Users';
    case 'Enterprise':
      return 'Building';
    default:
      return 'Zap';
  }
};

/**
 * Get tier color classes for UI components
 */
export const getTierColor = (tier: string) => {
  const displayTier = mapTierToDisplay(tier);
  switch (displayTier) {
    case 'Free':
      return 'bg-gray-500';
    case 'Core':
      return 'bg-gradient-to-r from-blue-600 to-purple-600';
    case 'Pro':
      return 'bg-gradient-to-r from-purple-600 to-pink-600';
    case 'Family':
      return 'bg-gradient-to-r from-green-500 to-emerald-600';
    case 'Enterprise':
      return 'bg-gradient-to-r from-indigo-600 to-purple-700';
    default:
      return 'bg-gray-500';
  }
};
