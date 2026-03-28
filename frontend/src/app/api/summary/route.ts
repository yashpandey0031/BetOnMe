import { NextResponse } from "next/server";

type RequestBody = {
  description?: string;
};

function fallbackSummary(description: string) {
  const normalized = description.toLowerCase();

  if (
    normalized.includes("verified") ||
    normalized.includes("investigation") ||
    normalized.includes("audit")
  ) {
    return "Signals suggest stronger credibility, but claims still need continuous public verification over time.";
  }

  if (
    normalized.includes("controversy") ||
    normalized.includes("accused") ||
    normalized.includes("misleading")
  ) {
    return "Signals indicate elevated credibility risk. Community evidence and transparent rebuttals should be weighed carefully.";
  }

  return "Initial signal is neutral. Credibility should be evaluated through transparent evidence and ongoing community staking.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const description = body.description?.trim() || "";

    if (!description) {
      return NextResponse.json(
        { summary: "Please provide a profile description first." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ summary: fallbackSummary(description) });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "You generate concise credibility summaries for a public accountability platform. Be balanced, cautious, and non-defamatory.",
              },
            ],
          },
          contents: [
            {
              parts: [
                {
                  text: `Profile description: ${description}\n\nGive a 1-2 sentence credibility summary for community staking decisions.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 90,
          },
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json({ summary: fallbackSummary(description) });
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    const summary =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      fallbackSummary(description);
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json(
      {
        summary:
          "Could not generate summary. Please add a short manual credibility note.",
      },
      { status: 500 },
    );
  }
}
