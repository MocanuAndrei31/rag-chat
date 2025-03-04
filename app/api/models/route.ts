import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const response = await fetch("http://localhost:11434/api/tags");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const modelNames = data.models?.map((model: any) => model.name) || [];

    return new Response(JSON.stringify({ models: modelNames }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    return new Response(
      JSON.stringify({
        models: [],
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
