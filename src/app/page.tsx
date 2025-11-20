"use client";

import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  generateVideoScript,
  type ScriptForm,
  type VideoScript,
} from "@/lib/generate-script";

const DEFAULT_FORM: ScriptForm = {
  topic: "How AI Works",
  story:
    "Artificial intelligence is a system that learns patterns from data.\nIt studies thousands of examples to understand how things relate.\nOnce trained, it can recognize images, predict outcomes, or generate text.\nAI improves through repeated learning, adjusting itself each time.\nIn simple terms, AI learns from experience, just like humans do.",
  aspectRatio: "16:9",
  mood: "calm",
  keywords: "AI basics, machine learning, neural networks, technology explained, how AI works",
  language: "en",
};

const ASPECT_OPTIONS = [
  { value: "16:9", label: "16:9 · Landscape" },
  { value: "9:16", label: "9:16 · Vertical" },
  { value: "1:1", label: "1:1 · Square" },
];

const MOOD_OPTIONS = [
  { value: "calm", label: "Calm" },
  { value: "energetic", label: "Energetic" },
  { value: "inspirational", label: "Inspirational" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Mandarin Chinese" },
];

export default function Home() {
  return (
    <Suspense fallback={<PageFallback />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<ScriptForm>(() => loadFormFromParams(searchParams));
  const [script, setScript] = useState<VideoScript>(() =>
    generateVideoScript(loadFormFromParams(searchParams)),
  );
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const serializedParams = useMemo(() => buildSearchParams(form).toString(), [form]);
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}?${serializedParams}` : "";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.history.replaceState(null, "", `?${serializedParams}`);
  }, [serializedParams]);

  const handleChange = useCallback(
    (key: keyof ScriptForm, value: string) => {
      setCopyState("idle");
      setForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setScript(generateVideoScript(form));
    },
    [form],
  );

  const handleCopyShareLink = useCallback(async () => {
    if (!shareUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch (error) {
      console.error("Failed to copy link", error);
    }
  }, [shareUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 lg:px-12">
        <header className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
            Video Script Architect
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Craft scene-ready videos about AI in minutes.
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            Feed the narrative, mood, and format you want. We translate it into a
            production-ready plan complete with voiceover beats, visual direction, and shareable links.
          </p>
        </header>

        <main className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur"
          >
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200" htmlFor="topic">
                Topic
              </label>
              <input
                id="topic"
                value={form.topic}
                onChange={(event) => handleChange("topic", event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
                placeholder="Enter the subject of your video"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200" htmlFor="story">
                Narrative
              </label>
              <textarea
                id="story"
                value={form.story}
                onChange={(event) => handleChange("story", event.target.value)}
                rows={8}
                className="w-full rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm leading-relaxed text-slate-50 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
                placeholder="Describe the story or script you want to visualize"
              />
              <p className="text-xs text-slate-400">
                Break lines where you expect scene changes or new beats.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldSelect
                id="aspectRatio"
                label="Aspect Ratio"
                options={ASPECT_OPTIONS}
                value={form.aspectRatio}
                onChange={(value) => handleChange("aspectRatio", value)}
              />
              <FieldSelect
                id="mood"
                label="Mood"
                options={MOOD_OPTIONS}
                value={form.mood}
                onChange={(value) => handleChange("mood", value)}
              />
              <FieldSelect
                id="language"
                label="Narration Language"
                options={LANGUAGE_OPTIONS}
                value={form.language}
                onChange={(value) => handleChange("language", value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200" htmlFor="keywords">
                Related Keywords
              </label>
              <input
                id="keywords"
                value={form.keywords}
                onChange={(event) => handleChange("keywords", event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
                placeholder="Comma separated keywords"
              />
              <p className="text-xs text-slate-400">
                Use commas to separate keywords. They guide visual direction and overlays.
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-200"
            >
              Generate Storyboard Plan
            </button>

            <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-slate-300">
              <p className="font-semibold text-slate-200">Create once, share anywhere</p>
              <p>Regenerate as you tune the story. Each version keeps a shareable link below.</p>
            </div>
          </form>

          <section className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-50">{script.title}</h2>
                  <p className="text-sm text-slate-300">{script.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  {script.colorPalette.map((swatch) => (
                    <span
                      key={swatch}
                      className="h-8 w-8 rounded-full border border-white/20 shadow-inner shadow-black/30"
                      style={{ background: swatch }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <DetailRow label="Hook" value={script.hook} />
                <DetailRow label="Pacing" value={script.pacing} />
                <DetailRow label="Audio Bed" value={script.audioRecommendation} />
                <DetailRow label="Narration" value={script.narrationStyle} />
                <DetailRow label="Call To Action" value={script.callToAction} />
              </div>

              <div className="flex flex-wrap gap-2">
                {script.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
                <p className="font-semibold text-slate-200">Production Notes</p>
                <ul className="space-y-2 text-slate-300">
                  {script.productionNotes.map((note, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-300" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">{shareUrl}</p>
                  <p className="text-xs text-slate-400">Shareable link updates with each generation.</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="rounded-xl border border-indigo-200/30 bg-indigo-400/90 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-indigo-300/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-200"
                >
                  {copyState === "copied" ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {script.scenes.map((scene) => (
                <article
                  key={scene.id}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30"
                >
                  <div className="absolute inset-0 opacity-[0.09]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent)]" />
                  </div>
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                          {scene.label}
                        </p>
                        <h3 className="text-lg font-semibold text-slate-50">
                          Scene {scene.id.toString().padStart(2, "0")}
                        </h3>
                      </div>
                      <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-medium text-slate-200">
                        {scene.duration}
                      </span>
                    </div>

                    <div className="space-y-2 rounded-xl border border-white/10 bg-black/30 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
                        Voiceover
                      </p>
                      <p className="text-sm leading-relaxed text-slate-200">{scene.voiceover}</p>
                    </div>

                    <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
                        Visual Direction
                      </p>
                      <p>{scene.visuals}</p>
                    </div>

                    <div className="space-y-2 rounded-xl border border-indigo-200/20 bg-indigo-400/10 p-4 text-sm text-slate-100">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
                        On-screen Text
                      </p>
                      <p>{scene.overlay}</p>
                    </div>

                    <div className="space-y-2 rounded-xl border border-white/10 bg-black/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
                        Supporting Assets
                      </p>
                      <ul className="space-y-2 text-sm text-slate-200">
                        {scene.assets.map((asset, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-300" />
                            <span>{asset}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      <div className="space-y-2 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-indigo-300 border-t-transparent" />
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Loading storyboard</p>
      </div>
    </div>
  );
}

function loadFormFromParams(params: ReturnType<typeof useSearchParams>): ScriptForm {
  const base = { ...DEFAULT_FORM };

  if (!params) {
    return base;
  }

  base.topic = params.get("topic") ?? base.topic;
  base.story = params.get("story") ?? base.story;
  base.aspectRatio = params.get("aspect_ratio") ?? params.get("aspectRatio") ?? base.aspectRatio;
  base.mood = params.get("mood") ?? base.mood;
  base.keywords =
    params.get("keywords") ??
    params.get("related_keywords") ??
    base.keywords;
  base.language = params.get("language") ?? base.language;

  return base;
}

function buildSearchParams(form: ScriptForm): URLSearchParams {
  const params = new URLSearchParams();
  params.set("topic", form.topic);
  params.set("story", form.story);
  params.set("aspect_ratio", form.aspectRatio);
  params.set("mood", form.mood);
  params.set("keywords", form.keywords);
  params.set("language", form.language);
  return params;
}

type Option = {
  value: string;
  label: string;
};

function FieldSelect(props: {
  id: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const { id, label, value, options, onChange } = props;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-200" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-slate-900">
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
          ▾
        </span>
      </div>
    </div>
  );
}

function DetailRow(props: { label: string; value: string }) {
  const { label, value } = props;
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-black/20 p-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
        {label}
      </span>
      <span className="text-sm text-slate-200">{value}</span>
    </div>
  );
}
