const moods = ["Loving", "Playful", "Angry", "Sad", "Hungry", "Chaotic"];

function stripCodeFence(value) {
  if (!value) {
    return "";
  }

  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function detectMood(text) {
  const normalizedText = text.toLowerCase();

  if (/(feed|food|treat|hungry|snack|dinner|breakfast)/.test(normalizedText)) {
    return "Hungry";
  }

  if (/(miss|love|cuddle|hug|kiss|adore|stay with me)/.test(normalizedText)) {
    return "Loving";
  }

  if (/(ignore|mad|angry|rude|annoy|hate|upset)/.test(normalizedText)) {
    return "Angry";
  }

  if (/(sad|lonely|cry|down|blue|leave)/.test(normalizedText)) {
    return "Sad";
  }

  if (/(party|zoom|chaos|crazy|wild|let me in and out)/.test(normalizedText)) {
    return "Chaotic";
  }

  return "Playful";
}

function buildFallback(text) {
  const mood = detectMood(text);
  const map = {
    Loving: {
      phrase: "mrrrp… prrr… mew",
      line: "The cat version is clingy in a cool way: affection first, dignity later.",
      emoji: "🤍",
    },
    Playful: {
      phrase: "brrt! mrrrow? prrp!",
      line: "Translation: playful nonsense, delivered with suspicious confidence.",
      emoji: "✨",
    },
    Angry: {
      phrase: "hrrr. tsk. mEOW.",
      line: "Translation: the whiskers are judging, and the case against you is strong.",
      emoji: "😾",
    },
    Sad: {
      phrase: "mew… mrr…",
      line: "Translation: dramatic tiny heartbreak with soft paws and perfect timing.",
      emoji: "☁️",
    },
    Hungry: {
      phrase: "mraow. mraow. now.",
      line: "Translation: this is not a request. This is a menu review in progress.",
      emoji: "🍣",
    },
    Chaotic: {
      phrase: "prrt?! brrmrow! sksk—mew!",
      line: "Translation: absolutely no plan, but the energy is unforgettable.",
      emoji: "🌀",
    },
  };

  const chosen = map[mood];

  return {
    mood,
    emoji: chosen.emoji,
    catPhrase: chosen.phrase,
    interpretation: chosen.line,
    disclaimer: "Not a scientific cat translator. Just elite feline vibes.",
  };
}

function buildPrompt(text) {
  return [
    "You are PawSpeak, a playful premium cat-expression generator for a hackathon demo.",
    "Analyze the human message and produce the full app result in one pass.",
    `Use exactly one mood from this list: ${moods.join(", ")}.`,
    "Return valid JSON only. Do not use markdown fences.",
    "The JSON object must include these keys: mood, emoji, catPhrase, interpretation, disclaimer.",
    "Rules:",
    '- catPhrase should be a short cat-style sound string like \"mrrp… prrrt… mew\"',
    "- interpretation should be one funny sentence under 120 characters",
    "- disclaimer should clearly say this is not scientific",
    "- keep it charming, polished, and instantly understandable",
    "- emoji should fit the chosen mood",
    `Human message: ${text}`,
  ].join("\n");
}

async function generateWithGemini(text) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const geminiResponse = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        generationConfig: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              mood: { type: "STRING", enum: moods },
              emoji: { type: "STRING" },
              catPhrase: { type: "STRING" },
              interpretation: { type: "STRING" },
              disclaimer: { type: "STRING" },
            },
            required: [
              "mood",
              "emoji",
              "catPhrase",
              "interpretation",
              "disclaimer",
            ],
          },
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: buildPrompt(text),
              },
            ],
          },
        ],
      }),
    },
  );

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text();
    throw new Error(`Gemini failed: ${geminiResponse.status} ${errorText}`);
  }

  const geminiData = await geminiResponse.json();
  const content = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("Gemini returned an empty response");
  }

  return JSON.parse(stripCodeFence(content));
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!text) {
    return Response.json(
      { error: "Please add a message first." },
      { status: 400 },
    );
  }

  try {
    const parsed = await generateWithGemini(text);
    const fallback = buildFallback(text);

    return Response.json({
      result: {
        mood: moods.includes(parsed?.mood) ? parsed.mood : fallback.mood,
        emoji:
          typeof parsed?.emoji === "string" ? parsed.emoji : fallback.emoji,
        catPhrase:
          typeof parsed?.catPhrase === "string"
            ? parsed.catPhrase
            : fallback.catPhrase,
        interpretation:
          typeof parsed?.interpretation === "string"
            ? parsed.interpretation
            : fallback.interpretation,
        disclaimer:
          typeof parsed?.disclaimer === "string"
            ? parsed.disclaimer
            : fallback.disclaimer,
      },
      provider: "gemini",
    });
  } catch (error) {
    console.error(error);

    return Response.json({
      result: buildFallback(text),
      fallback: true,
    });
  }
}
