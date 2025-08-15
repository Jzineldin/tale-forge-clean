
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar, Zap, Bug, Plus, ArrowRight, Wand2 } from 'lucide-react';
import ChangelogManager from '@/utils/changelogManager';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    type: 'feature' | 'improvement' | 'fix';
    description: string;
  }[];
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'feature':
      return <Plus className="h-4 w-4 text-green-400" />;
    case 'improvement':
      return <Zap className="h-4 w-4 text-blue-400" />;
    case 'fix':
      return <Bug className="h-4 w-4 text-orange-400" />;
    default:
      return <ArrowRight className="h-4 w-4 text-gray-400" />;
  }
};

const getVersionBadgeColor = (type: string) => {
  switch (type) {
    case 'major':
      return 'bg-red-500/20 text-red-300 border-red-500/40';
    case 'minor':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    case 'patch':
      return 'bg-green-500/20 text-green-300 border-green-500/40';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
  }
};

interface ChangelogModalProps {
  trigger?: React.ReactNode;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);

  useEffect(() => {
    // Load initial changelog
    const loadedChangelog = ChangelogManager.getCurrentChangelog();
    // Sort by date (newest first) to ensure proper chronological order
    const sortedChangelog = [...loadedChangelog].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    setChangelog(sortedChangelog);
    
    // Listen for changelog updates
    const handleChangelogUpdate = (event: CustomEvent) => {
      const updatedChangelog = [...event.detail].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      setChangelog(updatedChangelog);
    };
    
    window.addEventListener('changelog-updated', handleChangelogUpdate as EventListener);
    
    return () => {
      window.removeEventListener('changelog-updated', handleChangelogUpdate as EventListener);
    };
  }, []);

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="text-amber-200 hover:text-amber-100 hover:bg-amber-600/20">
      <Wand2 className="mr-2 h-4 w-4" />
      What's New
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-slate-900 border-amber-600/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-300 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Changelog
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Latest updates, features, and improvements to Tale Forge
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {changelog.map((entry) => (
              <div key={entry.version} className="border-l-2 border-amber-600/30 pl-6 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-amber-600 rounded-full border-2 border-slate-900"></div>
                
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-white">v{entry.version}</h3>
                  <Badge className={`${getVersionBadgeColor(entry.type)} border`}>
                    {entry.type}
                  </Badge>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  {entry.changes.map((change, changeIndex) => (
                    <div key={changeIndex} className="flex items-start gap-3 text-gray-300">
                      {getTypeIcon(change.type)}
                      <span className="text-sm leading-relaxed">{change.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ChangelogModal;
