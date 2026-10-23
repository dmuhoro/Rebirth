import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import {
  buildPastoralSystemInstruction,
  buildDailyContemplationSystemInstruction,
  validateOutputAgainstGuardrails,
} from "./src/utils/theologicalGuardrails";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client with telemetry header
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Fallback spiritual responses in case API key is missing or model fails
const FALLBACK_RESPONSES = {
  spiritual_strength: {
    pastoralCounsel:
      "When spiritual exhaustion sets in, our natural human inclination is to exert more fleshly effort. Yet Scripture reveals that true spiritual renewal never flows from self-sufficiency, but from what the Hebrew prophets called 'Qavah'—an expectant, patient waiting upon Yahweh (Isaiah 40:31). In the New Covenant, this waiting is realized in Christ's command to abide in Him as the true Vine (John 15:5). The branch does not strain to produce fruit through willpower; it simply remains continuously united to the life-giving sap of the Vine. When you bring your weariness before Christ, remember that His grace is perfected not in your unbroken competence, but in your acknowledged weakness (2 Cor 12:9).",
    scriptures: [
      {
        reference: "Isaiah 40:29-31",
        text: "He gives power to the faint, and to him who has no might he increases strength. Even youths shall faint and be weary, and young men shall fall exhausted; but they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.",
        theologicalContext:
          "The Hebrew verb 'qavah' (waiting) implies intertwining one's frail cord with God's unbreakable cord. Renewal is an exchange of human depletion for Divine sustenance.",
      },
      {
        reference: "John 15:4-5",
        text: "Abide in me, and I in you. As the branch cannot bear fruit by itself, unless it abides in the vine, neither can you, unless you abide in me. I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit, for apart from me you can do nothing.",
        theologicalContext:
          "Jesus transfers the Old Testament metaphor of Israel as God's vineyard onto Himself. Christ Himself is the true Israel, and our vital energy is entirely relational, not moralistic.",
      },
    ],
    customPrayer:
      "Heavenly Father, I confess that my spirit is weary and my personal reserves are dry. Forgive me for attempting to walk the spiritual journey by the force of my own resolve. Teach my soul the holy discipline of waiting upon You. Lord Jesus, You are the true Vine, and I am merely a branch. Today, I surrender the burden of self-production. Flood my heart with the sap of Your Holy Spirit. Where I feel faint, exchange my frailty for Your resurrection power, so that I may walk without fainting and rest securely in Your unfailing love. In the holy and mighty Name of Jesus Christ, Amen.",
    breathPrayer: "Inhale: Lord Jesus, You are the Vine... Exhale: In Your rest, my strength is restored.",
  },
  repentance_transformation: {
    pastoralCounsel:
      "Christian repentance (Greek: 'metanoia') is vastly different from worldly remorse or religious self-flagellation. Legalism focuses on external behavior modification and leaves the heart crushed under the weight of condemnation. But the gospel of the New Covenant promises an ontological transformation: the removal of the heart of stone and the gift of a tender heart of flesh (Ezekiel 36:26). When the Holy Spirit convicts, it is never to drive you away in shame, but to draw you into the cleansing stream of Christ's blood where there is now no condemnation (Romans 8:1). True repentance is turning away from the idol of self-justification to gaze upon the beauty of the Crucified and Risen Savior.",
    scriptures: [
      {
        reference: "Ezekiel 36:26-27",
        text: "And I will give you a new heart, and a new spirit I will put within you. And I will remove the heart of stone from your flesh and give you a heart of flesh. And I will put my Spirit within you, and cause you to walk in my statutes and be careful to obey my rules.",
        theologicalContext:
          "The New Covenant internalizes righteousness. Transformation is not external legal restraint, but the sovereign miracle of regeneration by the indwelling Spirit.",
      },
      {
        reference: "Romans 8:1-2",
        text: "There is therefore now no condemnation for those who are in Christ Jesus. For the law of the Spirit of life has set you free in Christ Jesus from the law of sin and death.",
        theologicalContext:
          "The Greek term 'katakrima' (condemnation) has been fully satisfied at the cross. True freedom enables loving obedience rooted in security rather than terror.",
      },
    ],
    customPrayer:
      "Lord God, Searcher of hearts, I lay down all pretense and legalistic striving before Your throne. I confess the ways my heart has grown stubborn, distracted, or cold. Thank You that in Christ, my sins are not merely managed—they are washed clean. Take away any stony hardness in me and grant me a responsive, tender heart of flesh. Holy Spirit, write Your law of love upon the tablets of my inner being. Let Your perfect love cast out all fear of condemnation, and empower me to walk in the radiant freedom of Your grace. Through Jesus Christ our Lord, Amen.",
    breathPrayer: "Inhale: Create in me a clean heart, O God... Exhale: There is no condemnation in Christ Jesus.",
  },
  divinity_of_christ: {
    pastoralCounsel:
      "When our vision of Christ shrinks into a mere moral teacher, our worship wanes and our peace collapses. The Apostle John opens his Gospel with the staggering truth: the Word who took on human dust is the very Word who was in the beginning with God and was God (John 1:1, 14). In Colossians, Paul proclaims that in Jesus dwells all the fullness of deity bodily, and by Him all things were created and are held together (Colossians 1:15-17). Jesus is not merely one path among many; He is the eternal Logos, the radiance of the Father's glory (Hebrews 1:3), and the only bridge across the infinite chasm between fallen humanity and the Holy God. Fix your eyes upon His uncreated majesty.",
    scriptures: [
      {
        reference: "Colossians 1:15-17, 19-20",
        text: "He is the image of the invisible God, the firstborn of all creation. For by him all things were created, in heaven and on earth... all things were created through him and for him. And he is before all things, and in him all things hold together... For in him all the fullness of God was pleased to dwell, and through him to reconcile to himself all things.",
        theologicalContext:
          "Christ is the supreme cosmic King and eternal Creator. His 'firstborn' title reflects sovereign preeminence and inheritance, not creaturely origin.",
      },
      {
        reference: "John 1:1, 14",
        text: "In the beginning was the Word, and the Word was with God, and the Word was God... And the Word became flesh and dwelt among us, and we have seen his glory, glory as of the only Son from the Father, full of grace and truth.",
        theologicalContext:
          "The eternal, uncreated Logos (the divine reason, speech, and eternal Son) assumed real human flesh (kenosis) without relinquishing His divine essence.",
      },
    ],
    customPrayer:
      "Lord Jesus Christ, eternal Logos, Radiant Glory of the Father, and Author of life: I bow in adoration before Your supreme majesty. You who hold the galaxies together with Your sovereign word stepped into our broken world to redeem us. I praise You that You are fully God and fully man—the only Mediator capable of holding humanity in one hand and the Holy God in the other. Quiet my soul in the knowledge that the One who reigns over cosmic eternity is the very One who loves me and gave Himself for me. Be exalted above every circumstance in my life today. Amen.",
    breathPrayer: "Inhale: Lord Jesus, eternal Word and King... Exhale: In You all things hold together.",
  },
};

// Curated daily contemplations rotating by day across the 3 core themes
const ROTATING_DAILY_CONTEMPLATIONS = [
  {
    id: "daily-john-15-5",
    reference: "John 15:5",
    text: "I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit, for apart from me you can do nothing.",
    theme: "spiritual_strength",
    themeLabel: "Spiritual Strength & Abiding",
    reflectionPrompt: "Where have you been striving in self-effort rather than drawing quiet spiritual life from Christ the Vine?",
    christologicalFocus: "Jesus is our organic life source; true strength is relational dependence rather than human willpower.",
  },
  {
    id: "daily-isaiah-40-31",
    reference: "Isaiah 40:31",
    text: "They who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.",
    theme: "spiritual_strength",
    themeLabel: "Spiritual Strength & Qavah",
    reflectionPrompt: "What finite weight can you surrender today in exchange for Yahweh's uncreated endurance?",
    christologicalFocus: "Waiting is intertwining our frailty with God's resurrected power.",
  },
  {
    id: "daily-ezekiel-36-26",
    reference: "Ezekiel 36:26",
    text: "And I will give you a new heart, and a new spirit I will put within you. And I will remove the heart of stone from your flesh and give you a heart of flesh.",
    theme: "repentance_transformation",
    themeLabel: "Repentance & Inner Transformation",
    reflectionPrompt: "What areas of hardness or legalistic cynicism are ready to be melted into a responsive heart of flesh?",
    christologicalFocus: "New Covenant regeneration replaces religious externalism with the living pulse of the Spirit.",
  },
  {
    id: "daily-romans-8-1",
    reference: "Romans 8:1",
    text: "There is therefore now no condemnation for those who are in Christ Jesus. For the law of the Spirit of life has set you free in Christ Jesus from the law of sin and death.",
    theme: "repentance_transformation",
    themeLabel: "Grace Over Condemnation",
    reflectionPrompt: "How can resting in the complete absolution of the Cross silence your lingering inner accusations today?",
    christologicalFocus: "Christ bore every drop of holy wrath so that we might walk in unhindered filial love with the Father.",
  },
  {
    id: "daily-colossians-1-17",
    reference: "Colossians 1:17",
    text: "And he is before all things, and in him all things hold together.",
    theme: "divinity_of_christ",
    themeLabel: "Divinity of Christ & Cosmic Lordship",
    reflectionPrompt: "If the eternal Son holds every galaxy together, how safely can you entrust your current anxieties into His sovereign hands?",
    christologicalFocus: "Jesus is the cosmic Sustainer of reality, holding our fragile lives in unbroken coherence.",
  },
  {
    id: "daily-john-1-14",
    reference: "John 1:14",
    text: "And the Word became flesh and dwelt among us, and we have seen his glory, glory as of the only Son from the Father, full of grace and truth.",
    theme: "divinity_of_christ",
    themeLabel: "The Incarnate Logos",
    reflectionPrompt: "Contemplate the awe of the infinite Creator stooping down into human fragility out of profound love for you.",
    christologicalFocus: "The uncreated Logos made Himself vulnerable to become the absolute Bridge between heaven and earth.",
  },
  {
    id: "daily-psalm-51-10",
    reference: "Psalm 51:10",
    text: "Create in me a clean heart, O God, and renew a right spirit within me.",
    theme: "repentance_transformation",
    themeLabel: "Clean Heart & Metanoia",
    reflectionPrompt: "Ask the Lord to perform a fresh creation (bara) inside your spirit where human reform falls short.",
    christologicalFocus: "Only the Divine Creator can create ex nihilo a pure heart washed by Christ's blood.",
  },
];

// API: Get Daily Contemplation (rotating by date, or fresh AI generation)
app.get("/api/daily-contemplation", async (req, res) => {
  try {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    const selectedIndex = dayOfYear % ROTATING_DAILY_CONTEMPLATIONS.length;
    const baseContemplation = ROTATING_DAILY_CONTEMPLATIONS[selectedIndex];

    // Check if client requested a fresh AI-generated daily verse
    const forceAI = req.query.fresh === "true";
    const ai = getGenAI();

    if (forceAI && ai) {
      try {
        const themeChoices = ["spiritual_strength", "repentance_transformation", "divinity_of_christ"];
        const chosenTheme = themeChoices[Math.floor(Math.random() * themeChoices.length)];

        const prompt = buildDailyContemplationSystemInstruction() + `

Selected theme: ${chosenTheme}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reference: { type: Type.STRING },
                text: { type: Type.STRING },
                theme: { type: Type.STRING },
                themeLabel: { type: Type.STRING },
                reflectionPrompt: { type: Type.STRING },
                christologicalFocus: { type: Type.STRING },
              },
              required: ["reference", "text", "theme", "themeLabel", "reflectionPrompt", "christologicalFocus"],
            },
          },
        });

        if (response.text) {
          const generated = JSON.parse(response.text);
          return res.json({
            id: `ai-daily-${Date.now()}`,
            dateStr: today.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
            ...generated,
            isAIGenerated: true,
          });
        }
      } catch (aiErr) {
        console.warn("AI generation failed for daily contemplation, using curated:", aiErr);
      }
    }

    return res.json({
      ...baseContemplation,
      dateStr: today.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
      isAIGenerated: false,
    });
  } catch (error) {
    console.error("Error in /api/daily-contemplation:", error);
    res.status(500).json({ error: "Failed to retrieve daily contemplation" });
  }
});
app.post("/api/spiritual-guidance", async (req, res) => {
  try {
    const { entryText, theme, emotion } = req.body;

    if (!entryText || typeof entryText !== "string" || entryText.trim().length === 0) {
      return res.status(400).json({ error: "entryText is required" });
    }

    const ai = getGenAI();

    // If Gemini client is not initialized or no key, return deep theological fallback
    if (!ai) {
      const fallbackKey =
        theme === "repentance_transformation"
          ? "repentance_transformation"
          : theme === "divinity_of_christ"
          ? "divinity_of_christ"
          : "spiritual_strength";
      const fallback = FALLBACK_RESPONSES[fallbackKey];
      return res.json({
        ...fallback,
        isAIGenerated: false,
        note: "Biblically formulated theological counsel and prayer.",
      });
    }

    const systemInstruction = buildPastoralSystemInstruction();

    const prompt = `User's Spiritual Journal Entry / Feelings:
"""
${entryText.trim()}
"""

Selected Theological Focus/Theme: ${theme || "General Christian Contemplation"}
Expressed Emotional State: ${emotion || "Contemplative"}

Please generate a thoughtful, compassionate pastoral response with targeted scriptures and custom prayer adhering to the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pastoralCounsel: {
              type: Type.STRING,
              description: "Compassionate, theologically deep pastoral reflection addressing the user's specific feelings.",
            },
            scriptures: {
              type: Type.ARRAY,
              description: "2-3 targeted Scripture passages.",
              items: {
                type: Type.OBJECT,
                properties: {
                  reference: { type: Type.STRING, description: "Book Chapter:Verse" },
                  text: { type: Type.STRING, description: "Full Scripture verse text" },
                  theologicalContext: {
                    type: Type.STRING,
                    description: "Theological exposition connecting this passage to Christ and the user's heart.",
                  },
                },
                required: ["reference", "text", "theologicalContext"],
              },
            },
            customPrayer: {
              type: Type.STRING,
              description: "A customized, anointed prayer for the user to pray out loud or silently.",
            },
            breathPrayer: {
              type: Type.STRING,
              description: "A simple two-part breath prayer formatted as 'Inhale: ... Exhale: ...'",
            },
          },
          required: ["pastoralCounsel", "scriptures", "customPrayer", "breathPrayer"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsed = JSON.parse(responseText);

    // Theological safety gate: fail closed if AI output violates the hard rules.
    const guardrail = validateOutputAgainstGuardrails(JSON.stringify(parsed));
    if (!guardrail.passed) {
      console.warn("AI output failed theological guardrails, using fallback:", guardrail.violations);
      const fallback = FALLBACK_RESPONSES.spiritual_strength;
      return res.json({
        ...fallback,
        isAIGenerated: false,
        note: "Theological guardrail engaged; biblically formulated fallback counsel provided.",
      });
    }

    return res.json({
      ...parsed,
      isAIGenerated: true,
    });
  } catch (error: any) {
    console.error("Error in /api/spiritual-guidance:", error);
    // Gracefully provide theological fallback
    const fallback = FALLBACK_RESPONSES.spiritual_strength;
    return res.json({
      ...fallback,
      isAIGenerated: false,
      note: "Biblically formulated theological counsel provided.",
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Spiritual Devotional Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
