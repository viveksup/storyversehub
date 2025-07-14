import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Calendar, FileText, Loader2 } from 'lucide-react';
import Button from './Button';
import { useStoryManagement, StoryDraft } from '../../hooks/useStoryManagement';

const DraftsList: React.FC = () => {
  const [drafts, setDrafts] = useState<StoryDraft[]>([]);
  const { getDrafts, deleteDraft, loading } = useStoryManagement();

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    const { data } = await getDrafts();
    if (data) {
      setDrafts(data);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      const { error } = await deleteDraft(draftId);
      if (!error) {
        setDrafts(drafts.filter(draft => draft.id !== draftId));
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={32} className="animate-spin text-primary-500" />
        <span className="ml-2 text-gray-400">Loading drafts...</span>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-white mb-2">No drafts yet</h3>
        <p className="text-gray-400 mb-6">
          Start writing your first story to see drafts here
        </p>
        <Link to="/create">
          <Button variant="primary">Create New Story</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold text-white">
          Your Drafts ({drafts.length})
        </h2>
        <Link to="/create">
          <Button variant="primary" size="sm">
            New Story
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="bg-space-base/50 backdrop-blur-sm rounded-xl p-6 border border-space-light/20 hover:border-space-light/40 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-display font-semibold text-white mb-2">
                  {draft.title}
                </h3>
                
                {draft.excerpt && (
                  <p className="text-gray-300 mb-3 line-clamp-2">
                    {draft.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Updated {formatDate(draft.updated_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <FileText size={14} />
                    <span>{draft.content.split(' ').length} words</span>
                  </div>

                  {draft.tags && draft.tags.length > 0 && (
                    <div className="flex gap-1">
                      {draft.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {draft.tags.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{draft.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Link to={`/create?draft=${draft.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit size={16} />}
                  >
                    Edit
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDraft(draft.id)}
                  className="text-error-400 hover:text-error-300 hover:bg-error-900/20"
                  leftIcon={<Trash2 size={16} />}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraftsList;