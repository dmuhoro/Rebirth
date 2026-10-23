import { describe, it, expect } from "vitest";
import { FORMATION_JOURNEYS } from "../data/journeysData";
import { TheologicalTheme } from "../types";

describe("Formation Journeys — Theological Integrity", () => {
  const REQUIRED_THEMES: TheologicalTheme[] = [
    "spiritual_strength",
    "repentance_transformation",
    "divinity_of_christ",
  ];

  it("covers all three theological pillars across the journey library", () => {
    const presentThemes = new Set(FORMATION_JOURNEYS.map((j) => j.theme));
    for (const theme of REQUIRED_THEMES) {
      expect(presentThemes.has(theme)).toBe(true);
    }
  });

  it("includes the six formation figures plus the Christ capstone", () => {
    const figures = FORMATION_JOURNEYS.map((j) => j.figure);
    expect(figures).toContain("Joseph");
    expect(figures).toContain("Moses");
    expect(figures).toContain("David");
    expect(figures).toContain("Nehemiah");
    expect(figures).toContain("Ruth");
    expect(figures).toContain("Paul");
    expect(figures).toContain("Jesus Christ");
  });

  it("every journey completes the full formation template", () => {
    for (const journey of FORMATION_JOURNEYS) {
      expect(journey.id).toBeTruthy();
      expect(journey.figure).toBeTruthy();
      expect(journey.themeLabel).toBeTruthy();
      expect(journey.theGap).toBeTruthy();
      expect(journey.theCall).toBeTruthy();
      expect(journey.theObjection).toBeTruthy();
      expect(journey.theFormation).toBeTruthy();
      expect(journey.theObedience).toBeTruthy();
      expect(journey.theFailure).toBeTruthy();
      expect(journey.theFruit).toBeTruthy();
      expect(journey.thePractice).toBeTruthy();
      expect(journey.christConnection).toBeTruthy();
      expect(journey.scriptureReference).toBeTruthy();
      expect(journey.scriptureText).toBeTruthy();
      expect(journey.audioNarrationText.length).toBeGreaterThan(200);
      expect(journey.estimatedMinutes).toBeGreaterThan(0);
    }
  });

  it("every journey points to Christ (high Christology pillar)", () => {
    for (const journey of FORMATION_JOURNEYS) {
      const cc = journey.christConnection.toLowerCase();
      expect(cc).toMatch(/christ|son|lord|redeem|savior/);
    }
  });

  it("Christ journey is the capstone and centers the Logos", () => {
    const christ = FORMATION_JOURNEYS.find((j) => j.figure === "Jesus Christ");
    expect(christ).toBeDefined();
    expect(christ!.theme).toBe("divinity_of_christ");
    expect(christ!.christConnection.toLowerCase()).toContain("fulfillment");
  });

  it("contains no manifestation / law-of-attraction / prosperity language", () => {
    const joined = FORMATION_JOURNEYS.map((j) =>
      [j.theGap, j.theCall, j.theObedience, j.theFruit, j.thePractice, j.christConnection].join(" ")
    ).join(" ");
    const lowered = joined.toLowerCase();
    expect(lowered).not.toMatch(/frequency|vibration|attract|manifest|prosperity|wealth|name it/);
  });
});
