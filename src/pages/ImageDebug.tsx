import React from 'react';
import ImageLoadingDebug from '@/components/debug/ImageLoadingDebug';

const ImageDebugPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        Story Card Image Loading Debug
      </h1>
      <ImageLoadingDebug />
    </div>
  );
};

export default ImageDebugPage;