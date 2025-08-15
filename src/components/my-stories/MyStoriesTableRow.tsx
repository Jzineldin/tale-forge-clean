
import React from 'react';
import { Story } from '@/types/stories';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { StoryStatusBadge } from './StoryStatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface MyStoriesTableRowProps {
    story: Story;
    onSetStoryToDelete: (storyId: string) => void;
}

export const MyStoriesTableRow: React.FC<MyStoriesTableRowProps> = ({ story, onSetStoryToDelete }) => {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <Link to={`/story/${story.id}`} className="hover:underline">
                    {story.title || 'Untitled Story'}
                </Link>
            </TableCell>
            <TableCell><StoryStatusBadge story={story} /></TableCell>
            <TableCell>{format(new Date(story.created_at), 'MMM d, yyyy')}</TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="orange-base" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-text-dark" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link to={`/story/${story.id}`} className="w-full cursor-pointer">View</Link>
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                            <div onClick={() => onSetStoryToDelete(story.id)} className="flex items-center w-full">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </div>
                        </DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
};
