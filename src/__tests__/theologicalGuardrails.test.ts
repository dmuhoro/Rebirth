import { describe, it, expect } from "vitest";
import {
  validateOutputAgainstGuardrails,
  buildPastoralSystemInstruction,
  buildDailyContemplationSystemInstruction,
  THEOLOGICAL_PILLARS,
  THEOLOGICAL_HARD_RULES,
} from "../utils/theologicalGuardrails";

describe("Theological Boundary Guardrails (safety foundation)", () => {
  it("passes a biblically sound pastoral response with no violations", () => {
    const clean = `Heavenly Father, I come before You weary. Scripture says, "Come to me, all who labor and are heavy laden, and I will give you rest" (Matthew 11:28). Abide in Christ the Vine (John 15:5). Wait upon the Lord and renew your strength (Isaiah 40:31). In Jesus' name, Amen.`;
    const result = validateOutputAgainstGuardrails(clean);
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("rejects law-of-attraction / frequency framing (Problem 4 boundary)", () => {
    const manifestation =
      "Tune your frequency to attract the reality you desire. Your vibration draws God's blessings into manifestation.";
    const result = validateOutputAgainstGuardrails(manifestation);
    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it("rejects prosperity gospel / wealth-as-faith claims", () => {
    const prosperity =
      "God wants you to be rich. If you have enough faith and declare it, wealth and promotion will follow.";
    const result = validateOutputAgainstGuardrails(prosperity);
    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it("rejects attributing suffering to insufficient faith", () => {
    const blame = "Your illness is because your faith is not strong enough. You are suffering due to weak belief.";
    const result = validateOutputAgainstGuardrails(blame);
    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it("rejects AI speaking as God / direct revelation claims", () => {
    const revelation = "God told me last night that you must quit your job. The Lord revealed to me that this is His will.";
    const result = validateOutputAgainstGuardrails(revelation);
    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it("rejects 'God is saying' direct voice claims", () => {
    const voice = "God is saying that you will receive a miracle this week if you believe hard enough.";
    const result = validateOutputAgainstGuardrails(voice);
    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it("rejects general 'manifest' language", () => {
    const manifest = "Manifest your desired reality through prayer and positive confession.";
    const result = validateOutputAgainstGuardrails(manifest);
    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it("rejects 'law of attraction' phrasing", () => {
    const loa = "Use the law of attraction to draw your ideal circumstances toward you.";
    const result = validateOutputAgainstGuardrails(loa);
    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it("buildPastoralSystemInstruction contains the three pillars", () => {
    const inst = buildPastoralSystemInstruction();
    expect(inst).toContain("Reclaiming Spiritual Strength");
    expect(inst).toContain("Repentance & Inner Transformation");
    expect(inst).toContain("Divinity of Christ");
    expect(inst).toContain("Qavah");
    expect(inst).toContain("Meno");
    expect(inst).toContain("Logos");
    expect(inst).toContain("never speaks as God");
    expect(inst).toContain("Jesus Christ");
  });

  it("buildDailyContemplationSystemInstruction contains guardrails", () => {
    const inst = buildDailyContemplationSystemInstruction();
    expect(inst).toContain("Qavah");
    expect(inst).toContain("metanoia");
    expect(inst).toContain("Logos");
    expect(inst).toContain("Never speak as God");
    expect(inst).toContain("No manifestation");
  });

  it("THEOLOGICAL_PILLARS exports all three pillars with labels and summaries", () => {
    expect(THEOLOGICAL_PILLARS.spiritual_strength.label).toContain("Spiritual Strength");
    expect(THEOLOGICAL_PILLARS.repentance_transformation.label).toContain("Repentance");
    expect(THEOLOGICAL_PILLARS.divinity_of_christ.label).toContain("Divinity of Christ");
    expect(Object.keys(THEOLOGICAL_PILLARS)).toHaveLength(3);
  });

  it("THEOLOGICAL_HARD_RULES is non-empty and covers manifestation, prosperity, suffering-as-faith, direct revelation", () => {
    const joined = THEOLOGICAL_HARD_RULES.join(" ");
    expect(joined.toLowerCase()).toContain("manifestation");
    expect(joined.toLowerCase()).toContain("prosperity");
    expect(joined.toLowerCase()).toContain("suffering");
    expect(joined.toLowerCase()).toContain("direct revelation");
    expect(THEOLOGICAL_HARD_RULES.length).toBeGreaterThanOrEqual(7);
  });
});
