import { Story } from '@/types/stories';

/**
 * Base props for all story card components
 */
export interface StoryCardBaseProps {
  story: Story;
  className?: string;
}

/**
 * Props for the StoryCardContainer component
 */
export interface StoryCardContainerProps extends StoryCardBaseProps {
  variant?: 'landscape' | 'portrait';
  children: React.ReactNode;
}

/**
 * Props for the StoryCard component
 */
export interface StoryCardProps extends StoryCardBaseProps {
  variant?: 'landscape' | 'portrait';
  onClick?: (story: Story) => void;
  linkTo?: string;
  // Action props
  onView?: (story: Story) => void;
  onEdit?: (story: Story) => void;
  onDelete?: (story: Story) => void;
  onContinue?: (story: Story) => void;
  primaryAction?: 'view' | 'edit' | 'continue';
  showSecondaryActions?: boolean;
  customActions?: React.ReactNode;
}

/**
 * Props for the StoryCardHeader component
 */
export interface StoryCardHeaderProps extends StoryCardBaseProps {
  showBadges?: boolean;
  badgePosition?: 'top-left' | 'top-right';
}

/**
 * Props for the StoryCardContent component
 */
export interface StoryCardContentProps extends StoryCardBaseProps {
  showDescription?: boolean;
  showMetadata?: boolean;
  titleLines?: number;
  descriptionLines?: number;
}

/**
 * Props for the StoryCardFooter component
 */
export interface StoryCardFooterProps extends StoryCardBaseProps {
  showActions?: boolean;
}

/**
 * Props for the StoryCardActions component
 */
export interface StoryCardActionsProps extends StoryCardBaseProps {
  onView?: (story: Story) => void;
  onEdit?: (story: Story) => void;
  onDelete?: (story: Story) => void;
  onContinue?: (story: Story) => void;
  primaryAction?: 'view' | 'edit' | 'continue';
  showSecondaryActions?: boolean;
  customActions?: React.ReactNode;
}

/**
 * Available badge types for story cards
 */
export type StoryCardBadgeType = 'completed' | 'in-progress' | 'new' | 'featured';