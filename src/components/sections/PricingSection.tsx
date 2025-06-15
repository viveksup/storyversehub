import React from 'react';
import PricingCard from '../ui/PricingCard';
import { Sparkles, Check } from 'lucide-react';
import { mockPricingPlans } from '../../data/mockData';

const PricingSection: React.FC = () => {
  return (
    <section className="py-20 bg-space-dark relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-star-field opacity-20 bg-cover bg-center"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block mb-4 bg-accent-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-full">
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className="text-accent-200" />
              <span className="text-sm font-medium">Unlock the Full StoryVerse</span>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Choose Your Adventure Plan
          </h2>
          <p className="text-xl text-gray-300">
            Select the membership that fits your storytelling journey, from casual explorer to dedicated creator.
          </p>
        </div>
        
        {/* Pricing Cards */}
        <div className="flex flex-col lg:flex-row justify-center gap-8 mb-16">
          {mockPricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>
        
        {/* Feature Comparison Table */}
        <div className="bg-space-base/70 backdrop-blur-sm rounded-2xl p-8 border border-space-light/20 overflow-hidden max-w-4xl mx-auto">
          <h3 className="text-xl font-display font-semibold text-white mb-6">Feature Comparison</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 text-gray-400 font-normal">Feature</th>
                  <th className="text-center py-3 px-4 text-white">Free</th>
                  <th className="text-center py-3 px-4 text-white">Premium</th>
                  <th className="text-center py-3 px-4 text-white">Family</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr>
                  <td className="py-3 px-4 text-gray-300">Content Library Access</td>
                  <td className="py-3 px-4 text-center text-gray-400">50%</td>
                  <td className="py-3 px-4 text-center text-secondary-400">100%</td>
                  <td className="py-3 px-4 text-center text-accent-400">100%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-300">Ad Experience</td>
                  <td className="py-3 px-4 text-center text-gray-400">With Ads</td>
                  <td className="py-3 px-4 text-center text-secondary-400">Ad-Free</td>
                  <td className="py-3 px-4 text-center text-accent-400">Ad-Free</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-300">AI Voice Options</td>
                  <td className="py-3 px-4 text-center text-gray-400">Basic (2)</td>
                  <td className="py-3 px-4 text-center text-secondary-400">All Voices</td>
                  <td className="py-3 px-4 text-center text-accent-400">All Voices</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-300">Story Creation</td>
                  <td className="py-3 px-4 text-center text-gray-400">3/month</td>
                  <td className="py-3 px-4 text-center text-secondary-400">Unlimited</td>
                  <td className="py-3 px-4 text-center text-accent-400">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-300">AI Writing Assistant</td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-block w-5 h-0.5 bg-gray-700"></div>
                  </td>
                  <td className="py-3 px-4 text-center text-secondary-400">
                    <Check size={16} className="mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center text-accent-400">
                    <Check size={16} className="mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-300">Offline Reading</td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-block w-5 h-0.5 bg-gray-700"></div>
                  </td>
                  <td className="py-3 px-4 text-center text-secondary-400">
                    <Check size={16} className="mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center text-accent-400">
                    <Check size={16} className="mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-300">Family Accounts</td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-block w-5 h-0.5 bg-gray-700"></div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-block w-5 h-0.5 bg-gray-700"></div>
                  </td>
                  <td className="py-3 px-4 text-center text-accent-400">Up to 6</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-300">Priority Support</td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-block w-5 h-0.5 bg-gray-700"></div>
                  </td>
                  <td className="py-3 px-4 text-center text-secondary-400">
                    <Check size={16} className="mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center text-accent-400">
                    <Check size={16} className="mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;