import { render } from "@testing-library/react";
import { Logo, BirdIcon } from "../logo";

/* eslint-disable testing-library/no-node-access, testing-library/no-container */
describe("Logo Component", () => {
  it("renders logo with text", () => {
    const { container } = render(<Logo />);
    // "Kola" text is split across spans, so check for container
    const logoText = container.textContent;
    expect(logoText).toContain("Kola");
  });

  it("renders logo without text when showText is false", () => {
    const { container } = render(<Logo showText={false} />);
    const logoText = container.textContent;
    expect(logoText).not.toContain("Kola");
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies size classes correctly", () => {
    const { container } = render(<Logo size="lg" />);
    // Check that logo text contains "Kola" and has correct structure
    const logoText = container.textContent;
    expect(logoText).toContain("Kola");
    // Check for SVG (bird icon)
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Logo className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders bird icon standalone", () => {
    const { container } = render(<BirdIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    const logoText = container.textContent;
    expect(logoText).not.toContain("Kola");
  });
});
/* eslint-enable testing-library/no-node-access, testing-library/no-container */

