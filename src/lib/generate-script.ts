export interface ScriptForm {
  topic: string;
  story: string;
  aspectRatio: string;
  mood: string;
  keywords: string;
  language: string;
}

export interface ScenePlan {
  id: number;
  label: string;
  voiceover: string;
  duration: string;
  visuals: string;
  overlay: string;
  assets: string[];
}

export interface VideoScript {
  title: string;
  subtitle: string;
  hook: string;
  callToAction: string;
  aspectRatio: string;
  mood: string;
  language: string;
  pacing: string;
  audioRecommendation: string;
  colorPalette: string[];
  keywords: string[];
  narrationStyle: string;
  scenes: ScenePlan[];
  productionNotes: string[];
}

type MoodProfile = {
  pacing: string;
  audio: string;
  colorPalette: string[];
  motion: string;
  lighting: string;
  voiceTone: string;
  hookVerb: string;
};

type AspectConcept = {
  framing: string;
  safeZone: string;
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  it: "Italian",
  ja: "Japanese",
  zh: "Mandarin Chinese",
};

const MOOD_PROFILES: Record<string, MoodProfile> = {
  calm: {
    pacing: "even, thoughtful cadence",
    audio: "Soft ambient piano bed with airy pads",
    colorPalette: ["#E6F0FF", "#C9DBF4", "#F4F6FB"],
    motion: "gentle parallax moves and slow dolly pushes",
    lighting: "diffused light with cool highlights",
    voiceTone: "warm, reassuring narration",
    hookVerb: "Invite",
  },
  energetic: {
    pacing: "snappy with dynamic emphasis",
    audio: "Driving electronic beat with rhythmic pulses",
    colorPalette: ["#FFE6AA", "#FF8A65", "#3D5AFE"],
    motion: "bold camera sweeps and quick punch-ins",
    lighting: "high contrast with saturated accents",
    voiceTone: "confident and enthusiastic",
    hookVerb: "Energize",
  },
  inspirational: {
    pacing: "uplifting, gradually building momentum",
    audio: "Cinematic orchestra with light percussion",
    colorPalette: ["#FFF3E0", "#F8BBD0", "#B39DDB"],
    motion: "slow reveals with lens flare accents",
    lighting: "warm backlighting with soft bloom",
    voiceTone: "aspirational and optimistic",
    hookVerb: "Inspire",
  },
};

const DEFAULT_MOOD_PROFILE = MOOD_PROFILES.calm;

const ASPECT_GUIDANCE: Record<string, AspectConcept> = {
  "16:9": {
    framing:
      "Landscape compositions with breathable negative space for lower-third overlays.",
    safeZone:
      "Keep essential graphics inside the central 80% to protect against cropping on social platforms.",
  },
  "9:16": {
    framing:
      "Vertical storytelling with stacked layers and motion from bottom to top.",
    safeZone:
      "Constrain text to the middle 60% to avoid UI overlays on short-form platforms.",
  },
  "1:1": {
    framing: "Centered compositions with symmetrical graphic arrangements.",
    safeZone:
      "Use a circular safe zone to keep faces and titles from getting clipped.",
  },
};

const DEFAULT_ASPECT_GUIDANCE = ASPECT_GUIDANCE["16:9"];

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "with",
  "what",
  "why",
  "when",
  "does",
  "do",
  "can",
  "like",
  "just",
]);

export function generateVideoScript(form: ScriptForm): VideoScript {
  const trimmedStory = form.story.replace(/\r/g, "").trim();
  const storyBeats = parseStoryBeats(trimmedStory);
  const keywords = deriveKeywords(form.topic, trimmedStory, form.keywords);
  const moodProfile = MOOD_PROFILES[form.mood] ?? DEFAULT_MOOD_PROFILE;
  const aspectProfile = ASPECT_GUIDANCE[form.aspectRatio] ?? DEFAULT_ASPECT_GUIDANCE;
  const languageLabel = LANGUAGE_LABELS[form.language] ?? "English";

  const scenes = storyBeats.map((voiceover, index) => {
    const primaryKeyword = selectKeywordForScene(voiceover, keywords, index);
    const overlay = createOverlay(voiceover, primaryKeyword);
    const visuals = createVisualDirection(voiceover, primaryKeyword, moodProfile, aspectProfile);
    const assets = createSupportingAssets(voiceover, primaryKeyword);
    const duration = formatDuration(estimateDurationSeconds(voiceover));

    return {
      id: index + 1,
      label: buildSceneLabel(index, storyBeats.length, voiceover),
      voiceover,
      duration,
      visuals,
      overlay,
      assets,
    };
  });

  const hookVerb = moodProfile.hookVerb;
  const openingScene = scenes[0];
  const closingScene = scenes[scenes.length - 1];

  return {
    title: `${form.topic} — ${capitalize(moodProfile.voiceTone)}`,
    subtitle: `A ${languageLabel.toLowerCase()} explainer crafted for a ${form.aspectRatio} frame.`,
    hook: `${hookVerb} viewers with: "${openingScene.voiceover}"`,
    callToAction: `Close by reinforcing "${closingScene.voiceover}" and invite viewers to explore how they can apply AI in everyday workflows.`,
    aspectRatio: form.aspectRatio,
    mood: form.mood,
    language: languageLabel,
    pacing: moodProfile.pacing,
    audioRecommendation: moodProfile.audio,
    colorPalette: moodProfile.colorPalette,
    keywords,
    narrationStyle: `${capitalize(moodProfile.voiceTone)} delivered in ${languageLabel}, with natural pauses that land every ${Math.round(
      averageWordsPerBeat(storyBeats),
    )} words.`,
    scenes,
    productionNotes: [
      aspectProfile.safeZone,
      `Underscore narration with ${moodProfile.audio.toLowerCase()} mixed at -18 LUFS for clarity.`,
      `Animate key phrases like ${keywords.slice(0, 3).map(capitalize).join(", ")} using ${moodProfile.motion}.`,
    ],
  };
}

