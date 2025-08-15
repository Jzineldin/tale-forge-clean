
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const StoryCardSkeleton = () => (
  <Card className="h-full flex flex-col">
    <CardHeader className="p-0">
      <Skeleton className="aspect-video w-full rounded-t-lg" />
    </CardHeader>
    <CardContent className="p-4 flex-grow">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2" />
    </CardContent>
    <CardFooter className="p-4 pt-0 flex justify-between items-center border-t mt-auto">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 w-16" />
    </CardFooter>
  </Card>
);

export default StoryCardSkeleton;
