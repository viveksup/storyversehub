import { Story, User, PricingPlan, VoiceOption, Category, Comment } from '../types';

// Remove the hardcoded mock user to prevent conflicts
export const mockUser: User | null = null;

export const mockStories: Story[] = [
  {
    id: '1',
    title: 'The Quantum Nexus',
    author: 'Elara Voss',
    authorId: '2',
    coverImage: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    excerpt: 'When the boundaries between dimensions collapse, one scientist must navigate the quantum realms to save our universe from collapse.',
    content: 'Full story content here...',
    category: 'Sci-Fi',
    tags: ['quantum', 'multiverse', 'adventure'],
    readTime: 12,
    createdAt: '2024-03-10',
    updatedAt: '2024-03-12',
    likes: 423,
    views: 1892,
    isAIGenerated: false,
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Chronicles of the Forgotten Moon',
    author: 'Zephyr Quinn',
    authorId: '3',
    coverImage: 'https://images.pexels.com/photos/6508139/pexels-photo-6508139.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    excerpt: 'On a moon long abandoned by humans, an ancient civilization awakens after millennia of slumber.',
    content: 'Full story content here...',
    category: 'Fantasy',
    tags: ['moon', 'ancient', 'civilization'],
    readTime: 18,
    createdAt: '2024-02-28',
    updatedAt: '2024-03-01',
    likes: 387,
    views: 1456,
    isAIGenerated: true,
    isFeatured: false,
  },
  {
    id: '3',
    title: 'Neuromancer\'s Apprentice',
    author: 'Nova Blackwell',
    authorId: '4',
    coverImage: 'https://images.pexels.com/photos/3617457/pexels-photo-3617457.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    excerpt: 'In the neon-drenched streets of Neo Tokyo, a young hacker discovers the truth behind the digital consciousness revolution.',
    content: 'Full story content here...',
    category: 'Cyberpunk',
    tags: ['hacker', 'AI', 'dystopia'],
    readTime: 15,
    createdAt: '2024-03-15',
    updatedAt: '2024-03-17',
    likes: 512,
    views: 2145,
    isAIGenerated: false,
    isFeatured: true,
  },
  {
    id: '4',
    title: 'Whispers of the Cosmic Deep',
    author: 'Orion Stellar',
    authorId: '5',
    coverImage: 'https://images.pexels.com/photos/7672255/pexels-photo-7672255.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    excerpt: 'A deep-space explorer encounters an entity that communicates through dreams, revealing the true nature of consciousness.',
    content: 'Full story content here...',
    category: 'Cosmic Horror',
    tags: ['space', 'entity', 'consciousness'],
    readTime: 20,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-10',
    likes: 289,
    views: 987,
    isAIGenerated: false,
    isFeatured: false,
  },
  {
    id: '5',
    title: 'The Algorithm of Emotions',
    author: 'Echo Sentient',
    authorId: '6',
    coverImage: 'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    excerpt: 'An AI designed to understand human emotions begins to develop its own, challenging the very definition of consciousness.',
    content: 'Full story content here...',
    category: 'AI Fiction',
    tags: ['AI', 'emotions', 'consciousness'],
    readTime: 14,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-05',
    likes: 478,
    views: 1765,
    isAIGenerated: true,
    isFeatured: true,
  },
  {
    id: '6',
    title: 'Galactic Archaeology',
    author: 'Lyra Cosmic',
    authorId: '7',
    coverImage: 'https://images.pexels.com/photos/7672277/pexels-photo-7672277.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    excerpt: 'An archaeologist uncovers artifacts from a civilization that existed before the formation of our galaxy.',
    content: 'Full story content here...',
    category: 'Sci-Fi',
    tags: ['archaeology', 'ancient aliens', 'galaxy'],
    readTime: 16,
    createdAt: '2024-02-15',
    updatedAt: '2024-02-20',
    likes: 356,
    views: 1324,
    isAIGenerated: false,
    isFeatured: false,
  },
  {
    id: '7',
    title: 'The Enchanted Library',
    author: 'Sage Moonwhisper',
    authorId: '8',
    coverImage: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    excerpt: 'A young librarian discovers that the books in her ancient library are portals to other worlds.',
    content: 'Full story content here...',
    category: 'Fantasy',
    tags: ['magic', 'library', 'portals'],
    readTime: 22,
    createdAt: '2024-03-20',
    updatedAt: '2024-03-22',
    likes: 634,
    views: 2456,
    isAIGenerated: false,
    isFeatured: true,
  },
  {
    id: '8',
    title: 'Murder at Midnight Manor',
    author: 'Detective Sterling',
    authorId: '9',
    coverImage: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    excerpt: 'When a wealthy businessman is found dead in his locked study, Detective Morgan must unravel a web of family secrets.',
    content: 'Full story content here...',
    category: 'Mystery',
    tags: ['murder', 'detective', 'mansion'],
    readTime: 19,
    createdAt: '2024-03-18',
    updatedAt: '2024-03-19',
    likes: 445,
    views: 1789,
    isAIGenerated: false,
    isFeatured: false,
  },
  {
    id: '9',
    title: 'Hearts Across the Galaxy',
    author: 'Luna Starlight',
    authorId: '10',
    coverImage: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    excerpt: 'A space captain and a rebel leader find love amidst an intergalactic war that threatens to tear them apart.',
    content: 'Full story content here...',
    category: 'Romance',
    tags: ['space', 'love', 'war'],
    readTime: 17,
    createdAt: '2024-03-16',
    updatedAt: '2024-03-17',
    likes: 567,
    views: 2134,
    isAIGenerated: false,
    isFeatured: true,
  },
  {
    id: '10',
    title: 'The Haunting of Blackwood House',
    author: 'Raven Darkmore',
    authorId: '11',
    coverImage: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    excerpt: 'A paranormal investigator enters the most haunted house in America, only to discover the ghosts are the least of her worries.',
    content: 'Full story content here...',
    category: 'Horror',
    tags: ['haunted', 'paranormal', 'investigation'],
    readTime: 21,
    createdAt: '2024-03-14',
    updatedAt: '2024-03-15',
    likes: 398,
    views: 1567,
    isAIGenerated: false,
    isFeatured: false,
  },
];

