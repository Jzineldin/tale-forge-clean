import { Link } from 'react-router-dom';
import { wizardGrad, wizardCard, wizardBtn } from '@/lib/theme';

interface StoryFinishedProps {
  story: {
    id: string;
    title: string;
    wordCount?: number;
    segment_count?: number;
  };
}

export default function StoryFinished({ story }: StoryFinishedProps) {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
        <div className={wizardGrad + ' absolute inset-0'} />
        <div className={wizardCard + ' text-center'}>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Story Complete 🎉</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            You just authored a <strong>{story.wordCount || story.segment_count || 'wonderful'}</strong>-word adventure.
          </p>

          {/* actions */}
          <div className="flex justify-center space-x-3 mt-6">
            <Link to="/">
              <button className={`fantasy-heading ${wizardBtn}`}>New Story</button>
            </Link>
            <Link to={`/story/${story.id}?watch`}>
              <button className={`fantasy-heading ${wizardBtn}`}>Watch Again</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 