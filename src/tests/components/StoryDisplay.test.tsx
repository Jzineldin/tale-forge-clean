import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StoryDisplay from '@/components/StoryDisplay';

describe('StoryDisplay', () => {
  const mockProps = {
    storySegment: {
      storyId: 'test-story',
      text: 'Test story content',
      imageUrl: '/test-image.jpg',
      choices: ['Choice 1', 'Choice 2'],
      isEnd: false,
      imageGenerationStatus: 'completed',
      segmentId: 'test-segment',
    },
    onSelectChoice: jest.fn(),
    onFinishStory: jest.fn(),
    onRestart: jest.fn(),
    isLoading: false,
    isFinishingStory: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with story content', () => {
    render(<StoryDisplay {...mockProps} />);

    expect(screen.getByText('Your Story Continues')).toBeInTheDocument();
    expect(screen.getByText('Test story content')).toBeInTheDocument();
    expect(screen.getByAltText('AI generated story illustration')).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    render(<StoryDisplay {...mockProps} isLoading={true} />);

    // Since StoryLoadingState is a separate component, we can't easily test its content
    // But we can check that the main story content is not rendered
    expect(screen.queryByText('Test story content')).not.toBeInTheDocument();
  });

  it('renders end state when isEnd is true', () => {
    render(
      <StoryDisplay
        {...mockProps}
        storySegment={{ ...mockProps.storySegment, isEnd: true }}
      />
    );

    expect(screen.getByText('Story Complete!')).toBeInTheDocument();
    expect(screen.getByText('The End')).toBeInTheDocument();
    expect(
      screen.getByText('Your adventure has reached its conclusion!')
    ).toBeInTheDocument();
  });

  it('calls onSelectChoice when a choice is clicked', () => {
    render(<StoryDisplay {...mockProps} />);

    const choiceButton = screen.getByText('Choice 1');
    fireEvent.click(choiceButton);

    expect(mockProps.onSelectChoice).toHaveBeenCalledWith('Choice 1');
  });

  it('calls onFinishStory when end story button is clicked', () => {
    render(<StoryDisplay {...mockProps} />);

    const endStoryButton = screen.getByText('End Story Here');
    fireEvent.click(endStoryButton);

    // Should open dialog first
    const confirmButton = screen.getByText('End Story');
    fireEvent.click(confirmButton);

    expect(mockProps.onFinishStory).toHaveBeenCalled();
  });

  it('calls onRestart when start new adventure button is clicked', () => {
    render(
      <StoryDisplay
        {...mockProps}
        storySegment={{ ...mockProps.storySegment, isEnd: true }}
      />
    );

    const restartButton = screen.getByText('Start New Adventure');
    fireEvent.click(restartButton);

    expect(mockProps.onRestart).toHaveBeenCalled();
  });

  it('renders placeholder image when no real image is available', () => {
    render(
      <StoryDisplay
        {...mockProps}
        storySegment={{
          ...mockProps.storySegment,
          imageUrl: '/placeholder.svg',
          imageGenerationStatus: 'completed',
        }}
      />
    );

    expect(screen.getByText('Story Image')).toBeInTheDocument();
  });

  it('renders loading spinner when image is generating', () => {
    render(
      <StoryDisplay
        {...mockProps}
        storySegment={{
          ...mockProps.storySegment,
          imageUrl: '',
          imageGenerationStatus: 'pending',
        }}
      />
    );

    expect(screen.getByText('Creating your story image...')).toBeInTheDocument();
  });

  it('renders skip image toggle when onSkipImageChange is provided', () => {
    const propsWithSkipImage = {
      ...mockProps,
      skipImage: false,
      onSkipImageChange: jest.fn(),
    };

    render(<StoryDisplay {...propsWithSkipImage} />);

    const skipImageCheckbox = screen.getByLabelText(
      'Skip image generation for next segment'
    );
    expect(skipImageCheckbox).toBeInTheDocument();
  });

  it('calls onSkipImageChange when skip image checkbox is toggled', () => {
    const mockOnSkipImageChange = jest.fn();
    const propsWithSkipImage = {
      ...mockProps,
      skipImage: false,
      onSkipImageChange: mockOnSkipImageChange,
    };

    render(<StoryDisplay {...propsWithSkipImage} />);

    const skipImageCheckbox = screen.getByLabelText(
      'Skip image generation for next segment'
    );
    fireEvent.click(skipImageCheckbox);

    expect(mockOnSkipImageChange).toHaveBeenCalledWith(true);
  });
});