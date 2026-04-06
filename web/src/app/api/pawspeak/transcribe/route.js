export async function POST(request) {
  try {
    const body = await request.json();
    const audioUrl =
      typeof body?.audioUrl === "string" ? body.audioUrl.trim() : "";

    if (!audioUrl) {
      return Response.json({ error: "Missing audio file." }, { status: 400 });
    }

    const audioResponse = await fetch(audioUrl);

    if (!audioResponse.ok) {
      throw new Error(
        `Could not download recorded audio: ${audioResponse.status}`,
      );
    }

    const contentType =
      audioResponse.headers.get("content-type") || "audio/m4a";
    const audioBuffer = await audioResponse.arrayBuffer();

    if (audioBuffer.byteLength > 3 * 1024 * 1024) {
      return Response.json(
        { error: "Voice notes must stay under 3MB for transcription." },
        { status: 400 },
      );
    }

    const origin = new URL(request.url).origin;
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: contentType });
    formData.append("file", blob, "pawspeak-recording.m4a");

    const transcriptionResponse = await fetch(
      `${origin}/integrations/transcribe-audio/whisperv3`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!transcriptionResponse.ok) {
      throw new Error(
        `Transcription failed with status ${transcriptionResponse.status}`,
      );
    }

    const transcriptionData = await transcriptionResponse.json();

    return Response.json({ text: transcriptionData?.text || "" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Could not understand that voice note." },
      { status: 500 },
    );
  }
}
