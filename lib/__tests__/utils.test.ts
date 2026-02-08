import { cn } from "../utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles conditional classes", () => {
    expect(cn("base-class", false && "hidden", "visible")).toBe("base-class visible");
  });

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null, "valid")).toBe("base valid");
  });

  it("handles empty strings", () => {
    expect(cn("base", "", "valid")).toBe("base valid");
  });
});







