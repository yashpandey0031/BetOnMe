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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ summary: fallbackSummary(description) });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You generate concise credibility summaries for a public accountability platform. Be balanced, cautious, and non-defamatory.",
          },
          {
            role: "user",
            content: `Profile description: ${description}\n\nGive a 1-2 sentence credibility summary for community staking decisions.`,
          },
        ],
        temperature: 0.4,
        max_tokens: 90,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ summary: fallbackSummary(description) });
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const summary =
      data.choices?.[0]?.message?.content?.trim() ||
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
