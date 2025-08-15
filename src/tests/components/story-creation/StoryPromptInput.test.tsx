import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StoryPromptInput from '@/components/story-creation/StoryPromptInput';

describe('StoryPromptInput', () => {
  const mockOnPromptChange = jest.fn();
  const mockOnModeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial values', () => {
    render(
      <StoryPromptInput
        initialPrompt="Test prompt"
        initialMode="fantasy"
        onPromptChange={mockOnPromptChange}
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByLabelText('Your Story Idea')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test prompt')).toBeInTheDocument();
    expect(screen.getByText(' fantasy')).toBeInTheDocument();
  });

  it('calls onPromptChange when text is entered', () => {
    render(
      <StoryPromptInput
        onPromptChange={mockOnPromptChange}
        onModeChange={mockOnModeChange}
      />
    );

    const textarea = screen.getByLabelText('Your Story Idea');
    fireEvent.change(textarea, { target: { value: 'New test prompt' } });

    expect(mockOnPromptChange).toHaveBeenCalledWith('New test prompt');
  });

  it('calls onModeChange when mode is selected', () => {
    render(
      <StoryPromptInput
        onPromptChange={mockOnPromptChange}
        onModeChange={mockOnModeChange}
      />
    );

    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    const fantasyOption = screen.getByText('Fantasy');
    fireEvent.click(fantasyOption);

    expect(mockOnModeChange).toHaveBeenCalledWith('fantasy');
  });

  it('toggles guidance panel when info button is clicked', () => {
    render(
      <StoryPromptInput
        onPromptChange={mockOnPromptChange}
        onModeChange={mockOnModeChange}
      />
    );

    const infoButton = screen.getByLabelText('Show guidance');
    fireEvent.click(infoButton);

    expect(screen.getByText('Story Idea Tips')).toBeInTheDocument();

    fireEvent.click(infoButton);
    expect(screen.queryByText('Story Idea Tips')).not.toBeInTheDocument();
  });

  it('displays character count', () => {
    render(
      <StoryPromptInput
        initialPrompt="Test"
        onPromptChange={mockOnPromptChange}
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByText('4/500')).toBeInTheDocument();
  });
});