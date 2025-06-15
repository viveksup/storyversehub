import React from 'react';
import PricingSection from '../components/sections/PricingSection';
import CallToAction from '../components/sections/CallToAction';
import { Check, X } from 'lucide-react';

const PricingPage: React.FC = () => {
  const featureComparison = [
    {
      feature: 'Content Library Access',
      free: '50%',
      premium: '100%',
      family: '100%',
      freeType: 'limited',
      premiumType: 'full',
      familyType: 'full'
    },
    {
      feature: 'Ad Experience',
      free: 'With Ads',
      premium: 'Ad-Free',
      family: 'Ad-Free',
      freeType: 'limited',
      premiumType: 'full',
      familyType: 'full'
    },
    {
      feature: 'Voice Narration',
      free: '2 Basic Voices',
      premium: 'All Premium Voices',
      family: 'All Premium Voices',
      freeType: 'limited',
      premiumType: 'full',
      familyType: 'full'
    },
    {
      feature: 'Downloads',
      free: 'None',
      premium: 'Unlimited',
      family: 'Unlimited',
      freeType: 'none',
      premiumType: 'full',
      familyType: 'full'
    },
    {
      feature: 'Story Creation',
      free: '3 per month',
      premium: 'Unlimited',
      family: 'Unlimited',
      freeType: 'limited',
      premiumType: 'full',
      familyType: 'full'
    },
    {
      feature: 'AI Writing Assistant',
      free: 'None',
      premium: 'Full Access',
      family: 'Full Access',
      freeType: 'none',
      premiumType: 'full',
      familyType: 'full'
    },
    {
      feature: 'Reading Analytics',
      free: 'Basic',
      premium: 'Advanced',
      family: 'Advanced + Family',
      freeType: 'limited',
      premiumType: 'full',
      familyType: 'full'
    },
    {
      feature: 'Family Accounts',
      free: '1 Account',
      premium: '1 Account',
      family: 'Up to 6 Accounts',
      freeType: 'limited',
      premiumType: 'limited',
      familyType: 'full'
    },
    {
      feature: 'Parental Controls',
      free: 'None',
      premium: 'Basic',
      family: 'Advanced',
      freeType: 'none',
      premiumType: 'limited',
      familyType: 'full'
    },
    {
      feature: 'Customer Support',
      free: 'Email',
      premium: 'Priority',
      family: 'Priority',
      freeType: 'limited',
      premiumType: 'full',
      familyType: 'full'
    }
  ];
  
  const renderFeatureValue = (value: string, type: string) => {
    switch (type) {
      case 'full':
        return (
          <div className="flex items-center justify-center">
            <Check size={18} className="text-success-500" />
            <span className="ml-1">{value}</span>
          </div>
        );
      case 'limited':
        return <span className="text-yellow-500">{value}</span>;
      case 'none':
        return (
          <div className="flex items-center justify-center">
            <X size={18} className="text-gray-500" />
          </div>
        );
      default:
        return value;
    }
  };
  
  return (
    <div className="min-h-screen bg-space-dark pt-16">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-space-light to-space-base py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            Choose Your StoryVerse Experience
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Select the perfect plan to unlock the full potential of AI-powered storytelling and learning.
          </p>
        </div>
      </div>
      
      {/* Pricing Cards */}
      <PricingSection />
      
      {/* Detailed Feature Comparison */}
      <section className="py-16 bg-space-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-white mb-8 text-center">
            Detailed Feature Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 rounded-xl overflow-hidden">
              <thead className="bg-space-light">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Feature
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Free
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-secondary-300 uppercase tracking-wider">
                    Premium ($12.99/mo)
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-accent-300 uppercase tracking-wider">
                    Family ($29.99/mo)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-space-base divide-y divide-gray-800">
                {featureComparison.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-space-light/20' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {item.feature}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-400">
                      {renderFeatureValue(item.free, item.freeType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-300 bg-secondary-900/20">
                      {renderFeatureValue(item.premium, item.premiumType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-300 bg-accent-900/20">
                      {renderFeatureValue(item.family, item.familyType)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-space-base">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto divide-y divide-gray-800">
            {[
              {
                question: "Can I switch between plans?",
                answer: "Yes, you can upgrade, downgrade, or cancel your subscription at any time. Changes to your subscription will take effect at the start of your next billing cycle."
              },
              {
                question: "How does the family plan work?",
                answer: "The family plan allows up to 6 family members to have their own personal accounts under one subscription. The primary account holder can manage all accounts and set appropriate content restrictions for younger users."
              },
              {
                question: "Can I try Premium features before subscribing?",
                answer: "Absolutely! We offer a 7-day free trial of our Premium plan, giving you full access to all premium features. You can cancel anytime during the trial period."
              },
              {
                question: "How do I access AI voice narration?",
                answer: "When viewing any story, simply click the 'Listen' button to switch to audio mode. Free users have access to two basic voice options, while Premium and Family subscribers can choose from our entire library of premium voices."
              },
              {
                question: "Are there any hidden fees?",
                answer: "No hidden fees! The subscription price you see is all you pay. We don't charge extra for new features added to your plan, and there are no setup or cancellation fees."
              }
            ].map((faq, index) => (
              <div key={index} className="py-6">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-white">
                    <span className="text-lg">{faq.question}</span>
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-gray-400 mt-3 group-open:animate-fadeIn">
                    {faq.answer}
                  </p>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <CallToAction />
    </div>
  );
};

export default PricingPage;