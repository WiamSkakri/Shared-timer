import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Notification from './Notification';

describe('Notification', () => {
  it('should not render when text is empty', () => {
    const { container } = render(<Notification text="" type="success" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render success message', () => {
    render(<Notification text="Success message" type="success" />);

    const messageElement = screen.getByText('Success message');
    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveClass('message');
    expect(messageElement).toHaveClass('success');
  });

  it('should render error message', () => {
    render(<Notification text="Error message" type="error" />);

    const messageElement = screen.getByText('Error message');
    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveClass('message');
    expect(messageElement).toHaveClass('error');
  });

  it('should update when props change', () => {
    const { rerender } = render(<Notification text="First message" type="success" />);
    expect(screen.getByText('First message')).toBeInTheDocument();

    rerender(<Notification text="Second message" type="error" />);
    expect(screen.queryByText('First message')).not.toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('should hide when text becomes empty', () => {
    const { rerender, container } = render(<Notification text="Message" type="success" />);
    expect(screen.getByText('Message')).toBeInTheDocument();

    rerender(<Notification text="" type="success" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render long messages', () => {
    const longMessage = 'This is a very long message that contains a lot of text to ensure the notification can handle lengthy content properly.';
    render(<Notification text={longMessage} type="success" />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });
});
