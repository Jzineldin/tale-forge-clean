import React, { useEffect } from 'react';

const Terms: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Service | Tale Forge';
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (meta) meta.content = 'Read the Tale Forge Terms of Service outlining your rights and responsibilities.';
  }, []);

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <article className="prose prose-invert max-w-none">
          <p>By using Tale Forge, you agree to these terms. Please read them carefully.</p>
          <p>We provide our services as-is and may update features from time to time.</p>
          <p>For any questions, contact info@tale-forge.app.</p>
        </article>
      </section>
    </main>
  );
};

export default Terms;
