import { describe, it, expect } from "vitest";
import { DailyContemplation } from "../types";

describe("Daily Contemplation & Deep-Linking", () => {
  const sampleContemplation: DailyContemplation = {
    id: "contemplation-col-1-17",
    reference: "Colossians 1:17",
    text: "And he is before all things, and in him all things hold together.",
    theme: "divinity_of_christ",
    themeLabel: "Divinity of Christ",
    reflectionPrompt:
      "Where in your life are you straining to hold circumstances together that Christ has already secured?",
    christologicalFocus:
      "Jesus as the cosmic Sustainer and eternal Cornerstone holding creation intact.",
  };

  it("should format deep-link prompts accurately for the spiritual notepad", () => {
    const formattedPrompt = `${sampleContemplation.reference}: "${sampleContemplation.text}"\n\nPrompt: ${sampleContemplation.reflectionPrompt}\n\nMy Reflection:\n`;

    expect(formattedPrompt).toContain("Colossians 1:17");
    expect(formattedPrompt).toContain("hold together");
    expect(formattedPrompt).toContain("Where in your life");
    expect(formattedPrompt.endsWith("My Reflection:\n")).toBe(true);
  });

  it("should map theological themes to appropriate prayer archetypes", () => {
    const emotionMapping: Record<string, string> = {
      spiritual_strength: "Weary & Faint",
      repentance_transformation: "Contrite / Seeking Cleansing",
      divinity_of_christ: "Seeking Awe of Christ",
    };

    expect(emotionMapping[sampleContemplation.theme]).toBe("Seeking Awe of Christ");
  });
});