function parseStoryBeats(story: string): string[] {
  const lines = story
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [
      "Artificial intelligence studies patterns in data to learn how the world works.",
      "By watching thousands of examples, it recognizes relationships and makes predictions.",
      "With every iteration, the system fine-tunes itself, improving just like human learning.",
    ];
  }

  return lines.flatMap((paragraph) =>
    paragraph
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map((sentence) => sentence.trim())
      .filter(Boolean),
  );
}

function deriveKeywords(topic: string, story: string, rawKeywords: string): string[] {
  const providedKeywords = rawKeywords
    .split(/[,;\n]+/)
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .map((keyword) => keyword.toLowerCase());

  const fallbackKeywords = extractKeywordsFromStory(`${topic}. ${story}`);

  return Array.from(new Set([...providedKeywords, ...fallbackKeywords])).map((keyword) =>
    keyword.replace(/\b(ai)\b/gi, "AI"),
  );
}

function extractKeywordsFromStory(story: string): string[] {
  const counts = new Map<string, number>();

  story
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .forEach((word) => {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

function selectKeywordForScene(
  voiceover: string,
  keywords: string[],
  index: number,
): string {
  const lowerVoiceover = voiceover.toLowerCase();
  const directMatch = keywords.find((keyword) => lowerVoiceover.includes(keyword.toLowerCase()));

  if (directMatch) {
    return directMatch;
  }

  return keywords[index % keywords.length] ?? keywords[0] ?? "insight";
}

function createOverlay(voiceover: string, keyword: string): string {
  const condensed = voiceover
    .replace(/AI/gi, "AI")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 6)
    .join(" ");

  return condensed
    ? `${capitalize(condensed)}`
    : `Key idea: ${capitalize(keyword)}`;
}

function createVisualDirection(
  voiceover: string,
  keyword: string,
  moodProfile: MoodProfile,
  aspectProfile: AspectConcept,
): string {
  const lower = voiceover.toLowerCase();

  if (lower.includes("data") || lower.includes("patterns")) {
    return `Visualize flowing data points morphing into a neural network mesh; ${moodProfile.motion} with ${moodProfile.lighting}.`;
  }

  if (lower.includes("predict") || lower.includes("outcomes")) {
    return `Show predictive dashboards coming to life with confident highlights; ${aspectProfile.framing}`;
  }

  if (lower.includes("learn") || lower.includes("training")) {
    return `Illustrate an AI training loop with layered animations that progressively refine, paired with ${moodProfile.motion}.`;
  }

  if (lower.includes("experience") || lower.includes("humans")) {
    return `Contrast human learning and machine learning through mirrored compositions, gently lit to stay ${moodProfile.lighting}.`;
  }

  return `Create calm, abstract imagery around ${keyword}, using ${moodProfile.colorPalette[0]} and ${moodProfile.colorPalette[1]} accents.`;
}

function createSupportingAssets(voiceover: string, keyword: string): string[] {
  const assets: string[] = [];
  const lower = voiceover.toLowerCase();

  if (lower.includes("data")) {
    assets.push("Overlay graph that pulses in sync with narration.");
  }

  if (lower.includes("predict")) {
    assets.push("HUD-style animation showing probability bars filling up.");
  }

  if (lower.includes("adjust") || lower.includes("improves")) {
    assets.push("Progress bar that subtly advances with each beat.");
  }

  assets.push(`B-roll: contextual visuals highlighting ${keyword}.`);

  return assets;
}

function estimateDurationSeconds(text: string): number {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const estimated = Math.round(wordCount / 2.7);
  return clamp(estimated, 4, 9);
}

function averageWordsPerBeat(beats: string[]): number {
  const totalWords = beats.reduce(
    (sum, beat) => sum + beat.split(/\s+/).filter(Boolean).length,
    0,
  );
  return beats.length ? totalWords / beats.length : 0;
}

function formatDuration(seconds: number): string {
  return `${seconds}s`;
}

function buildSceneLabel(index: number, total: number, voiceover: string): string {
  if (index === 0) {
    return "Opening Hook";
  }

  if (index === total - 1) {
    return "Closing Insight";
  }

  if (voiceover.toLowerCase().includes("learns") || voiceover.toLowerCase().includes("learning")) {
    return "Learning Beat";
  }

  if (
    voiceover.toLowerCase().includes("predict") ||
    voiceover.toLowerCase().includes("recognize")
  ) {
    return "Application Beat";
  }

  return `Beat ${index + 1}`;
}

function capitalize(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
