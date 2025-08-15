import React, { useEffect } from 'react';

const Privacy: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | Tale Forge';
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (meta) meta.content = 'Read the Tale Forge Privacy Policy to understand how we handle your data.';
  }, []);

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <article className="prose prose-invert max-w-none">
          <p>We respect your privacy. This page explains what data we collect, why we collect it, and how it is used.</p>
          <p>We collect minimal data necessary to provide the service, improve performance, and secure your account.</p>
          <p>If you have questions, contact us at info@tale-forge.app.</p>
        </article>
      </section>
    </main>
  );
};

export default Privacy;
