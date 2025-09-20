import React, { useState } from 'react';
import { Sparkles, Upload, BookOpen, Headphones, Image as ImageIcon } from 'lucide-react';
import Button from '../components/ui/Button';

const CreatePage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'write' | 'upload'>('write');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle story creation
    console.log({ title, content, category, tags });
  };

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* Create Header */}
      <div className="bg-gradient-to-b from-space-light to-space-base py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block mb-4 bg-accent-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-full">
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-accent-200" />
                <span className="text-sm font-medium">AI-Powered Story Creation</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-display font-bold text-white mb-4">
              Create Your Next Masterpiece
            </h1>
            <p className="text-xl text-gray-300">
              Whether you're writing from scratch or uploading existing content,
              our AI tools are here to enhance your creative process.
            </p>
          </div>
        </div>
      </div>
      
      {/* Create Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Creation Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-space-base p-1 rounded-xl inline-flex">
            <button
              onClick={() => setSelectedTab('write')}
              className={`px-6 py-3 rounded-lg flex items-center ${
                selectedTab === 'write'
                  ? 'bg-space-accent text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen size={18} className="mr-2" />
              Write New Story
            </button>
            <button
              onClick={() => setSelectedTab('upload')}
              className={`px-6 py-3 rounded-lg flex items-center ${
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
        
        {/* Creation Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-space-base/90 backdrop-blur-sm rounded-xl p-6 border border-space-light/20">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="title" className="block text-white font-medium mb-2">
                  Story Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your story title"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="category" className="block text-white font-medium mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a category</option>
                  <option value="sci-fi">Science Fiction</option>
                  <option value="fantasy">Fantasy</option>
                  <option value="mystery">Mystery</option>
                  <option value="romance">Romance</option>
                </select>
              </div>
              
              {selectedTab === 'write' ? (
                <div className="mb-6">
                  <label htmlFor="content" className="block text-white font-medium mb-2">
                    Story Content
                  </label>
                  <div className="relative">
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={12}
                      className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Start writing your story..."
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
                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">
                    Upload Content
                  </label>
                  <div className="border-2 border-dashed border-space-light/30 rounded-lg p-8">
                    <div className="text-center">
                      <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-300 mb-2">
                        Drag and drop your content here, or click to browse
                      </p>
                      <p className="text-gray-500 text-sm">
                        Supports: .txt, .doc, .docx, .pdf (max 10MB)
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-4"
                      >
                        Browse Files
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <label htmlFor="tags" className="block text-white font-medium mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add tags separated by commas (e.g., space, adventure, mystery)"
                />
              </div>
              
              <div className="flex justify-end gap-4">
                <Button variant="outline" size="lg">
                  Save Draft
                </Button>
                <Button variant="primary" size="lg" type="submit">
                  Publish Story
                </Button>
              </div>
            </form>
          </div>
          
          {/* AI Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-space-base/50 rounded-xl p-6 border border-space-light/20">
              <div className="w-12 h-12 rounded-full bg-primary-600/30 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-primary-400" />
              </div>
              <h3 className="text-lg font-display font-semibold text-white mb-2">
                AI Writing Assistant
              </h3>
              <p className="text-gray-400">
                Get suggestions for plot development, character arcs, and more as you write.
              </p>
            </div>
            
            <div className="bg-space-base/50 rounded-xl p-6 border border-space-light/20">
              <div className="w-12 h-12 rounded-full bg-secondary-600/30 flex items-center justify-center mb-4">
                <Headphones size={24} className="text-secondary-400" />
              </div>
              <h3 className="text-lg font-display font-semibold text-white mb-2">
                Voice Narration
              </h3>
              <p className="text-gray-400">
                Convert your story into an audiobook with AI-powered voice narration.
              </p>
            </div>
            
            <div className="bg-space-base/50 rounded-xl p-6 border border-space-light/20">
              <div className="w-12 h-12 rounded-full bg-accent-600/30 flex items-center justify-center mb-4">
                <ImageIcon size={24} className="text-accent-400" />
              </div>
              <h3 className="text-lg font-display font-semibold text-white mb-2">
                Cover Generation
              </h3>
              <p className="text-gray-400">
                Create stunning cover art for your story using AI image generation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;