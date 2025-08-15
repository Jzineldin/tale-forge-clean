import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// import { toast } from 'sonner';
import { Sparkles, Star, ChevronLeft, ChevronRight, Plus, Minus, ArrowRight, Info } from 'lucide-react';
import Footer from './home/Footer';
import FounderCounter from '@/components/founder/FounderCounter';
import LatestFeaturesShowcase from '@/components/home/LatestFeaturesShowcase';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import { ASSET_VERSION } from '@/config/version';
import '@/styles/hero-buttons.css';
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [isWhatIsTaleForgeOpen, setIsWhatIsTaleForgeOpen] = useState(false);
  const {
    checkAuthAndExecute,
    showAuthModal,
    setShowAuthModal
  } = useAuthRequired({
    feature: 'story creation'
  });

  // Handle Google OAuth hash fragments on root page
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      console.log('[AUTH] Detected OAuth hash on root page, redirecting to callback');
      // Use React Router navigation instead of window.location.href
      navigate(`/auth/callback${hash}`, {
        replace: true
      });
    }
  }, [navigate]);
  const handleCreateStory = () => {
    checkAuthAndExecute(() => {
      navigate('/create/age');
    });
  };
  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  };
  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Remove the broken waitlist handler - we'll use the proper WaitlistSignup component instead

  const testimonials = [{
    quote: "This app is awesome... The process is very clear and it's definitely something I'd use. Amazing job!",
    author: "Product Tester",
    stars: 5
  }, {
    quote: "Feature-rich, polished, and aimed at a well-defined audience. It feels like you could really click with parents and educators.",
    author: "Education Professional",
    stars: 5
  }, {
    quote: "Great idea! It solves a real problem and design looks great! Best of luck with scaling!",
    author: "Beta Reviewer",
    stars: 5
  }, {
    quote: "I love the storytelling concept! Interactive stories could help parents bond and learn together.",
    author: "Parent & Developer",
    stars: 5
  }, {
    quote: "Great app! Flows well and has a lot of features. Quality looks great - you have a great chance!",
    author: "User Tester",
    stars: 5
  }];

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
    return () => {};
  }, [isPaused, testimonials.length]);
  return <div className="min-h-screen w-full relative">
      {/* Original beautiful background */}
      <div className="scene-bg"></div>

      <div className="relative z-10">
        {/* Sticky Mobile CTA Button */}
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
          <Button onClick={handleCreateStory} variant="primary" size="mobile" className="w-full font-bold">
            <Sparkles className="mr-2 h-5 w-5" />
            Start Creating Stories
          </Button>
        </div>

        {/* 1. HERO SECTION - Clean Professional Layout */}
        <div className="hero-section relative pt-20 pb-12 flex items-center justify-center px-4">
          <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl p-6 md:p-8 lg:p-10 max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            <div className="text-center">
              {/* Main Title */}
              <h1 className="fantasy-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-6 sm:mb-8 text-center" style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.6)'
              }}>
                TALE FORGE
              </h1>
              {/* Subtitle */}
              <h2 className="fantasy-heading text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight" style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.6)'
              }}>
                CREATE MAGICAL STORIES<br />
                TOGETHER!
              </h2>
              {/* Description */}
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white mb-4 sm:mb-6 md:mb-8 max-w-xl sm:max-w-2xl mx-auto leading-relaxed" style={{
                textShadow: '0 1px 3px rgba(0,0,0,0.7)'
              }}>
                Transform your ideas into enchanting stories with AI-powered creativity. Perfect for families, educators, and storytellers of all ages!
              </p>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-0">
                {/* What is Tale Forge? - Deep orange (most orange) */}
                <Button onClick={() => setIsWhatIsTaleForgeOpen(!isWhatIsTaleForgeOpen)} variant="orange" size="lg" className="w-full sm:w-auto font-bold text-base sm:text-lg">
                  <Info className="mr-2 h-5 w-5" />
                  What is Tale Forge?
                </Button>
                {/* Primary Action - Regular orange */}
                <Button onClick={handleCreateStory} variant="orange-amber" size="lg" className="w-full sm:w-auto font-bold text-base sm:text-lg">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Creating Stories
                </Button>
                {/* Discover Stories - Yellowish orange */}
                <Button onClick={() => navigate('/discover')} variant="yellow-orange" size="lg" className="w-full sm:w-auto font-bold text-base sm:text-lg">
                  📚 Discover Stories
                </Button>
              </div>
              
              {/* What is Tale Forge? Content - Simplified Slide-in Animation */}
              <div className={`
                  overflow-hidden transition-all duration-500 ease-out
                  ${isWhatIsTaleForgeOpen ? 'max-h-[800px] mt-8 opacity-100' : 'max-h-0 mt-0 opacity-0'}
                `}>
                <div className={`
                    glass-enhanced rounded-xl p-6 border border-amber-500/30
                    transition-all duration-500 ease-out
                    ${isWhatIsTaleForgeOpen ? 'translate-x-0' : 'translate-x-full'}
                  `}>
                  <h3 className="fantasy-heading text-xl sm:text-2xl font-bold mb-4 text-amber-400" style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                  }}>
                    About Tale Forge
                  </h3>
                  
                  <p className="text-base sm:text-lg mb-6 leading-relaxed" style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                  }}>
                    Tale Forge is an AI-powered storytelling platform that helps families, educators, and creative minds craft engaging, personalized stories in minutes. Our technology transforms simple ideas into enchanting narratives that captivate and inspire.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-black/20 p-4 rounded-lg border border-amber-500/20">
                      <h4 className="text-amber-400 font-bold mb-2" style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                      }}>For Families</h4>
                      <p className="text-sm" style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                      }}>Create bedtime stories featuring your children's names, interests, and adventures.</p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="text-purple-400 font-bold mb-2" style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                      }}>For Educators</h4>
                      <p className="text-sm" style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                      }}>Craft educational stories that make learning fun and engaging for students.</p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg border border-blue-500/20">
                      <h4 className="text-blue-400 font-bold mb-2" style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                      }}>For Creators</h4>
                      <p className="text-sm" style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                      }}>Generate story ideas, character concepts, and narrative frameworks in seconds.</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <Button onClick={handleCreateStory} variant="primary" size="default" className="font-bold">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Try It Now
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Removed translation text here */}
            </div>
          </div>
        </div>

        {/* Latest Features Showcase */}
        <LatestFeaturesShowcase />

        {/* Social Proof Metrics Section - ENHANCED SPACING & FANTASY TYPOGRAPHY */}
        <section className="pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="glass-enhanced rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12">
              <div className="grid grid-cols-3 gap-6 sm:gap-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="fantasy-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{
                  paddingBottom: '8px',
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                }}>
                    500+
                  </div>
                  <div className="fantasy-body text-sm sm:text-base leading-tight" style={{
                  paddingBottom: '8px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                }}>
                    Stories Created
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="fantasy-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{
                  paddingBottom: '8px',
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                }}>
                    30+
                  </div>
                  <div className="fantasy-body text-sm sm:text-base leading-tight" style={{
                  paddingBottom: '8px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                }}>
                    Countries
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="fantasy-heading text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-tight" style={{
                  paddingBottom: '8px',
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                }}>
                    Built by
                  </div>
                  <div className="fantasy-body text-sm sm:text-base leading-tight" style={{
                  paddingBottom: '8px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                }}>
                    Parents, Teachers & Kids
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. WHY TALEFORGE? - ENHANCED SPACING & FANTASY TYPOGRAPHY */}
        <section className="py-16 sm:py-20 md:py-32 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 px-2" style={{
            paddingBottom: '16px'
          }}>
              <h2 className="fantasy-heading text-4xl md:text-5xl font-bold text-center mb-4" style={{
              lineHeight: '1.2',
              paddingBottom: '12px',
              textShadow: '0 2px 4px rgba(0,0,0,0.6)'
            }}>
                Why Tale Forge?
              </h2>
              <p className="section-body-text text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-3xl mx-auto leading-relaxed" style={{
              lineHeight: '1.5',
              paddingBottom: '12px',
              textShadow: '0 1px 3px rgba(0,0,0,0.7)'
            }}>
                Everything families need for magical storytelling
              </p>
            </div>

            <div className="glass-enhanced rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
                {/* Feature 1 - Fantasy Typography */}
                <div className="text-center relative">
                  <div className="text-4xl sm:text-5xl mb-4 sm:mb-6" style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)'
                  }}>🎭</div>
                  <h3 className="fantasy-heading text-lg sm:text-xl font-bold mb-3 sm:mb-4 leading-tight" style={{
                  lineHeight: '1.2',
                  paddingBottom: '8px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                }}>
                    Kids Create
                  </h3>
                  <p className="fantasy-body text-sm sm:text-base leading-relaxed" style={{
                  lineHeight: '1.5',
                  paddingBottom: '8px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                }}>
                    Your children become storytellers, not just story listeners
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-0.5 h-12 bg-amber-400"></div>
                </div>

                {/* Feature 2 - Fantasy Typography */}
                <div className="text-center relative">
                  <div className="text-4xl sm:text-5xl mb-4 sm:mb-6" style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)'
                  }}>🎵</div>
                  <h3 className="fantasy-heading text-lg sm:text-xl font-bold mb-3 sm:mb-4 leading-tight" style={{
                  lineHeight: '1.2',
                  paddingBottom: '8px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                }}>
                    Pro Narration
                  </h3>
                  <p className="fantasy-body text-sm sm:text-base leading-relaxed" style={{
                  lineHeight: '1.5',
                  paddingBottom: '8px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                }}>
                    Stories read back with broadcast-quality voices
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-0.5 h-12 bg-amber-400"></div>
                </div>

                {/* Feature 3 - Fantasy Typography */}
                <div className="text-center relative">
                  <div className="text-4xl sm:text-5xl mb-4 sm:mb-6" style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)'
                  }}>📱</div>
                  <h3 className="fantasy-heading text-lg sm:text-xl font-bold mb-3 sm:mb-4 leading-tight" style={{
                  lineHeight: '1.2',
                  paddingBottom: '8px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                }}>
                    Works Anywhere
                  </h3>
                  <p className="fantasy-body text-sm sm:text-base leading-relaxed" style={{
                  lineHeight: '1.5',
                  paddingBottom: '8px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                }}>
                    Create on laptop, listen on phone, print for bedtime
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-0.5 h-12 bg-amber-400"></div>
                </div>

                {/* Feature 4 - Fantasy Typography */}
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl mb-4 sm:mb-6" style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)'
                  }}>✅</div>
                  <h3 className="fantasy-heading text-lg sm:text-xl font-bold mb-3 sm:mb-4 leading-tight" style={{
                  lineHeight: '1.2',
                  paddingBottom: '8px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                }}>
                    Parent Approved
                  </h3>
                  <p className="fantasy-body text-sm sm:text-base leading-relaxed" style={{
                  lineHeight: '1.5',
                  paddingBottom: '8px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                }}>
                    Safe, educational, and sparks creativity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS - ENHANCED SPACING & FANTASY TYPOGRAPHY */}
        <section className="py-16 sm:py-20 md:py-32 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 px-2" style={{
            paddingBottom: '16px'
          }}>
              <h2 className="fantasy-heading text-4xl md:text-5xl font-bold text-center mb-4" style={{
              lineHeight: '1.2',
              paddingBottom: '12px',
              textShadow: '0 2px 4px rgba(0,0,0,0.6)'
            }}>
                How It Works
              </h2>
              <p className="text-lg text-center mb-8 text-white" style={{
              lineHeight: '1.5',
              paddingBottom: '12px',
              textShadow: '0 1px 3px rgba(0,0,0,0.7)'
            }}>
                Simple, exciting, and perfect for families
              </p>
            </div>

            <div className="glass-enhanced rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
                {/* Step 1 */}
                <div className="text-center relative">
                  <div className="text-5xl mb-6" style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)'
                  }}>⚡</div>
                  <h3 className="fantasy-heading text-xl sm:text-2xl font-bold mb-4 text-amber-400" style={{
                  lineHeight: '1.3',
                  paddingBottom: '12px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                }}>
                    Choose Your Adventure
                  </h3>
                  <p className="fantasy-body text-base sm:text-lg" style={{
                  lineHeight: '1.6',
                  paddingBottom: '12px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                }}>
                    Pick a theme or let your imagination run wild
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden md:block absolute top-1/2 -right-6 w-0.5 h-12 bg-amber-400"></div>
                </div>

                {/* Step 2 */}
                <div className="text-center relative">
                  <div className="text-5xl mb-6" style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)'
                  }}>🎭</div>
                  <h3 className="fantasy-heading text-xl sm:text-2xl font-bold mb-4 text-amber-400" style={{
                  lineHeight: '1.3',
                  paddingBottom: '12px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                }}>
                    Create Together
                  </h3>
                  <p className="fantasy-body text-base sm:text-lg" style={{
                  lineHeight: '1.6',
                  paddingBottom: '12px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                }}>
                    Kids guide the story, AI helps with the magic
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden md:block absolute top-1/2 -right-6 w-0.5 h-12 bg-amber-400"></div>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="text-5xl mb-6" style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)'
                  }}>🎵</div>
                  <h3 className="fantasy-heading text-xl sm:text-2xl font-bold mb-4 text-amber-400" style={{
                  lineHeight: '1.3',
                  paddingBottom: '12px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                }}>
                    Listen & Share
                  </h3>
                  <p className="fantasy-body text-base sm:text-lg" style={{
                  lineHeight: '1.6',
                  paddingBottom: '12px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                }}>
                    Professional narration brings your story to life
                  </p>
                </div>
              </div>
            </div>

            {/* Try It Now Button */}
            <div className="text-center mt-20 sm:mt-24">
              <Button onClick={handleCreateStory} variant="primary" size="lg" className="px-12 py-6 text-2xl font-semibold">
                <Sparkles className="mr-3 h-7 w-7" />
                Try It Now
              </Button>
            </div>
          </div>
        </section>



        {/* 5. LOVED BY FAMILIES & EDUCATORS - TESTIMONIALS */}
        <section className="py-20 sm:py-24 md:py-32 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 sm:mb-20" style={{
            paddingBottom: '20px'
          }}>
              <h2 className="fantasy-heading text-4xl md:text-5xl font-bold text-center mb-4" style={{
              lineHeight: '1.3',
              paddingBottom: '16px',
              textShadow: '0 2px 4px rgba(0,0,0,0.6)'
            }}>
                Loved by Families & Educators
              </h2>
              <p className="text-lg text-center mb-8 text-white" style={{
              lineHeight: '1.6',
              paddingBottom: '12px',
              textShadow: '0 1px 3px rgba(0,0,0,0.7)'
            }}>
                Real stories from real families
              </p>
              <p className="section-subheading text-base sm:text-lg" style={{
              paddingBottom: '12px',
              textShadow: '0 1px 2px rgba(0,0,0,0.7)'
            }}>
                Review {currentTestimonial + 1} of {testimonials.length}
                {!isPaused && <span className="ml-2 text-sm opacity-70" style={{textShadow: '0 1px 2px rgba(0,0,0,0.7)'}}>• Auto-playing</span>}
                {isPaused && <span className="ml-2 text-sm opacity-70" style={{textShadow: '0 1px 2px rgba(0,0,0,0.7)'}}>• Paused</span>}
              </p>
            </div>

            <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
              <div className="glass-enhanced rounded-2xl p-8">
                <div className="text-center">
                  <div className="text-4xl text-amber-400 mb-4" style={{
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  paddingBottom: '8px'
                }}>
                    "
                  </div>
                  <blockquote className="text-lg text-high-contrast mb-6 italic leading-relaxed max-w-3xl mx-auto min-h-[120px] flex items-center justify-center" style={{
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  lineHeight: '1.6',
                  paddingBottom: '8px'
                }}>
                    {testimonials[currentTestimonial].quote}
                  </blockquote>
                  
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[currentTestimonial].stars)].map((_, i) => <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />)}
                  </div>
                  
                  <p className="text-amber-400 font-bold" style={{
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  paddingBottom: '8px'
                }}>
                    — {testimonials[currentTestimonial].author}
                  </p>
                </div>
              </div>

              {/* Navigation arrows */}
              <button onClick={prevTestimonial} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-black p-3 rounded-full transition-all duration-300 shadow-lg" style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={nextTestimonial} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-black p-3 rounded-full transition-all duration-300 shadow-lg" style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Enhanced navigation dots */}
              <div className="flex justify-center mt-8 space-x-3">
                {testimonials.map((_, index) => <button key={index} onClick={() => setCurrentTestimonial(index)} className={`w-4 h-4 rounded-full transition-all duration-300 hover:scale-110 ${index === currentTestimonial ? 'bg-amber-400 shadow-lg shadow-amber-400/50' : 'bg-white/30 hover:bg-white/50'}`} />)}
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ SECTION - ENHANCED SPACING & FANTASY TYPOGRAPHY */}
        <section className="py-20 sm:py-24 md:py-32 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 sm:mb-20" style={{
            paddingBottom: '20px'
          }}>
              <h2 className="fantasy-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{
              lineHeight: '1.3',
              paddingBottom: '16px',
              textShadow: '0 2px 4px rgba(0,0,0,0.6)'
            }}>
                Got Questions?
              </h2>
              <p className="fantasy-body text-lg sm:text-xl max-w-3xl mx-auto" style={{
              lineHeight: '1.6',
              paddingBottom: '12px',
              textShadow: '0 1px 3px rgba(0,0,0,0.7)'
            }}>
                Everything you need to know about Tale Forge
              </p>
            </div>

            <div className="glass-enhanced rounded-2xl p-8 sm:p-10 md:p-12">
              <div className="space-y-6 sm:space-y-8">
                {/* FAQ Item 1 */}
                <div className="border-b border-amber-500/20 pb-6 last:border-b-0">
                  <button onClick={() => setExpandedFAQ(expandedFAQ === 0 ? null : 0)} className="w-full flex items-center justify-between text-left p-4 rounded-lg hover:bg-amber-500/10 transition-all duration-300">
                    <h3 className="fantasy-heading text-lg sm:text-xl font-bold pr-4" style={{
                    lineHeight: '1.3',
                    paddingBottom: '8px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                  }}>
                      Is Tale Forge safe for kids?
                    </h3>
                    <div className="flex-shrink-0">
                      {expandedFAQ === 0 ? <Minus className="h-5 w-5 text-amber-400 transition-transform duration-300" /> : <Plus className="h-5 w-5 text-amber-400 transition-transform duration-300" />}
                    </div>
                  </button>
                  {expandedFAQ === 0 && <div className="px-4 pb-4">
                      <p className="fantasy-body text-base sm:text-lg leading-relaxed" style={{
                    lineHeight: '1.6',
                    paddingBottom: '12px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                  }}>
                        Yes! Our AI creates family-friendly stories with positive themes like friendship, adventure, and learning.
                      </p>
                    </div>}
                </div>

                {/* FAQ Item 2 */}
                <div className="border-b border-amber-500/20 pb-6 last:border-b-0">
                  <button onClick={() => setExpandedFAQ(expandedFAQ === 1 ? null : 1)} className="w-full flex items-center justify-between text-left p-4 rounded-lg hover:bg-amber-500/10 transition-all duration-300">
                    <h3 className="fantasy-heading text-lg sm:text-xl font-bold pr-4" style={{
                    lineHeight: '1.3',
                    paddingBottom: '8px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                  }}>
                      What ages is this designed for?
                    </h3>
                    <div className="flex-shrink-0">
                      {expandedFAQ === 1 ? <Minus className="h-5 w-5 text-amber-400 transition-transform duration-300" /> : <Plus className="h-5 w-5 text-amber-400 transition-transform duration-300" />}
                    </div>
                  </button>
                  {expandedFAQ === 1 && <div className="px-4 pb-4">
                      <p className="fantasy-body text-base sm:text-lg leading-relaxed" style={{
                    lineHeight: '1.6',
                    paddingBottom: '12px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                  }}>
                        Perfect for children ages 4-12, but enjoyable for the whole family.
                      </p>
                    </div>}
                </div>

                {/* FAQ Item 3 */}
                <div className="border-b border-amber-500/20 pb-6 last:border-b-0">
                  <button onClick={() => setExpandedFAQ(expandedFAQ === 2 ? null : 2)} className="w-full flex items-center justify-between text-left p-4 rounded-lg hover:bg-amber-500/10 transition-all duration-300">
                    <h3 className="fantasy-heading text-lg sm:text-xl font-bold pr-4" style={{
                    lineHeight: '1.3',
                    paddingBottom: '8px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                  }}>
                      When will it be available?
                    </h3>
                    <div className="flex-shrink-0">
                      {expandedFAQ === 2 ? <Minus className="h-5 w-5 text-amber-400 transition-transform duration-300" /> : <Plus className="h-5 w-5 text-amber-400 transition-transform duration-300" />}
                    </div>
                  </button>
                  {expandedFAQ === 2 && <div className="px-4 pb-4">
                      <p className="fantasy-body text-base sm:text-lg leading-relaxed" style={{
                    lineHeight: '1.6',
                    paddingBottom: '12px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                  }}>
                        We're in final testing now. Waitlist members will get first access in the coming weeks.
                      </p>
                    </div>}
                </div>
              </div>

              {/* View All FAQs Link */}
              <div className="text-center mt-8 pt-6 border-t border-amber-500/20">
                <button onClick={() => navigate('/about')} className="text-amber-400 hover:text-amber-300 font-medium transition-colors duration-300 flex items-center justify-center gap-2 mx-auto" style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                lineHeight: '1.5',
                paddingBottom: '8px'
              }}>
                  View All FAQs
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FOUNDER PROGRAM SECTION */}
        <section id="founder-section" className="py-20 sm:py-24 md:py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-enhanced rounded-3xl p-8 sm:p-10 md:p-12">
              
              <h2 className="fantasy-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-purple-400" style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.6)'
              }}>
                🚀 Join the Founder Program
              </h2>
              <p className="fantasy-body text-base sm:text-lg md:text-xl text-white mb-6" style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.7)'
              }}>Help shape the future of storytelling. Founders get exclusive access, lifetime benefits, and become part of Tale Forge history. Once the founder program closes, these perks are gone forever. 🚀</p>
              
              <FounderCounter />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                
                
              </div>

              <div className="max-w-md mx-auto">
                <Button onClick={() => navigate('/discover')} variant="primary" size="lg" className="w-full font-bold py-4 px-8 text-lg">
                  🚀 Discover Stories
                </Button>
              </div>

              <p className="fantasy-subtitle text-base sm:text-lg mt-6" style={{
              lineHeight: '1.5',
              paddingBottom: '12px',
              textShadow: '0 1px 2px rgba(0,0,0,0.7)'
            }}>
                No credit card required. We'll notify you when you can start creating stories!
              </p>
            </div>
          </div>
        </section>



        {/* Footer */}
        <Footer />
      </div>
      
      {/* Authentication Required Modal */}
      <AuthRequiredModal open={showAuthModal} onOpenChange={setShowAuthModal} feature="story creation" />
    </div>;
};
export default HomePage;