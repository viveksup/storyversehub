import React from 'react';
import Hero from '../components/sections/Hero';
import FeatureShowcase from '../components/sections/FeatureShowcase';
import ContentLibrary from '../components/sections/ContentLibrary';
import PopularCategories from '../components/sections/PopularCategories';
import VoiceShowcase from '../components/sections/VoiceShowcase';
import PricingSection from '../components/sections/PricingSection';
import CallToAction from '../components/sections/CallToAction';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-space-dark">
      <Hero />
      <FeatureShowcase />
      <ContentLibrary />
      <PopularCategories />
      <VoiceShowcase />
      <PricingSection />
      <CallToAction />
    </div>
  );
};

export default HomePage;