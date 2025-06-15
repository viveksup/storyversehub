import React from 'react';
import { PricingPlan } from '../../types';
import Button from './Button';
import { Check, Star } from 'lucide-react';

interface PricingCardProps {
  plan: PricingPlan;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const { type, name, price, description, features, isPopular } = plan;
  
  // Determine card styling based on plan type
  const getCardStyle = () => {
    switch (type) {
      case 'premium':
        return 'border-secondary-500 bg-gradient-to-br from-secondary-900/80 to-secondary-950';
      case 'family':
        return 'border-accent-500 bg-gradient-to-br from-accent-900/80 to-accent-950';
      default:
        return 'border-primary-700 bg-gradient-to-br from-primary-900/80 to-primary-950';
    }
  };
  
  const getButtonStyle = () => {
    switch (type) {
      case 'premium':
        return 'secondary';
      case 'family':
        return 'accent';
      default:
        return 'primary';
    }
  };
  
  return (
    <div className={`relative flex flex-col p-6 rounded-2xl border-2 ${getCardStyle()} shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-cosmic max-w-sm w-full`}>
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-4 right-4 bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
          <Star size={14} className="mr-1" fill="white" /> Most Popular
        </div>
      )}
      
      {/* Plan header */}
      <h3 className="text-2xl font-display font-bold text-white">{name}</h3>
      <p className="mt-2 text-gray-300">{description}</p>
      
      {/* Pricing */}
      <div className="mt-4 flex items-baseline">
        <span className="text-4xl font-extrabold text-white">${price}</span>
        <span className="ml-1 text-xl text-gray-400">/month</span>
      </div>
      
      {/* Features */}
      <ul className="mt-6 space-y-4 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-success-900 rounded-full">
              <Check size={12} className="text-success-400" />
            </div>
            <span className="ml-2 text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      
      {/* CTA */}
      <div className="mt-8">
        <Button 
          variant={getButtonStyle()}
          size="lg"
          className="w-full"
        >
          {price === 0 ? 'Start Free' : 'Subscribe Now'}
        </Button>
      </div>
    </div>
  );
};

export default PricingCard;