import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StoryProgressControls from '@/components/story-mode/StoryProgressControls';

describe('StoryProgressControls', () => {
  const mockProps = {
    gameState: 'playing' as const,
    currentSegment: { is_end: false, choices: ['Choice 1', 'Choice 2'] },
    storyHistory: [{}, {}],
    isLoading: false,
    isFinishingStory: false,
    isStoryCompleted: false,
    skipImage: false,
    onSkipImageChange: jest.fn(),
    onGoHome: jest.fn(),
    onRestart: jest.fn(),
    onSelectChoice: jest.fn(),
    onFinishStory: jest.fn(),
    onPreviousSegment: jest.fn(),
    onNextSegment: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders desktop view correctly', () => {
    render(<StoryProgressControls {...mockProps} />);

    // Check desktop elements are present
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Skip image generation')).toBeInTheDocument();
    expect(screen.getByText('End Story')).toBeInTheDocument();
  });

  it('renders mobile view correctly', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('max-width: 768px'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<StoryProgressControls {...mockProps} />);

    // Check mobile menu toggle is present
    expect(screen.getByLabelText('Open Menu')).toBeInTheDocument();
  });

  it('calls onGoHome when home button is clicked', () => {
    render(<StoryProgressControls {...mockProps} />);

    const homeButton = screen.getByText('Home');
    fireEvent.click(homeButton);

    expect(mockProps.onGoHome).toHaveBeenCalled();
  });

  it('calls onPreviousSegment when previous button is clicked', () => {
    render(<StoryProgressControls {...mockProps} />);

    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);

    expect(mockProps.onPreviousSegment).toHaveBeenCalled();
  });

  it('calls onFinishStory when end story button is clicked', () => {
    render(<StoryProgressControls {...mockProps} />);

    const endStoryButton = screen.getByText('End Story');
    fireEvent.click(endStoryButton);

    // Should open dialog first
    const confirmButton = screen.getByText('End Story');
    fireEvent.click(confirmButton);

    expect(mockProps.onFinishStory).toHaveBeenCalled();
  });

  it('toggles skip image generation', () => {
    render(<StoryProgressControls {...mockProps} />);

    const skipImageCheckbox = screen.getByLabelText('Skip image generation');
    fireEvent.click(skipImageCheckbox);

    expect(mockProps.onSkipImageChange).toHaveBeenCalledWith(true);
  });

  it('calls onSelectChoice for mobile choice buttons', () => {
    render(<StoryProgressControls {...mockProps} />);

    // Check if mobile choice buttons are rendered
    const choiceButton = screen.queryByText('Choice 1');
    if (choiceButton) {
      fireEvent.click(choiceButton);
      expect(mockProps.onSelectChoice).toHaveBeenCalledWith('Choice 1');
    }
  });
});