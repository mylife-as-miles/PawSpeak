import { upload } from "@/app/api/utils/upload";

function buildFallbackUrl(requestUrl, text) {
  const origin = new URL(requestUrl).origin;
  const params = new URLSearchParams({ text });
  return `${origin}/integrations/text-to-speech/speech?${params.toString()}`;
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!text) {
    return Response.json({ error: "Missing text for audio." }, { status: 400 });
  }

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";

    if (!apiKey) {
      return Response.json({
        audioUrl: buildFallbackUrl(request.url, text),
        provider: "fallback",
      });
    }

    const voiceResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.8,
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!voiceResponse.ok) {
      const errorText = await voiceResponse.text();
      throw new Error(
        `ElevenLabs failed: ${voiceResponse.status} ${errorText}`,
      );
    }

    const audioBuffer = await voiceResponse.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const uploadResult = await upload({
      base64: `data:audio/mpeg;base64,${base64Audio}`,
    });

    if (uploadResult?.error || !uploadResult?.url) {
      throw new Error(uploadResult?.error || "Could not store generated audio");
    }

    return Response.json({
      audioUrl: uploadResult.url,
      provider: "elevenlabs",
    });
  } catch (error) {
    console.error(error);

    return Response.json({
      audioUrl: buildFallbackUrl(request.url, text),
      provider: "fallback",
    });
  }
}
