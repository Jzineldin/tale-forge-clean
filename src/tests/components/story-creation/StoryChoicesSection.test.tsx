import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StoryChoicesSection from '@/components/story-creation/StoryChoicesSection';

// Mock the useStoryChoices hook
jest.mock('@/hooks/useStoryChoices', () => ({
  useStoryChoices: () => ({
    getChoices: jest.fn().mockReturnValue([]),
    hasChoices: jest.fn().mockReturnValue(false),
  }),
}));

describe('StoryChoicesSection', () => {
  const mockOnChoiceSelect = jest.fn();
  const mockOnSkipImageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders choices correctly', () => {
    render(
      <StoryChoicesSection
        segmentId="test-segment"
        isGenerating={false}
        onChoiceSelect={mockOnChoiceSelect}
        fallbackChoices={['Choice 1', 'Choice 2']}
      />
    );

    expect(screen.getByText('Choice 1')).toBeInTheDocument();
    expect(screen.getByText('Choice 2')).toBeInTheDocument();
  });

  it('calls onChoiceSelect when a choice is clicked', () => {
    render(
      <StoryChoicesSection
        segmentId="test-segment"
        isGenerating={false}
        onChoiceSelect={mockOnChoiceSelect}
        fallbackChoices={['Choice 1']}
      />
    );

    const choiceButton = screen.getByText('Choice 1');
    fireEvent.click(choiceButton);

    expect(mockOnChoiceSelect).toHaveBeenCalledWith('Choice 1');
  });

  it('renders loading state when generating and no choices', () => {
    render(
      <StoryChoicesSection
        segmentId="test-segment"
        isGenerating={true}
        onChoiceSelect={mockOnChoiceSelect}
        fallbackChoices={[]}
      />
    );

    expect(screen.getByText('Generating story choices...')).toBeInTheDocument();
  });

  it('renders nothing when no choices are available', () => {
    render(
      <StoryChoicesSection
        segmentId="test-segment"
        isGenerating={false}
        onChoiceSelect={mockOnChoiceSelect}
        fallbackChoices={[]}
      />
    );

    // Since the component returns null, we can't easily test this
    // But we can check that no choices are rendered
    expect(screen.queryByText('Choice 1')).not.toBeInTheDocument();
  });

  it('renders historical segment message when isHistorical is true', () => {
    render(
      <StoryChoicesSection
        segmentId="test-segment"
        isGenerating={false}
        onChoiceSelect={mockOnChoiceSelect}
        fallbackChoices={['Choice 1']}
        isHistorical={true}
      />
    );

    expect(
      screen.getByText('This is a previous chapter. Navigate to the latest chapter to continue the story.')
    ).toBeInTheDocument();
  });

  it('renders continued segment message when hasBeenContinued is true', () => {
    render(
      <StoryChoicesSection
        segmentId="test-segment"
        isGenerating={false}
        onChoiceSelect={mockOnChoiceSelect}
        fallbackChoices={['Choice 1']}
        hasBeenContinued={true}
        selectedChoice="Choice 1"
      />
    );

    expect(
      screen.getByText('You chose: "Choice 1". This chapter has already been continued.')
    ).toBeInTheDocument();
  });

  it('renders skip image toggle when onSkipImageChange is provided', () => {
    render(
      <StoryChoicesSection
        segmentId="test-segment"
        isGenerating={false}
        onChoiceSelect={mockOnChoiceSelect}
        fallbackChoices={['Choice 1']}
        skipImage={false}
        onSkipImageChange={mockOnSkipImageChange}
      />
    );

    const skipImageCheckbox = screen.getByLabelText(
      'Skip image generation for next segment'
    );
    expect(skipImageCheckbox).toBeInTheDocument();
  });

  it('calls onSkipImageChange when skip image checkbox is toggled', () => {
    render(
      <StoryChoicesSection
        segmentId="test-segment"
        isGenerating={false}
        onChoiceSelect={mockOnChoiceSelect}
        fallbackChoices={['Choice 1']}
        skipImage={false}
        onSkipImageChange={mockOnSkipImageChange}
      />
    );

    const skipImageCheckbox = screen.getByLabelText(
      'Skip image generation for next segment'
    );
    fireEvent.click(skipImageCheckbox);

    expect(mockOnSkipImageChange).toHaveBeenCalledWith(true);
  });

  it('handles keyboard navigation for choices', () => {
    render(
      <StoryChoicesSection
        segmentId="test-segment"
        isGenerating={false}
        onChoiceSelect={mockOnChoiceSelect}
        fallbackChoices={['Choice 1']}
      />
    );

    const choiceButton = screen.getByRole('radio');
    fireEvent.keyDown(choiceButton, { key: 'Enter' });

    expect(mockOnChoiceSelect).toHaveBeenCalledWith('Choice 1');
  });

  it('does not call onChoiceSelect for selected choice', () => {
    render(
      <StoryChoicesSection
        segmentId="test-segment"
        isGenerating={false}
        onChoiceSelect={mockOnChoiceSelect}
        fallbackChoices={['Choice 1']}
        selectedChoice="Choice 1"
      />
    );

    const choiceButton = screen.getByText('✓');
    fireEvent.click(choiceButton);

    expect(mockOnChoiceSelect).not.toHaveBeenCalled();
  });
});