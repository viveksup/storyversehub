import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import Button from '../components/ui/Button';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('Thank you for your message! We\'ll get back to you within 24 hours.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-space-light to-space-base py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Have questions, feedback, or need support? We'd love to hear from you. 
            Our team is here to help you make the most of your StoryVerse experience.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-display font-bold text-white mb-8">
              Contact Information
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-600/30 rounded-lg">
                  <Mail size={24} className="text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Email</h3>
                  <p className="text-gray-400">support@storyversehub.com</p>
                  <p className="text-gray-400">hello@storyversehub.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary-600/30 rounded-lg">
                  <Phone size={24} className="text-secondary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Phone</h3>
                  <p className="text-gray-400">+1 (555) 123-4567</p>
                  <p className="text-gray-400 text-sm">Mon-Fri, 9AM-6PM PST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent-600/30 rounded-lg">
                  <MapPin size={24} className="text-accent-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Address</h3>
                  <p className="text-gray-400">
                    123 Innovation Drive<br />
                    San Francisco, CA 94105<br />
                    United States
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-success-600/30 rounded-lg">
                  <Clock size={24} className="text-success-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Response Time</h3>
                  <p className="text-gray-400">
                    We typically respond within 24 hours during business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Help</h3>
              <div className="space-y-2">
                <a href="/support" className="block text-primary-400 hover:text-primary-300 transition-colors">
                  Help Center & FAQ
                </a>
                <a href="/community/forums" className="block text-primary-400 hover:text-primary-300 transition-colors">
                  Community Forums
                </a>
                <a href="/legal/terms" className="block text-primary-400 hover:text-primary-300 transition-colors">
                  Terms of Service
                </a>
                <a href="/legal/privacy" className="block text-primary-400 hover:text-primary-300 transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-space-base/50 rounded-xl p-8 border border-space-light/20">
              <h2 className="text-2xl font-display font-bold text-white mb-6">
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Subscriptions</option>
                    <option value="content">Content Issues</option>
                    <option value="partnership">Partnership Opportunities</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-vertical"
                    placeholder="Please describe your inquiry in detail..."
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  leftIcon={isSubmitting ? undefined : <Send size={18} />}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;