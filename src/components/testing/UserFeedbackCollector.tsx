import React, { useState } from 'react';
import { MessageSquare, Star, Send, X } from 'lucide-react';
import Button from '../ui/Button';

interface FeedbackData {
  feature: 'theme-toggle' | 'voice-models' | 'accessibility' | 'general';
  rating: number;
  usability: number;
  satisfaction: number;
  comments: string;
  suggestions: string;
}

const UserFeedbackCollector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [feedback, setFeedback] = useState<FeedbackData>({
    feature: 'general',
    rating: 0,
    usability: 0,
    satisfaction: 0,
    comments: '',
    suggestions: ''
  });

  const features = [
    { value: 'theme-toggle', label: 'Light/Dark Mode Toggle' },
    { value: 'voice-models', label: 'AI Voice Models' },
    { value: 'accessibility', label: 'Accessibility Features' },
    { value: 'general', label: 'General Experience' }
  ];

  const StarRating: React.FC<{
    value: number;
    onChange: (value: number) => void;
    label: string;
  }> = ({ value, onChange, label }) => (
    <div className="rating-group">
      <label className="rating-label">{label}</label>
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`star ${star <= value ? 'active' : ''}`}
            aria-label={`Rate ${star} out of 5 stars`}
          >
            <Star size={20} fill={star <= value ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = async () => {
    try {
      // In a real implementation, this would send to your analytics service
      console.log('Feedback submitted:', feedback);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setFeedback({
        feature: 'general',
        rating: 0,
        usability: 0,
        satisfaction: 0,
        comments: '',
        suggestions: ''
      });
      
      setCurrentStep(1);
      setIsOpen(false);
      
      // Show success message
      alert('Thank you for your feedback! Your input helps us improve the experience.');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('There was an error submitting your feedback. Please try again.');
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {/* Feedback Button */}
      <Button
        variant="primary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="feedback-trigger"
        leftIcon={<MessageSquare size={16} />}
        title="Provide feedback on new features"
      >
        Feedback
      </Button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="feedback-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Help Us Improve</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label="Close feedback form"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="modal-content">
              {/* Progress Indicator */}
              <div className="progress-indicator">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`progress-step ${currentStep >= step ? 'active' : ''}`}
                  >
                    {step}
                  </div>
                ))}
              </div>

              {/* Step 1: Feature Selection */}
              {currentStep === 1 && (
                <div className="feedback-step">
                  <h4>Which feature would you like to provide feedback on?</h4>
                  <div className="feature-selection">
                    {features.map((feature) => (
                      <label key={feature.value} className="feature-option">
                        <input
                          type="radio"
                          name="feature"
                          value={feature.value}
                          checked={feedback.feature === feature.value}
                          onChange={(e) => setFeedback({
                            ...feedback,
                            feature: e.target.value as FeedbackData['feature']
                          })}
                        />
                        <span>{feature.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Ratings */}
              {currentStep === 2 && (
                <div className="feedback-step">
                  <h4>Please rate your experience</h4>
                  <div className="ratings-section">
                    <StarRating
                      value={feedback.rating}
                      onChange={(value) => setFeedback({ ...feedback, rating: value })}
                      label="Overall Rating"
                    />
                    <StarRating
                      value={feedback.usability}
                      onChange={(value) => setFeedback({ ...feedback, usability: value })}
                      label="Ease of Use"
                    />
                    <StarRating
                      value={feedback.satisfaction}
                      onChange={(value) => setFeedback({ ...feedback, satisfaction: value })}
                      label="Satisfaction"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Comments */}
              {currentStep === 3 && (
                <div className="feedback-step">
                  <h4>Tell us more (optional)</h4>
                  <div className="comments-section">
                    <div className="input-group">
                      <label htmlFor="comments">What did you like or dislike?</label>
                      <textarea
                        id="comments"
                        value={feedback.comments}
                        onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                        placeholder="Share your thoughts about the feature..."
                        rows={3}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="suggestions">Any suggestions for improvement?</label>
                      <textarea
                        id="suggestions"
                        value={feedback.suggestions}
                        onChange={(e) => setFeedback({ ...feedback, suggestions: e.target.value })}
                        placeholder="How can we make this better?"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <div className="footer-buttons">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {currentStep < 3 ? (
                  <Button variant="primary" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    leftIcon={<Send size={16} />}
                  >
                    Submit Feedback
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .feedback-trigger {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 1000;
        }

        .feedback-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
          padding: 20px;
        }

        .feedback-modal {
          background-color: var(--space-base);
          border: 1px solid var(--space-light);
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--space-light);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.2rem;
          color: var(--text-light);
        }

        .modal-content {
          padding: 1.5rem;
        }

        .progress-indicator {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .progress-step {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--space-light);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .progress-step.active {
          background-color: var(--primary-500);
          color: white;
        }

        .feedback-step h4 {
          margin: 0 0 1.5rem 0;
          font-size: 1.1rem;
          color: var(--text-light);
          text-align: center;
        }

        .feature-selection {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .feature-option {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem;
          border: 1px solid var(--space-light);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .feature-option:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .feature-option input[type="radio"] {
          accent-color: var(--primary-500);
        }

        .ratings-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .rating-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .rating-label {
          font-size: 0.9rem;
          color: var(--text-light);
          font-weight: 500;
        }

        .star-rating {
          display: flex;
          gap: 0.3rem;
        }

        .star {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .star:hover,
        .star.active {
          color: var(--accent-500);
          transform: scale(1.1);
        }

        .comments-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-size: 0.9rem;
          color: var(--text-light);
          font-weight: 500;
        }

        .input-group textarea {
          background-color: var(--space-dark);
          border: 1px solid var(--space-light);
          border-radius: 8px;
          padding: 0.8rem;
          color: var(--text-light);
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
        }

        .input-group textarea:focus {
          outline: none;
          border-color: var(--primary-500);
        }

        .input-group textarea::placeholder {
          color: var(--text-muted);
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--space-light);
        }

        .footer-buttons {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .feedback-modal {
            margin: 10px;
            max-width: none;
          }

          .modal-header,
          .modal-content,
          .modal-footer {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default UserFeedbackCollector;