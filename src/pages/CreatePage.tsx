import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, Upload, BookOpen, Image as ImageIcon, 
  Save, Send, Trash2, Eye, AlertCircle, Check,
  X, Plus, Loader2
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useStoryManagement, StoryDraft } from '../hooks/useStoryManagement';
import { useCategories } from '../hooks/useCategories';
import { supabase } from '../lib/supabase';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draft');
  
  const [selectedTab, setSelectedTab] = useState<'write' | 'upload'>('write');
  const [user, setUser] = useState<any>(null);
  const [currentDraft, setCurrentDraft] = useState<StoryDraft | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [contentRating, setContentRating] = useState<'general' | 'teen' | 'mature' | 'adult'>('general');
  const [coverImage, setCoverImage] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [success, setSuccess] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const { 
    loading, 
    error, 
    saveDraft, 
    publishStory, 
    uploadMedia, 
    getDrafts,
    deleteDraft 
  } = useStoryManagement();
  
  const { categories, loading: categoriesLoading } = useCategories();

  // Load user and draft data
  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (draftId && user) {
      loadDraft();
    }
  }, [draftId, user]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !user || (!title && !content)) return;

    const autoSaveTimer = setTimeout(() => {
      handleSaveDraft(true);
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [title, content, excerpt, categoryId, tags, contentRating, autoSaveEnabled, user]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
      navigate('/auth');
    }
  };

  const loadDraft = async () => {
    if (!draftId) return;

    try {
      const { data, error } = await supabase
        .from('story_drafts')
        .select('*')
        .eq('id', draftId)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentDraft(data);
        setTitle(data.title);
        setContent(data.content);
        setExcerpt(data.excerpt || '');
        setCategoryId(data.category_id || '');
        setTags(data.tags || []);
        setContentRating(data.content_rating);
        setCoverImage(data.cover_image_url || '');
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const handleSaveDraft = async (isAutoSave = false) => {
    if (!user) return;

    const draftData: Partial<StoryDraft> = {
      id: currentDraft?.id,
      title: title || 'Untitled Story',
      content,
      excerpt,
      category_id: categoryId || undefined,
      tags,
      content_rating: contentRating,
      cover_image_url: coverImage || undefined,
      language: 'en',
      metadata: {}
    };

    const { data, error } = await saveDraft(draftData);

    if (error) {
      if (!isAutoSave) {
        console.error('Save error:', error);
      }
      return;
    }

    if (data) {
      setCurrentDraft(data);
      setLastSaved(new Date());
      
      if (!isAutoSave) {
        setSuccess('Draft saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }

      // Update URL if this is a new draft
      if (!draftId && data.id) {
        navigate(`/create?draft=${data.id}`, { replace: true });
      }
    }
  };

  const handlePublish = async () => {
    if (!user) return;

    if (!title.trim()) {
      alert('Please enter a title for your story');
      return;
    }

    if (!content.trim()) {
      alert('Please write some content for your story');
      return;
    }

    // Create content directly in the content table
    try {
      const { data, error } = await supabase
        .from('content')
        .insert({
          title,
          description: excerpt || content.substring(0, 200) + '...',
          content_type: 'story',
          cover_image: coverImage || null,
          pages: content ? [content] : [],
          categories: tags,
          author_id: user.id,
          is_published: true
        })
        .select()
        .single();

      if (error) {
        console.error('Publish error:', error);
        alert('Failed to publish story. Please try again.');
        return;
      }

      if (data) {
        setSuccess('Story published successfully!');
        setTimeout(() => {
          navigate(`/story/${data.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Publish error:', err);
      alert('Failed to publish story. Please try again.');
      return;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      const { data, error } = await uploadMedia(
        file, 
        currentDraft?.id, 
        undefined
      );

      if (error) {
        console.error('Upload error:', error);
        continue;
      }

      if (data) {
        if (file.type.startsWith('image/') && !coverImage) {
          setCoverImage(data.url);
        }
        setUploadedFiles(prev => [...prev, file]);
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleDeleteDraft = async () => {
    if (!currentDraft?.id) return;

    if (confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      const { error } = await deleteDraft(currentDraft.id);
      
      if (error) {
        console.error('Delete error:', error);
        return;
      }

      navigate('/create');
    }
  };

  const generateExcerpt = () => {
    if (content.length > 0) {
      const words = content.split(' ').slice(0, 30);
      setExcerpt(words.join(' ') + (content.split(' ').length > 30 ? '...' : ''));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-space-dark pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-space-light to-space-base py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-block mb-2 bg-accent-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                <div className="flex items-center space-x-2">
                  <Sparkles size={14} className="text-accent-200" />
                  <span className="text-xs font-medium">AI-Powered Story Creation</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-display font-bold text-white mb-2">
                {currentDraft ? 'Edit Your Story' : 'Create Your Next Masterpiece'}
              </h1>
              <p className="text-gray-300">
                {currentDraft ? 'Continue working on your draft' : 'Write, upload, and share your stories with the world'}
              </p>
              
              {lastSaved && (
                <p className="text-sm text-gray-400 mt-2">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                leftIcon={<Eye size={16} />}
              >
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
              
              {currentDraft && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteDraft}
                  leftIcon={<Trash2 size={16} />}
                  className="text-error-400 border-error-400 hover:bg-error-400 hover:text-white"
                >
                  Delete Draft
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Messages */}
      {error && (
        <div className="container mx-auto px-4 mt-4">
          <div className="bg-error-900/50 border border-error-500/50 rounded-lg p-3 flex items-start">
            <AlertCircle size={18} className="text-error-400 flex-shrink-0 mt-0.5 mr-2" />
            <p className="text-sm text-error-400">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="container mx-auto px-4 mt-4">
          <div className="bg-success-900/50 border border-success-500/50 rounded-lg p-3 flex items-start">
            <Check size={18} className="text-success-400 flex-shrink-0 mt-0.5 mr-2" />
            <p className="text-sm text-success-400">{success}</p>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Creation Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-space-base p-1 rounded-xl inline-flex">
            <button
              onClick={() => setSelectedTab('write')}
              className={`px-6 py-3 rounded-lg flex items-center transition-colors ${
                selectedTab === 'write'
                  ? 'bg-space-accent text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen size={18} className="mr-2" />
              Write Story
            </button>
            <button
              onClick={() => setSelectedTab('upload')}
              className={`px-6 py-3 rounded-lg flex items-center transition-colors ${
                selectedTab === 'upload'
                  ? 'bg-space-accent text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Upload size={18} className="mr-2" />
              Upload Content
            </button>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {showPreview ? (
            /* Preview Mode */
            <div className="bg-space-base/90 backdrop-blur-sm rounded-xl p-8 border border-space-light/20">
              <h2 className="text-2xl font-display font-bold text-white mb-4">Preview</h2>
              
              {coverImage && (
                <img 
                  src={coverImage} 
                  alt="Cover" 
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <h1 className="text-3xl font-display font-bold text-white mb-2">
                {title || 'Untitled Story'}
              </h1>
              
              {excerpt && (
                <p className="text-xl text-gray-300 mb-4 italic">
                  {excerpt}
                </p>
              )}
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-primary-600/20 text-primary-400 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="prose prose-invert prose-lg max-w-none">
                {content.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-200 mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="bg-space-base/90 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-white font-medium mb-2">
                      Story Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your story title"
                      required
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="excerpt" className="block text-white font-medium">
                        Excerpt
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={generateExcerpt}
                        className="text-xs"
                      >
                        Auto-generate
                      </Button>
                    </div>
                    <textarea
                      id="excerpt"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Brief description of your story..."
                    />
                  </div>
                  
                  {/* Content */}
                  {selectedTab === 'write' ? (
                    <div>
                      <label htmlFor="content" className="block text-white font-medium mb-2">
                        Story Content *
                      </label>
                      <div className="relative">
                        <textarea
                          id="content"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows={16}
                          className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                          placeholder="Start writing your story..."
                          required
                        />
                        <button
                          type="button"
                          className="absolute bottom-4 right-4 bg-secondary-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-secondary-500 transition-colors"
                        >
                          <Sparkles size={16} className="mr-2" />
                          AI Assist
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Upload Content
                      </label>
                      <div className="border-2 border-dashed border-space-light/30 rounded-lg p-8">
                        <div className="text-center">
                          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-300 mb-2">
                            Drag and drop your content here, or click to browse
                          </p>
                          <p className="text-gray-500 text-sm mb-4">
                            Supports: .txt, .doc, .docx, .pdf, images (max 10MB each)
                          </p>
                          <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                            accept=".txt,.doc,.docx,.pdf,image/*"
                          />
                          <label htmlFor="file-upload">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="cursor-pointer"
                              as="span"
                            >
                              Browse Files
                            </Button>
                          </label>
                        </div>
                        
                        {uploadedFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-white font-medium">Uploaded Files:</h4>
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-space-dark/30 rounded p-2">
                                <span className="text-gray-300 text-sm">{file.name}</span>
                                <span className="text-gray-500 text-xs">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Cover Image */}
                  <div>
                    <label htmlFor="cover-image" className="block text-white font-medium mb-2">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      id="cover-image"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    {coverImage && (
                      <img 
                        src={coverImage} 
                        alt="Cover preview" 
                        className="mt-2 w-full h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-white font-medium mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={categoriesLoading}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Content Rating */}
                  <div>
                    <label htmlFor="rating" className="block text-white font-medium mb-2">
                      Content Rating
                    </label>
                    <select
                      id="rating"
                      value={contentRating}
                      onChange={(e) => setContentRating(e.target.value as any)}
                      className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="general">General</option>
                      <option value="teen">Teen</option>
                      <option value="mature">Mature</option>
                      <option value="adult">Adult</option>
                    </select>
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <label htmlFor="tags" className="block text-white font-medium mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="flex-1 px-4 py-2 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Add a tag"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleAddTag}
                        leftIcon={<Plus size={16} />}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="bg-primary-600/20 text-primary-400 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            #{tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-2 text-primary-300 hover:text-white"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Auto-save Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-white font-medium">Auto-save</label>
                    <input
                      type="checkbox"
                      checked={autoSaveEnabled}
                      onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-space-light/20">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => handleSaveDraft()}
                  disabled={loading}
                  leftIcon={loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                >
                  {loading ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handlePublish}
                  disabled={loading || !title.trim() || !content.trim()}
                  leftIcon={loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                >
                  {loading ? 'Publishing...' : 'Publish Story'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePage;