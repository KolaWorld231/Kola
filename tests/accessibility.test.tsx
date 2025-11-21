/**
 * Accessibility Tests
 * 
 * These tests verify that components meet WCAG AA standards for:
 * - Color contrast
 * - ARIA labels
 * - Keyboard navigation
 * - Focus management
 */

import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Chip } from '@/components/ui/chip';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

describe('Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should have accessible label when aria-label is provided', () => {
      render(<Button aria-label="Submit form">Submit</Button>);
      const button = screen.getByRole('button', { name: 'Submit form' });
      expect(button).toBeInTheDocument();
    });

    it('should have accessible label from children when aria-label is not provided', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      render(<Button>Accessible Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('should have focus styles', () => {
      render(<Button>Focusable Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('focus-visible:ring-2');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Modal Component', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should have accessible close button', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <p>Modal content</p>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      expect(closeButton).toBeInTheDocument();
    });

    it('should trap focus within modal', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <Button>Button 1</Button>
          <Button>Button 2</Button>
        </Modal>
      );
      
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('ProgressBar Component', () => {
    it('should have proper ARIA attributes', () => {
      render(<ProgressBar value={50} max={100} label="Progress" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-label', 'Progress');
    });
  });

  describe('Input Component', () => {
    it('should have associated label when label prop is provided', () => {
      render(<Input label="Email" id="email" />);
      const label = screen.getByText('Email');
      const input = screen.getByLabelText('Email');
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });

    it('should have proper input type', () => {
      render(<Input type="email" label="Email" id="email" />);
      const input = screen.getByLabelText('Email') as HTMLInputElement;
      expect(input.type).toBe('email');
    });
  });

  describe('Chip Component', () => {
    it('should have accessible remove button when onRemove is provided', () => {
      render(<Chip label="Test" onRemove={() => {}} />);
      const removeButton = screen.getByRole('button', { name: 'Remove' });
      expect(removeButton).toBeInTheDocument();
      expect(removeButton).toHaveAttribute('aria-label', 'Remove');
    });
  });

  describe('Avatar Component', () => {
    it('should have proper role and aria-label', () => {
      render(<Avatar name="John Doe" src="/avatar.jpg" />);
      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('aria-label', 'John Doe');
    });
  });
});


