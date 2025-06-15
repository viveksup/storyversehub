import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, MessageCircle, Mail, Phone } from 'lucide-react';
import Button from '../components/ui/Button';

const SupportPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqCategories = [
    {
      title: 'Getting Started',
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Click the "Sign Up" button in the top right corner, enter your email and password, and verify your email address. You can start reading immediately after signing up!'
        },
        {
          question: 'Is StoryVerse Hub free to use?',
          answer: 'Yes! We offer a free tier that includes access to 50% of our content library, basic AI recommendations, and the ability to create up to 3 stories per month. Premium plans unlock additional features.'
        },
        {
          question: 'How do I start reading stories?',
          answer: 'Browse our library by visiting the Explore page, use the search function, or check out our curated recommendations on your dashboard. Simply click on any story to start reading!'
        }
      ]
    },
    {
      title: 'Reading & Listening',
      faqs: [
        {
          question: 'How does AI voice narration work?',
          answer: 'Our AI voice narration uses advanced text-to-speech technology to read stories aloud. Free users have access to 2 basic voices, while Premium subscribers can choose from our full library of premium voices with different accents and styles.'
        },
        {
          question: 'Can I download stories for offline reading?',
          answer: 'Offline reading is available for Premium and Family subscribers. Look for the download icon on any story page to save it for offline access.'
        },
        {
          question: 'How do I adjust reading settings?',
          answer: 'While reading any story, use the settings panel to adjust font size, line height, theme (light/dark), and voice options. Your preferences are automatically saved.'
        }
      ]
    },
    {
      title: 'Creating Content',
      faqs: [
        {
          question: 'How do I publish my own stories?',
          answer: 'Go to the Create page, write your story using our editor, add a title and description, select categories and tags, then click "Publish Story". You can also save drafts to work on later.'
        },
        {
          question: 'What is the AI Writing Assistant?',
          answer: 'Available to Premium subscribers, our AI Writing Assistant helps with plot development, character creation, dialogue suggestions, and overcoming writer\'s block. It enhances your creativity without replacing your unique voice.'
        },
        {
          question: 'Can I monetize my stories?',
          answer: 'We\'re working on creator monetization features. Currently, popular creators can apply for our Creator Fund program. Stay tuned for more monetization options!'
        }
      ]
    },
    {
      title: 'Account & Billing',
      faqs: [
        {
          question: 'How do I upgrade to Premium?',
          answer: 'Visit the Pricing page and select your preferred plan. We accept all major credit cards and offer secure payment processing through Razorpay.'
        },
        {
          question: 'Can I cancel my subscription anytime?',
          answer: 'Yes, you can cancel your subscription at any time from your account settings. You\'ll continue to have Premium access until the end of your current billing period.'
        },
        {
          question: 'What\'s included in the Family plan?',
          answer: 'The Family plan supports up to 6 family members, includes parental controls, shared family library, collaborative story creation tools, and all Premium features for each account.'
        }
      ]
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-space-light to-space-base py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Help & Support
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Find answers to common questions or get in touch with our support team.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-4 bg-space-dark/50 border border-space-light/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Contact Options Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-display font-bold text-white mb-6">
              Need More Help?
            </h2>
            
            <div className="space-y-4">
              <div className="bg-space-base/50 rounded-xl p-6 border border-space-light/20">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle size={24} className="text-primary-400" />
                  <h3 className="font-semibold text-white">Live Chat</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Get instant help from our support team
                </p>
                <Button variant="primary" size="sm" className="w-full">
                  Start Chat
                </Button>
              </div>

              <div className="bg-space-base/50 rounded-xl p-6 border border-space-light/20">
                <div className="flex items-center gap-3 mb-3">
                  <Mail size={24} className="text-secondary-400" />
                  <h3 className="font-semibold text-white">Email Support</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Send us a detailed message
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Send Email
                </Button>
              </div>

              <div className="bg-space-base/50 rounded-xl p-6 border border-space-light/20">
                <div className="flex items-center gap-3 mb-3">
                  <Phone size={24} className="text-accent-400" />
                  <h3 className="font-semibold text-white">Phone Support</h3>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                  +1 (555) 123-4567
                </p>
                <p className="text-gray-500 text-xs">
                  Mon-Fri, 9AM-6PM PST
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-display font-bold text-white mb-8">
              Frequently Asked Questions
            </h2>

            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No results found for "{searchQuery}". Try a different search term.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredFaqs.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <h3 className="text-xl font-display font-semibold text-white mb-4">
                      {category.title}
                    </h3>
                    
                    <div className="space-y-3">
                      {category.faqs.map((faq, faqIndex) => {
                        const globalIndex = categoryIndex * 100 + faqIndex;
                        const isExpanded = expandedFaq === globalIndex;
                        
                        return (
                          <div 
                            key={faqIndex}
                            className="bg-space-base/50 rounded-xl border border-space-light/20 overflow-hidden"
                          >
                            <button
                              onClick={() => toggleFaq(globalIndex)}
                              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-space-light/20 transition-colors"
                            >
                              <span className="font-medium text-white pr-4">
                                {faq.question}
                              </span>
                              {isExpanded ? (
                                <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                              ) : (
                                <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                              )}
                            </button>
                            
                            {isExpanded && (
                              <div className="px-6 pb-4">
                                <p className="text-gray-300 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;