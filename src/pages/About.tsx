
import React from 'react';
import ExampleStoriesSection from '@/components/home/ExampleStoriesSection';
import WhyTaleForgeWorksSection from '@/components/home/WhyTaleForgeWorksSection';
import FAQSection from '@/components/home/FAQSection';
import Footer from '@/components/home/Footer';

const About: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative">
      {/* Hero Section for About Page */}
      <section className="py-8 md:py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-6 md:p-8 border border-white/20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 font-serif magical-text">
              What is Tale Forge?
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-sans">
              Everything you need to know about creating magical, interactive stories with AI
            </p>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <ExampleStoriesSection />

      {/* Why Tale Forge Works */}
      <WhyTaleForgeWorksSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
