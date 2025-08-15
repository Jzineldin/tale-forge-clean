
import React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "How long are the stories Tale Forge creates?",
      answer: "Stories typically range from 10-20 chapters, with each chapter containing 200-400 words. You can continue or conclude your story at any point based on your choices."
    },
    {
      question: "What happens to my stories after I create them?",
      answer: "Your stories are saved to your account permanently. You can revisit, continue, or share them anytime. You maintain full ownership of your creative content."
    },
    {
      question: "What genres work best with Tale Forge?",
      answer: "Tale Forge excels with any genre - fantasy, sci-fi, mystery, romance, adventure, horror, comedy, and more. The AI adapts its writing style to match your chosen genre and tone."
    },
    {
      question: "Can I share my stories with others?",
      answer: "Yes! Stories can be shared with family and friends. You can also publish your favorites to our community gallery for other users to discover and enjoy."
    },
    {
      question: "Do I need any writing experience?",
      answer: "Not at all! Just describe your story idea in a few sentences - like 'a detective in Victorian London' or 'kids discover a time machine.' Tale Forge handles all the complex storytelling."
    },
    {
      question: "How does the image and audio generation work?",
      answer: "Our AI automatically creates custom images for key story moments and generates professional voice narration. You can choose different voice styles and image preferences to match your story's mood."
    }
  ];

  return (
    <section className="py-8 md:py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-6 md:p-8 border border-white/20">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 font-serif magical-text">
              Common Questions
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-sans">
              Everything you need to know about creating with Tale Forge
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-black/20 rounded-xl border border-white/10 px-6"
              >
                <AccordionTrigger className="text-white font-serif text-left hover:text-amber-300 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 font-sans leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
