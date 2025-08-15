
import React from 'react';
import { Story } from '@/types/stories';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MyStoriesTableRow } from './MyStoriesTableRow';

interface MyStoriesTableProps {
    stories: Story[];
    onSetStoryToDelete: (storyId: string) => void;
}

export const MyStoriesTable: React.FC<MyStoriesTableProps> = ({ stories, onSetStoryToDelete }) => {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[35%]">Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stories.map((story) => (
                        <MyStoriesTableRow key={story.id} story={story} onSetStoryToDelete={onSetStoryToDelete} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
