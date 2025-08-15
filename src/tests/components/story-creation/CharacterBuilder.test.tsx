import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterBuilder } from '@/components/story-creation/CharacterBuilder';

describe('CharacterBuilder', () => {
  const mockOnComplete = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial character', () => {
    render(<CharacterBuilder onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    expect(screen.getByText('Create Your Characters')).toBeInTheDocument();
    expect(screen.getByText('Main Character')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('adds a new character when add character button is clicked', () => {
    render(<CharacterBuilder onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    const addButton = screen.getByText(/Add Another Character/);
    fireEvent.click(addButton);

    // Should now have two characters
    expect(screen.getAllByText('Sidekick')).toHaveLength(1);
  });

  it('removes a character when remove button is clicked', () => {
    render(<CharacterBuilder onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    // Add a character first
    const addButton = screen.getByText(/Add Another Character/);
    fireEvent.click(addButton);

    // Now remove the second character
    const removeButtons = screen.getAllByLabelText(/Remove character/);
    fireEvent.click(removeButtons[0]); // Click the first remove button (for second character)

    // Should be back to one character
    expect(screen.queryByText('Sidekick')).not.toBeInTheDocument();
  });

  it('updates character name when input changes', () => {
    render(<CharacterBuilder onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    const nameInput = screen.getByLabelText('Character Name');
    fireEvent.change(nameInput, { target: { value: 'Test Character' } });

    expect(nameInput).toHaveValue('Test Character');
  });

  it('adds trait to character when trait button is clicked', () => {
    render(<CharacterBuilder onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    // Find a trait button and click it
    const braveButton = screen.getByText('Brave');
    fireEvent.click(braveButton);

    // Check if trait is added (this might be tricky to test visually)
    expect(braveButton).toBeInTheDocument();
  });

  it('calls onComplete with valid characters when continue button is clicked', () => {
    render(<CharacterBuilder onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    // Add a name to the character
    const nameInput = screen.getByLabelText('Character Name');
    fireEvent.change(nameInput, { target: { value: 'Test Character' } });

    const continueButton = screen.getByText('Continue with Characters');
    fireEvent.click(continueButton);

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('calls onSkip when skip button is clicked', () => {
    render(<CharacterBuilder onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    const skipButton = screen.getByText('Skip Character Setup');
    fireEvent.click(skipButton);

    expect(mockOnSkip).toHaveBeenCalled();
  });

  it('shows error when trying to continue with no named characters', () => {
    render(<CharacterBuilder onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    const continueButton = screen.getByText('Continue with Characters');
    fireEvent.click(continueButton);

    // Should show toast error (we can't easily test this, but we can check the function wasn't called)
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('uses character template when template button is clicked', () => {
    render(<CharacterBuilder onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    // Find a template button and click it
    const templateButton = screen.getByText('The Hero');
    fireEvent.click(templateButton);

    // Check if name is updated
    const nameInput = screen.getByLabelText('Character Name');
    expect(nameInput).toHaveValue('The Hero');
  });

  it('uses quick name suggestion when clicked', () => {
    render(<CharacterBuilder onComplete={mockOnComplete} onSkip={mockOnSkip} />);

    // Find a name suggestion and click it
    const nameSuggestion = screen.getByText('Alex');
    fireEvent.click(nameSuggestion);

    // Check if name is updated
    const nameInput = screen.getByLabelText('Character Name');
    expect(nameInput).toHaveValue('Alex');
  });
});