import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  };

  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt");
  const model = searchParams.get("model") || "mistral";
  const temperature = parseFloat(searchParams.get("temperature") || "0.7");

  if (!prompt) {
    return new Response(
      `data: ${JSON.stringify({ error: "Prompt is required" })}\n\n`,
      { status: 400, headers }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const ollamaResponse = await fetch(
          "http://localhost:11434/api/generate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model,
              prompt,
              stream: true,
              temperature,
            }),
          }
        );

        if (!ollamaResponse.body) throw new Error("No response body");

        const reader = ollamaResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(`data: ${JSON.stringify({ done: true })}\n\n`);
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          while (buffer.includes("\n")) {
            const index = buffer.indexOf("\n");
            const jsonLine = buffer.slice(0, index).trim();
            buffer = buffer.slice(index + 1);

            if (jsonLine) {
              try {
                const parsedChunk = JSON.parse(jsonLine);
                controller.enqueue(
                  `data: ${JSON.stringify({ text: parsedChunk.response })}\n\n`
                );
              } catch (error) {
                console.error("Error parsing chunk:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Stream error:", error);
        controller.enqueue(
          `data: ${JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          })}\n\n`
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers });
}
