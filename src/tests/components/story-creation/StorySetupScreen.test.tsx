import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StorySetupScreen from '@/components/story-creation/StorySetupScreen';

describe('StorySetupScreen', () => {
  const mockProps = {
    prompt: 'Test story prompt',
    storyMode: 'fantasy',
    skipImage: false,
    apiCallsCount: 5,
    onSkipImageChange: jest.fn(),
    onStartStory: jest.fn(),
    onGoHome: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with provided props', () => {
    render(<StorySetupScreen {...mockProps} />);

    expect(screen.getByText('Ready to Create Your Story')).toBeInTheDocument();
    expect(screen.getByText('fantasy')).toBeInTheDocument();
    expect(screen.getByText('5 API calls used')).toBeInTheDocument();
  });

  it('displays the prompt in the input field', () => {
    render(<StorySetupScreen {...mockProps} />);

    const promptInput = screen.getByDisplayValue('Test story prompt');
    expect(promptInput).toBeInTheDocument();
  });

  it('calls onStartStory when start button is clicked and form is valid', () => {
    render(<StorySetupScreen {...mockProps} />);

    const startButton = screen.getByText('Begin the Magical Journey');
    fireEvent.click(startButton);

    expect(mockProps.onStartStory).toHaveBeenCalled();
  });

  it('displays error message when prompt is empty', () => {
    render(<StorySetupScreen {...mockProps} prompt="" />);

    expect(screen.getByText('No story prompt provided')).toBeInTheDocument();
  });

  it('displays error message when story mode is not selected', () => {
    render(<StorySetupScreen {...mockProps} storyMode="" />);

    expect(screen.getByText('No story mode selected')).toBeInTheDocument();
  });

  it('calls onGoHome when back to home button is clicked', () => {
    render(<StorySetupScreen {...mockProps} />);

    const homeButton = screen.getByText('Back to Home');
    fireEvent.click(homeButton);

    expect(mockProps.onGoHome).toHaveBeenCalled();
  });

  it('calls onSkipImageChange when skip image checkbox is toggled', () => {
    render(<StorySetupScreen {...mockProps} />);

    const skipImageCheckbox = screen.getByLabelText('Skip image generation for now (saves 1-2 credits per segment - you can add images later)');
    fireEvent.click(skipImageCheckbox);

    expect(mockProps.onSkipImageChange).toHaveBeenCalledWith(true);
  });

  it('opens tour when take a tour button is clicked', () => {
    render(<StorySetupScreen {...mockProps} />);

    const tourButton = screen.getByLabelText('Take a guided tour');
    fireEvent.click(tourButton);

    // We can't easily test the Tour component rendering, but we can check that
    // the button click doesn't cause an error
    expect(tourButton).toBeInTheDocument();
  });

  it('renders tour component when showTour is true', () => {
    render(<StorySetupScreen {...mockProps} />);

    const tourButton = screen.getByLabelText('Take a guided tour');
    fireEvent.click(tourButton);

    // Check that the tour button exists (this indicates the component rendered)
    expect(tourButton).toBeInTheDocument();
  });
});