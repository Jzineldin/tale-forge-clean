// React imported by HomePage component
import { Helmet } from 'react-helmet-async';
import HomePage from '@/components/HomePage';

const Index = () => {
  console.log('Index component: Rendering unified homepage with kid-focused messaging');

  const title = "Tale Forge: Kids' AI Story Maker with Choices";
  const description = "Create interactive children’s stories with AI. Pick genres, make choices, and generate images — safe, magical, and fun.";
  const canonical = typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://tale-forge.io/';

  return (
    <div className="min-h-screen w-full relative">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <HomePage />
    </div>
  );
};

export default Index;
