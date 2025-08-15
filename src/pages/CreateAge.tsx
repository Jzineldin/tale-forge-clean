import React from 'react';
import AgeSelection from '@/components/story-creation/AgeSelection';

// SEO meta handled globally; ensure a canonical intent for this flow via title


const CreateAge: React.FC = () => {
  const handleComplete = () => {
    // handled via navigation inside component
  };

  return (
    <AgeSelection onComplete={handleComplete} />
  );
};

export default CreateAge; 