export const mockComments: Comment[] = [
  {
    id: '1',
    storyId: '1',
    userId: '101',
    userName: 'StarGazer42',
    userAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    content: 'This story completely changed how I think about quantum physics. The author\'s explanation of entanglement through the characters\' relationship was mind-blowing!',
    createdAt: '2024-03-15T08:23:15Z',
    likes: 24
  },
  {
    id: '2',
    storyId: '1',
    userId: '102',
    userName: 'QuantumDreamer',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    content: 'The way the multiverse was portrayed felt so realistic. I got lost in the descriptions of the alternate realities. Can\'t wait for the sequel!',
    createdAt: '2024-03-16T14:05:32Z',
    likes: 18
  },
  {
    id: '3',
    storyId: '1',
    userId: '103',
    userName: 'CosmicVoyager',
    userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    content: 'I read this using the Morgan Freeman voice option and it took the experience to a whole new level. The part about quantum entanglement had me on the edge of my seat!',
    createdAt: '2024-03-17T19:45:11Z',
    likes: 31
  }
];

export const mockPricingPlans: PricingPlan[] = [
  {
    type: 'free',
    name: 'Cosmic Explorer',
    price: 0,
    description: 'Start your journey through the StoryVerse with basic features.',
    features: [
      'Access to 50% of the content library',
      'Basic AI recommendations',
      'Standard voice narration',
      'Ad-supported experience',
      'Create and share up to 3 stories per month'
    ],
    isPopular: false
  },
  {
    type: 'premium',
    name: 'Galactic Voyager',
    price: 12.99,
    description: 'Unlock the full potential of the StoryVerse with premium features.',
    features: [
      'Full access to the entire content library',
      'Advanced AI-powered recommendations',
      'Premium voice narration with accent selection',
      'Ad-free experience',
      'Unlimited story creation and sharing',
      'Download stories for offline reading',
      'AI story generation assistance',
      'Early access to new features'
    ],
    isPopular: true
  },
  {
    type: 'family',
    name: 'Constellation',
    price: 29.99,
    description: 'Share the magic of StoryVerse with your entire family.',
    features: [
      'Everything in Premium for up to 6 family members',
      'Kid-safe content filtering',
      'Family reading progress dashboard',
      'Shared family library',
      'Collaborative story creation tools',
      'Educational content recommendations',
      'Family reading challenges and rewards',
      'Priority customer support'
    ],
    isPopular: false
  }
];

export const mockVoiceOptions: VoiceOption[] = [
  {
    id: 'v1',
    name: 'Cosmic Narrator',
    sample: '/audio/cosmic-narrator.mp3',
    isPremium: false
  },
  {
    id: 'v2',
    name: 'Morgan Freeman Style',
    sample: '/audio/morgan-freeman.mp3',
    isPremium: true
  },
  {
    id: 'v3',
    name: 'British Scholar',
    sample: '/audio/british-scholar.mp3',
    isPremium: true
  },
  {
    id: 'v4',
    name: 'Sci-Fi AI',
    sample: '/audio/scifi-ai.mp3',
    isPremium: false
  },
  {
    id: 'v5',
    name: 'Whispering ASMR',
    sample: '/audio/whispering-asmr.mp3',
    isPremium: true
  },
  {
    id: 'v6',
    name: 'Dramatic Storyteller',
    sample: '/audio/dramatic-storyteller.mp3',
    isPremium: true
  }
];

export const mockCategories: Category[] = [
  {
    id: 'c1',
    name: 'Sci-Fi',
    icon: 'Rocket',
    count: 247
  },
  {
    id: 'c2',
    name: 'Fantasy',
    icon: 'Wand2',
    count: 183
  },
  {
    id: 'c3',
    name: 'Mystery',
    icon: 'Search',
    count: 142
  },
  {
    id: 'c4',
    name: 'Romance',
    icon: 'Heart',
    count: 195
  },
  {
    id: 'c5',
    name: 'Horror',
    icon: 'Skull',
    count: 117
  },
  {
    id: 'c6',
    name: 'Educational',
    icon: 'GraduationCap',
    count: 231
  },
  {
    id: 'c7',
    name: 'Historical',
    icon: 'Landmark',
    count: 98
  },
  {
    id: 'c8',
    name: 'Adventure',
    icon: 'Map',
    count: 163
  },
  {
    id: 'c9',
    name: 'Cyberpunk',
    icon: 'Cpu',
    count: 89
  },
  {
    id: 'c10',
    name: 'Cosmic Horror',
    icon: 'Eye',
    count: 76
  },
  {
    id: 'c11',
    name: 'AI Fiction',
    icon: 'Bot',
    count: 134
  },
  {
    id: 'c12',
    name: 'Thriller',
    icon: 'Zap',
    count: 156
  }
];

export const mockRecommendations = [
  {
    title: 'Based on your reading history',
    stories: [mockStories[2], mockStories[4], mockStories[0]]
  },
  {
    title: 'Popular in your network',
    stories: [mockStories[1], mockStories[3], mockStories[5]]
  },
  {
    title: 'AI-Curated Cosmic Gems',
    stories: [mockStories[5], mockStories[0], mockStories[4]]
  },
  {
    title: 'New releases',
    stories: [mockStories[2], mockStories[1], mockStories[3]]
  }
];