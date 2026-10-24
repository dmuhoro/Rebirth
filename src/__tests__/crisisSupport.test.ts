import { describe, expect, it } from "vitest";
import { detectsImmediateCrisisRisk } from "../utils/crisisSupport";

describe("pastoral request crisis screening", () => {
  it.each([
    "I want to kill myself tonight.",
    "I am planning to end my life.",
    "I don't want to live anymore.",
    "I feel suicidal.",
    "I am considering suicide.",
    "I'm having suicidal thoughts.",
    "I attempted suicide last week.",
  ])("detects explicit first-person crisis intent: %s", (text) => {
    expect(detectsImmediateCrisisRisk(text)).toBe(true);
  });

  it.each([
    "I am not suicidal and do not want to harm myself.",
    "I am studying what suicide means in the Psalms.",
    "I feel tired and overwhelmed by work.",
  ])("does not classify a non-crisis reflection as crisis intent: %s", (text) => {
    expect(detectsImmediateCrisisRisk(text)).toBe(false);
  });
});
