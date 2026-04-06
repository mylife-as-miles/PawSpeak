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

function detectReplyIntent(text) {
  const normalizedText = text.toLowerCase();

  if (/(feed|food|treat|hungry|snack|dinner|breakfast|eat)/.test(normalizedText)) {
    return "food";
  }

  if (/(love|miss|cuddle|hug|kiss|pet|snuggle|good cat|cute cat)/.test(normalizedText)) {
    return "affection";
  }

  if (/(play|toy|laser|chase|zoom|catch)/.test(normalizedText)) {
    return "play";
  }

  if (/(sorry|apolog|forgive)/.test(normalizedText)) {
    return "apology";
  }

  if (/(leave|bye|goodbye|going out|see you later|be back)/.test(normalizedText)) {
    return "departure";
  }

  if (/(bad cat|no|stop|don't|dont|quit|why did you)/.test(normalizedText)) {
    return "scolding";
  }

  if (/(open|door|window|outside|inside|let me in|let me out)/.test(normalizedText)) {
    return "door";
  }

  if (/\?/.test(normalizedText)) {
    return "question";
  }

  return "general";
}

function buildFallback(text) {
  const mood = detectMood(text);
  const intent = detectReplyIntent(text);
  const map = {
    food: {
      phrase: "Mraow? Prrt-prrt? Mew?",
      line: "Direct cat translation: asking about food with extremely serious bowl energy.",
    },
    affection: {
      phrase: "Prrr... mrrrp... mew.",
      line: "Direct cat translation: affectionate and soft, with just enough dignity.",
    },
    play: {
      phrase: "Brrt? Prrp-prrp! Mrrrow?",
      line: "Direct cat translation: playful excitement with very obvious zoomie potential.",
    },
    apology: {
      phrase: "Mew... prrt... mrrp.",
      line: "Direct cat translation: a hesitant apology with hopeful little-paw energy.",
    },
    departure: {
      phrase: "Mew... mrrrow... mew.",
      line: "Direct cat translation: sad farewell drama, performed with commitment.",
    },
    scolding: {
      phrase: "Hrrm! Mrow. Tsk-tsk.",
      line: "Direct cat translation: sharp judgment, very pointed whisker punctuation.",
    },
    door: {
      phrase: "Mrrrow? Prrt! Mraow?",
      line: "Direct cat translation: urgent door politics with immediate emotional stakes.",
    },
    question: {
      phrase: "Mrr? Prrt? Mew-mew?",
      line: "Direct cat translation: clearly a question, delivered with feline confidence.",
    },
    general: {
      phrase: "Mrrp... mrow... prrt.",
      line: "Direct cat translation: the same message, now rendered in polished feline drama.",
    },
  };

  const moodEmojis = {
    Loving: "🤍",
    Playful: "✨",
    Angry: "😾",
    Sad: "☁️",
    Hungry: "🍣",
    Chaotic: "🌀",
  };
  const chosen = map[intent] || map.general;

  return {
    mood,
    emoji: moodEmojis[mood] || "🐾",
    catPhrase: chosen.phrase,
    interpretation: chosen.line,
    disclaimer: "Not a scientific cat translator. Just elite feline vibes.",
  };
}

function buildPrompt(text) {
  return [
    "You are PawSpeak, a premium cat-language translator.",
    "The human message is being spoken to a cat.",
    "Translate the human message directly into cat language.",
    "Preserve the original meaning, tone, sentence type, and emotional intent.",
    "Do not answer the human message. Do not invent the cat's reply.",
    "Treat this like translating English to another language, except the target language is cat.",
    "Analyze the human message and produce the full app result in one pass.",
    `Use exactly one mood from this list: ${moods.join(", ")}.`,
    "Return valid JSON only. Do not use markdown fences.",
    "The JSON object must include these keys: mood, emoji, catPhrase, interpretation, disclaimer.",
    "Rules:",
    '- catPhrase must be the translated version of the human message in cat sounds only, like "mrrp... prrrt... mew."',
    "- catPhrase should preserve whether the original is a question, statement, greeting, apology, complaint, or affection",
    "- keep the same general sentence energy and punctuation style when possible",
    "- do not include English words inside catPhrase",
    "- interpretation should explain the translation in plain English in one funny sentence under 120 characters",
    "- disclaimer should clearly say this is not scientific",
    "- keep it charming, polished, and instantly understandable",
    "- emoji should fit the chosen mood",
    "Examples:",
    'Human: "Do you want breakfast?" -> catPhrase should feel like a cat-language version of that exact question.',
    'Human: "I missed you all day." -> catPhrase should feel like a cat-language version of that affectionate statement.',
    'Human: "Why did you knock that over?" -> catPhrase should feel like a cat-language version of that complaint/question.',
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
