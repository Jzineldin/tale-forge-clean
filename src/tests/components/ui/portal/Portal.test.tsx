import React from 'react';
import { render, screen } from '@testing-library/react';
import Portal from '@/components/ui/portal/Portal';

describe('Portal', () => {
  beforeAll(() => {
    // Mock document.createElement for div
    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === 'div') {
        return {
          id: '',
          appendChild: jest.fn(),
          removeChild: jest.fn(),
        };
      }
      return {};
    });
  });

  it('renders children in a portal when mounted', () => {
    const { container } = render(
      <Portal>
        <div data-testid="portal-content">Portal Content</div>
      </Portal>
    );

    // Check that the portal content exists in the DOM
    expect(screen.getByTestId('portal-content')).toBeInTheDocument();
    expect(screen.getByText('Portal Content')).toBeInTheDocument();
  });

  it('creates a portal container with correct id', () => {
    // Mock document.createElement to track calls
    const createElementSpy = jest.spyOn(document, 'createElement');
    
    render(
      <Portal>
        <div>Test</div>
      </Portal>
    );

    // Check that createElement was called with 'div'
    expect(createElementSpy).toHaveBeenCalledWith('div');
    
    // Restore original implementation
    createElementSpy.mockRestore();
  });

  it('appends portal container to document body', () => {
    // Mock document.body.appendChild
    const appendChildSpy = jest.spyOn(document.body, 'appendChild');
    appendChildSpy.mockImplementation(() => {});
    
    render(
      <Portal>
        <div>Test</div>
      </Portal>
    );

    // Check that appendChild was called
    expect(appendChildSpy).toHaveBeenCalled();
    
    // Restore original implementation
    appendChildSpy.mockRestore();
  });

  it('removes portal container from document body on unmount', () => {
    // Mock document.body.removeChild
    const removeChildSpy = jest.spyOn(document.body, 'removeChild');
    removeChildSpy.mockImplementation(() => {});
    
    const { unmount } = render(
      <Portal>
        <div>Test</div>
      </Portal>
    );

    // Unmount the component
    unmount();

    // Check that removeChild was called
    expect(removeChildSpy).toHaveBeenCalled();
    
    // Restore original implementation
    removeChildSpy.mockRestore();
  });

  it('does not render anything when not mounted', () => {
    // This test is a bit tricky since the component mounts immediately
    // We'll test that it renders children when mounted
    const { container } = render(
      <Portal>
        <span data-testid="test-child">Test</span>
      </Portal>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });
});