import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface ChapterCardProps {
  chapter: {
    id: string;
    segment_text: string;
    image_url?: string;
    image_generation_status?: string;
  };
  index: number;
}

const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, index }) => {
  return (
    <Card className="glass-enhanced backdrop-blur-lg bg-black/20 border border-amber-500/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-6">
        {/* Chapter Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
            <BookOpen className="h-5 w-5 text-amber-300" />
          </div>
          <h3 className="text-xl font-serif font-bold text-amber-200" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
            Chapter {index + 1}
          </h3>
        </div>

        {/* Image Section - Show image, placeholder, or loading state */}
        <div className="mb-6">
          {chapter.image_url && chapter.image_url !== '/placeholder.svg' ? (
            <img
              src={chapter.image_url}
              alt={`Chapter ${index + 1} illustration`}
              className="w-full h-64 object-cover rounded-lg border border-amber-500/30 shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : chapter.image_generation_status === 'in_progress' || chapter.image_generation_status === 'pending' ? (
            <div className="w-full h-64 bg-gradient-to-br from-slate-800 via-amber-900/20 to-slate-900 rounded-lg border border-amber-500/30 flex items-center justify-center">
              <div className="text-center text-amber-300">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-2"></div>
                <p className="text-sm">Generating image...</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-slate-800 via-purple-900/20 to-slate-900 rounded-lg border border-amber-500/30 flex items-center justify-center">
              <div className="text-center text-amber-400">
                <div className="text-4xl mb-2">📖</div>
                <p className="text-sm">No image available</p>
              </div>
            </div>
          )}
        </div>

        {/* Text Content - Always visible on solid background */}
        <div className="bg-black/30 rounded-lg p-4 border border-amber-500/20">
          <p className="text-white/95 leading-relaxed text-base" style={{textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>
            {chapter.segment_text}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChapterCard; 