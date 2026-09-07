import { describe, it, expect } from "vitest";
import { LESSONS } from "../data/lessonsData";
import { SCRIPTURE_STUDIES } from "../data/scripturesData";
import { TheologicalTheme } from "../types";

describe("Theological Foundations & Curriculum Integrity", () => {
  const REQUIRED_THEMES: TheologicalTheme[] = [
    "spiritual_strength",
    "repentance_transformation",
    "divinity_of_christ",
  ];

  it("should encompass all three permanent core themes in theological lessons", () => {
    const presentThemes = new Set(LESSONS.map((l) => l.theme));
    for (const theme of REQUIRED_THEMES) {
      expect(presentThemes.has(theme)).toBe(true);
    }
  });

  it("should provide comprehensive exposition, contemplative exercises, and scripture for every lesson", () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(3);

    for (const lesson of LESSONS) {
      expect(lesson.title).toBeTruthy();
      expect(lesson.subtitle).toBeTruthy();
      expect(lesson.estimatedMinutes).toBeGreaterThan(0);
      expect(lesson.audioNarrationText.length).toBeGreaterThan(200);
      expect(lesson.sections.length).toBeGreaterThanOrEqual(2);
      expect(lesson.contemplativeExercise).toBeDefined();
      expect(lesson.contemplativeExercise.prompt).toBeTruthy();
      expect(lesson.contemplativeExercise.actionStep).toBeTruthy();

      for (const section of lesson.sections) {
        expect(section.title).toBeTruthy();
        expect(section.paragraphs.length).toBeGreaterThan(0);
      }
    }
  });

  it("should embody Old Testament waiting and New Testament abiding in Spiritual Strength lessons", () => {
    const strengthLessons = LESSONS.filter((l) => l.theme === "spiritual_strength");
    expect(strengthLessons.length).toBeGreaterThanOrEqual(1);

    const combinedNarration = strengthLessons.map((l) => l.audioNarrationText.toLowerCase()).join(" ");
    expect(combinedNarration).toContain("wait");
    expect(combinedNarration).toContain("qavah");

    const hasAbiding = strengthLessons.some(
      (l) =>
        l.title.toLowerCase().includes("abiding") ||
        l.sections.some((s) => s.paragraphs.some((p) => p.toLowerCase().includes("abide") || p.toLowerCase().includes("vine")))
    );
    expect(hasAbiding).toBe(true);
  });

  it("should embody Clean Heart theology and heart of flesh in Repentance lessons", () => {
    const repentanceLesson = LESSONS.find((l) => l.theme === "repentance_transformation");
    expect(repentanceLesson).toBeDefined();
    expect(
      repentanceLesson?.sections.some(
        (s) =>
          s.paragraphs.some(
            (p) =>
              p.includes("metanoia") ||
              p.includes("heart of flesh") ||
              p.includes("Ezekiel 36") ||
              p.includes("clean heart")
          )
      )
    ).toBe(true);
  });

  it("should embody John 1:1, Colossians 1, and Christ as the absolute Bridge in Christology lessons", () => {
    const christologyLesson = LESSONS.find((l) => l.theme === "divinity_of_christ");
    expect(christologyLesson).toBeDefined();
    expect(
      christologyLesson?.sections.some(
        (s) =>
          s.paragraphs.some(
            (p) =>
              p.includes("John 1") ||
              p.includes("Colossians 1") ||
              p.includes("Bridge") ||
              p.includes("Logos")
          )
      )
    ).toBe(true);
  });

  it("should provide in-depth Hebrew and Greek linguistic insights in Scripture Studies", () => {
    expect(SCRIPTURE_STUDIES.length).toBeGreaterThanOrEqual(3);

    for (const study of SCRIPTURE_STUDIES) {
      expect(study.title).toBeTruthy();
      expect(study.reference).toBeTruthy();
      expect(study.fullText).toBeTruthy();
      expect(study.historicalContext).toBeTruthy();
      expect(study.exegesis).toBeTruthy();
      expect(study.christologicalBridge).toBeTruthy();
      expect(study.prayerfulResponse).toBeTruthy();
      expect(study.originalLanguageInsights.length).toBeGreaterThanOrEqual(1);

      for (const insight of study.originalLanguageInsights) {
        expect(["Hebrew", "Greek", "Aramaic"]).toContain(insight.language);
        expect(insight.term).toBeTruthy();
        expect(insight.transliteration).toBeTruthy();
        expect(insight.definition).toBeTruthy();
        expect(insight.theologicalSignificance).toBeTruthy();
      }
    }
  });
});
