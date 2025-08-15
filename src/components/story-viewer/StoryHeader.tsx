
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Share2 } from 'lucide-react';
import { StoryWithSegments } from '@/types/stories';

interface StoryHeaderProps {
    story: StoryWithSegments;
    onPublish: () => void;
    isPublishing: boolean;
}

const StoryHeader: React.FC<StoryHeaderProps> = ({ story, onPublish, isPublishing }) => {
    return (
        <>
            <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/"><Home className="h-4 w-4" /></Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/my-stories">My Stories</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{story.title || 'Untitled Story'}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">{story.title || 'Untitled Story'}</h1>
                {!story.is_public && (
                     <Button onClick={onPublish} disabled={isPublishing}>
                        <Share2 className="mr-2 h-4 w-4" />
                        {isPublishing ? 'Publishing...' : 'Publish Story'}
                    </Button>
                )}
            </div>
        </>
    )
}

export default StoryHeader;
