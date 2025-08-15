export interface StoryCardProps {
  id: string;
  title: string;
  createdAt: string;
  isCompleted?: boolean;
  thumbnailUrl?: string;
  story: any;
  variant?: string;
  onClick?: (story: any) => void;
  linkTo?: string;
  className?: string;
}