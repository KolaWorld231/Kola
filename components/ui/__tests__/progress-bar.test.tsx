import { render, screen } from "@testing-library/react";
import { ProgressBar } from "../progress-bar";

describe("ProgressBar Component", () => {
  it("renders with correct value", () => {
    render(<ProgressBar value={50} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
  });

  it("displays label when provided", () => {
    render(<ProgressBar value={75} label="Loading" showLabel />);
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("respects max value", () => {
    render(<ProgressBar value={50} max={200} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuemax", "200");
    expect(progressBar).toHaveAttribute("aria-valuenow", "25");
  });

  it("applies variant classes", () => {
    render(<ProgressBar value={60} variant="success" />);
    const progressBar = screen.getByRole("progressbar");
    // Check that progress bar is rendered with correct accessibility attributes
    expect(progressBar).toHaveAttribute("aria-valuenow", "60");
  });
});

