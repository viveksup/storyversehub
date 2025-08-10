import { useState } from 'react';

export function useStoryManagement() { ... }
  const [stories, setStories] = useState([]);

  const addStory = (story) => setStories(prev => [...prev, story]);
  const removeStory = (id) => setStories(prev => prev.filter(s => s.id !== id));

  return { stories, addStory, removeStory };
}
