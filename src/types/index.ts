export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isPremium: boolean;
  createdAt: string;
  readingList: string[];
  recentlyViewed: string[];
}

export interface Story {
  id: string;
  title: string;
  author: string;
  authorId: string;
  coverImage: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  readTime: number;
  createdAt: string;
  updatedAt: string;
  likes: number;
  views: number;
  isAIGenerated: boolean;
  isFeatured: boolean;
}

export interface Comment {
  id: string;
  storyId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export type PlanType = 'free' | 'premium' | 'family';

export interface PricingPlan {
  type: PlanType;
  name: string;
  price: number;
  description: string;
  features: string[];
  isPopular: boolean;
}

export interface VoiceOption {
  id: string;
  name: string;
  sample: string;
  isPremium: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface AIRecommendation {
  storyId: string;
  reason: string;
  confidence: number;
}