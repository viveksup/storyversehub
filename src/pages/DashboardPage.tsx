import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Clock, Star, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import StoriesGrid from '../components/stories/StoriesGrid';
import { supabase } from '../lib/supabase';
import { useStories } from '../hooks/useStories';

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const { stories: recentStories, loading: storiesLoading } = useStories({
    sort_by: 'created_at',
    sort_order: 'desc',
    limit: 9
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    setUser(authUser);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    setProfile(profileData);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="pt-20 bg-space-dark min-h-screen">
      <div className="relative bg-gradient-to-br from-space-light via-space-base to-space-dark py-16 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-600 rounded-full filter blur-[120px] opacity-20"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary-600 rounded-full filter blur-[120px] opacity-20"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <h1 className="text-4xl font-display font-bold text-white mb-2">
                {getGreeting()}, {profile?.username || 'Reader'}!
              </h1>
              <p className="text-gray-300">Welcome back to your reading hub</p>
            </div>

            <div className="flex gap-3">
              <Link to="/create">
                <Button variant="primary" leftIcon={<Plus size={18} />}>
                  Write Story
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="secondary" leftIcon={<BookOpen size={18} />}>
                  Explore
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-space-base/60 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-600/30 rounded-lg flex items-center justify-center">
                <BookOpen size={24} className="text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Stories Read</p>
                <p className="text-2xl font-display font-bold text-white">0</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Start reading to track your progress</p>
          </div>

          <div className="bg-space-base/60 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-secondary-600/30 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-secondary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Reading Time</p>
                <p className="text-2xl font-display font-bold text-white">0h</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Your total reading duration</p>
          </div>

          <div className="bg-space-base/60 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-accent-600/30 rounded-lg flex items-center justify-center">
                <Star size={24} className="text-accent-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Reading Streak</p>
                <p className="text-2xl font-display font-bold text-white">0</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Keep reading to build your streak</p>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-white">Latest Stories</h2>
              <p className="text-gray-400 mt-1">Discover and read amazing stories</p>
            </div>
            <Link to="/explore" className="text-primary-400 hover:text-primary-300 flex items-center gap-2">
              View all <ArrowRight size={18} />
            </Link>
          </div>

          <StoriesGrid
            stories={recentStories}
            loading={storiesLoading}
            error={null}
            hasMore={false}
            onLoadMore={() => {}}
            emptyMessage="No stories available yet. Be the first to create one!"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          />
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;