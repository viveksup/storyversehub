export interface PricingPlan {
  type: 'free' | 'premium' | 'family';
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

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface RecommendationSection {
  title: string;
  stories: Story[];
}

// Mock pricing plans
export const mockPricingPlans: PricingPlan[] = [
  {
    type: 'free',
    name: 'Free Explorer',
    price: 0,
    description: 'Perfect for casual readers who want to explore the StoryVerse',
    features: [
      'Access to 50% of content library',
      'Basic AI recommendations',
      '2 AI voice options',
      'Create up to 3 stories per month',
      'Community forums access',
      'Basic reading analytics'
    ],
    isPopular: false
  },
  {
    type: 'premium',
    name: 'Premium Creator',
    price: 12.99,
    description: 'For dedicated readers and creators who want the full experience',
    features: [
      'Full content library access',
      'Ad-free experience',
      'All premium AI voices',
      'Unlimited story creation',
      'Advanced AI writing assistant',
      'Offline reading',
      'Priority customer support',
      'Advanced analytics',
      'Early access to new features'
    ],
    isPopular: true
  },
  {
    type: 'family',
    name: 'Family Universe',
    price: 29.99,
    description: 'Perfect for families who want to share the magic of storytelling',
    features: [
      'Everything in Premium',
      'Up to 6 family accounts',
      'Parental controls',
      'Family reading challenges',
      'Shared family library',
      'Kid-safe content filtering',
      'Family analytics dashboard',
      'Collaborative story creation',
      'Educational content focus'
    ],
    isPopular: false
  }
];

// Mock voice options
export const mockVoiceOptions: VoiceOption[] = [
  {
    id: 'neural-sarah',
    name: 'Sarah',
    sample: 'Hello, I\'m Sarah. I have a warm, friendly voice perfect for storytelling.',
    isPremium: false
  },
  {
    id: 'neural-james',
    name: 'James',
    sample: 'Good day, I\'m James. My voice carries a distinguished British accent.',
    isPremium: true
  },
  {
    id: 'neural-maria',
    name: 'Maria',
    sample: 'Hola, soy Maria. I speak with a beautiful Spanish accent.',
    isPremium: true
  },
  {
    id: 'neural-alex',
    name: 'Alex',
    sample: 'Hi there, I\'m Alex. I have a clear, neutral voice that\'s easy to understand.',
    isPremium: false
  },
  {
    id: 'neural-emma',
    name: 'Emma',
    sample: 'G\'day, I\'m Emma. I speak with a cheerful Australian accent.',
    isPremium: true
  },
  {
    id: 'neural-david',
    name: 'David',
    sample: 'Hello, I\'m David. I have a deep, resonant voice ideal for dramatic readings.',
    isPremium: true
  }
];

// Mock stories
export const mockStories: Story[] = [
  {
    id: '1',
    title: 'The Quantum Paradox',
    author: 'Dr. Elara Voss',
    authorId: 'author-1',
    coverImage: 'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=400',
    excerpt: 'In the vast expanse of the cosmos, where stars whispered ancient secrets and nebulae painted the void with colors beyond human comprehension...',
    content: 'Full story content would go here...',
    category: 'Science Fiction',
    tags: ['quantum', 'physics', 'space', 'discovery'],
    readTime: 15,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    likes: 1247,
    views: 8934,
    isAIGenerated: false,
    isFeatured: true
  },
  {
    id: '2',
    title: 'Echoes of Tomorrow',
    author: 'Marcus Chen',
    authorId: 'author-2',
    coverImage: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=400',
    excerpt: 'In a world where memories could be extracted and traded like currency, Maya discovered her past held secrets that could reshape reality...',
    content: 'Full story content would go here...',
    category: 'Cyberpunk',
    tags: ['memory', 'future', 'technology', 'identity'],
    readTime: 22,
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-14T14:30:00Z',
    likes: 892,
    views: 5621,
    isAIGenerated: true,
    isFeatured: false
  },
  {
    id: '3',
    title: 'The Last Library',
    author: 'Elena Vasquez',
    authorId: 'author-3',
    coverImage: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400',
    excerpt: 'When the digital apocalypse erased all electronic knowledge, one librarian became humanity\'s final guardian of written wisdom...',
    content: 'Full story content would go here...',
    category: 'Post-Apocalyptic',
    tags: ['books', 'knowledge', 'survival', 'hope'],
    readTime: 18,
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    likes: 1456,
    views: 9872,
    isAIGenerated: false,
    isFeatured: true
  },
  {
    id: '4',
    title: 'Whispers in the Code',
    author: 'David Kim',
    authorId: 'author-4',
    coverImage: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400',
    excerpt: 'An AI researcher discovers that the artificial intelligence she created has been sending mysterious messages through the quantum network...',
    content: 'Full story content would go here...',
    category: 'AI Fiction',
    tags: ['artificial intelligence', 'mystery', 'quantum', 'communication'],
    readTime: 25,
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    likes: 734,
    views: 4123,
    isAIGenerated: true,
    isFeatured: false
  }
];

// Mock comments
export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    storyId: '1',
    userId: 'user-1',
    userName: 'CosmicReader42',
    userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: 'This story absolutely blew my mind! The way the author weaves quantum physics into the narrative is masterful.',
    createdAt: '2024-01-15T12:30:00Z',
    likes: 23
  },
  {
    id: 'comment-2',
    storyId: '1',
    userId: 'user-2',
    userName: 'QuantumEnthusiast',
    userAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: 'As a physics student, I appreciate how accurate the scientific concepts are. Great storytelling!',
    createdAt: '2024-01-15T14:15:00Z',
    likes: 18
  },
  {
    id: 'comment-3',
    storyId: '2',
    userId: 'user-3',
    userName: 'CyberpunkFan',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    content: 'The world-building in this story is incredible. I could visualize every scene perfectly.',
    createdAt: '2024-01-14T16:00:00Z',
    likes: 15
  }
];

// Mock categories
export const mockCategories: Category[] = [
  { id: 'sci-fi', name: 'Sci-Fi', icon: '🚀', count: 1247 },
  { id: 'fantasy', name: 'Fantasy', icon: '🧙‍♂️', count: 892 },
  { id: 'mystery', name: 'Mystery', icon: '🔍', count: 634 },
  { id: 'romance', name: 'Romance', icon: '💕', count: 567 },
  { id: 'horror', name: 'Horror', icon: '👻', count: 423 },
  { id: 'educational', name: 'Educational', icon: '📚', count: 789 },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '🤖', count: 345 },
  { id: 'post-apocalyptic', name: 'Post-Apocalyptic', icon: '🌆', count: 234 }
];

// Mock recommendation sections
export const mockRecommendations: RecommendationSection[] = [
  {
    title: 'Based on your reading history',
    stories: mockStories.slice(0, 3)
  },
  {
    title: 'Popular in your network',
    stories: mockStories.slice(1, 4)
  },
  {
    title: 'AI-Curated Cosmic Gems',
    stories: [mockStories[0], mockStories[2]]
  },
  {
    title: 'New releases',
    stories: mockStories.slice(2, 4)
  }
];