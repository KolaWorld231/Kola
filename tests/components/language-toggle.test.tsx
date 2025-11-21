/**
 * Component Tests - Language Toggle
 * 
 * Tests the LanguageToggle component:
 * - Toggle functionality
 * - Loading states
 * - Error handling
 * - Success notifications
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageToggle } from "@/components/admin/language-toggle";

// Mock toast
jest.mock("@/lib/toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe("LanguageToggle Component", () => {
  const mockProps = {
    languageId: "test-lang-id",
    languageName: "Bassa",
    isActive: true,
    onToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("should render with active status", () => {
    render(<LanguageToggle {...mockProps} />);

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("should render with inactive status", () => {
    render(<LanguageToggle {...mockProps} isActive={false} />);

    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("should toggle language status on click", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: "Language deactivated successfully",
        language: { id: "test-lang-id", isActive: false },
      }),
    });

    render(<LanguageToggle {...mockProps} />);

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/admin/languages/${mockProps.languageId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: false }),
        }
      );
    });
  });

  it("should call onToggle callback after successful toggle", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: "Language deactivated successfully",
        language: { id: "test-lang-id", isActive: false },
      }),
    });

    render(<LanguageToggle {...mockProps} onToggle={onToggle} />);

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith(false);
    });
  });

  it("should show loading state during toggle", async () => {
    const user = userEvent.setup();
    let resolveFetch: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);

    render(<LanguageToggle {...mockProps} />);

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    // Should show loading state
    expect(toggle).toBeDisabled();

    // Resolve the fetch
    resolveFetch!({
      ok: true,
      json: async () => ({
        message: "Language deactivated successfully",
        language: { id: "test-lang-id", isActive: false },
      }),
    });

    await waitFor(() => {
      expect(toggle).not.toBeDisabled();
    });
  });

  it("should handle API errors gracefully", async () => {
    const user = userEvent.setup();
    const { toast } = require("@/lib/toast");
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to update language" }),
    });

    render(<LanguageToggle {...mockProps} />);

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    // Status should remain unchanged on error
    expect(toggle).toBeChecked();
  });

  it("should not toggle when already loading", async () => {
    const user = userEvent.setup();
    let resolveFetch: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);

    render(<LanguageToggle {...mockProps} />);

    const toggle = screen.getByRole("switch");
    
    // Start toggle
    await user.click(toggle);
    
    // Try to toggle again while loading
    await user.click(toggle);

    // Should only have called fetch once
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Resolve to clean up
    resolveFetch!({
      ok: true,
      json: async () => ({
        message: "Language deactivated successfully",
        language: { id: "test-lang-id", isActive: false },
      }),
    });

    await waitFor(() => {
      expect(toggle).not.toBeDisabled();
    });
  });
});

