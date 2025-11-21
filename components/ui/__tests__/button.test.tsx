import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button";

describe("Button Component", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies variant classes correctly", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button", { name: /secondary/i });
    expect(button).toHaveClass("bg-secondary");
  });

  it("has accessible label", () => {
    render(<Button aria-label="Submit form">Submit</Button>);
    expect(screen.getByLabelText("Submit form")).toBeInTheDocument();
  });
});

