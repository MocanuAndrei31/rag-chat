"use client";
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";

export default function Home() {
  const [prompt, setPrompt] = useState<string>();
  const [output, setOutput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [models, setModels] = useState<Array<{ id: ""; name: "" }>>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [temperature, setTemperature] = useState<number>(0.7);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch("/api/models");

        const data = await response.json();
        if (data.models && data.models.length > 0) {
          const formattedModels = data.models.map(
            (model: { id: string; name: string }) => ({
              id: model,
              name: model,
            })
          );
          setModels(formattedModels);
          setSelectedModel(formattedModels[0]?.name || "");
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    }

    fetchModels();

    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const handleGenerate = async () => {
    setPrompt("");
    setOutput("");
    setIsGenerating(true);

    eventSourceRef.current?.close();

    try {
      const generateResponse = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          temperature: parseFloat(temperature.toString()),
        }),
      });

      if (!generateResponse.ok) {
        throw new Error(`HTTP error! status: ${generateResponse.status}`);
      }

      const query = new URLSearchParams({
        prompt: prompt || "",
        model: selectedModel,
        temperature: temperature.toString(),
        t: Date.now().toString(),
      }).toString();
      const eventSource = new EventSource(`/api/generate/stream?${query}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            setOutput((prev) => prev + `\nError: ${data.error}`);
            eventSource.close();
            setIsGenerating(false);
            return;
          }

          if (data.done) {
            eventSource.close();
            setIsGenerating(false);
            return;
          }

          if (data.text) {
            setOutput((prev) => prev + data.text);
          }
        } catch (parseError) {
          console.error("Error parsing SSE data:", parseError);
          eventSource.close();
          setIsGenerating(false);
          setOutput((prev) => prev + "\n\nError parsing response.");
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        eventSource.close();
        setIsGenerating(false);
        setOutput((prev) => prev + "\n\nConnection error. Please try again.");
      };
    } catch (error) {
      console.error("Generation error:", error);
      setOutput(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <Head>
        <title>AI Chat Assistant</title>
        <meta
          name="description"
          content="Local AI chat assistant powered by Ollama"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto max-w-4xl px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-blue-600">🤖</span> AI Chat Assistant
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label
                htmlFor="model"
                className="block text-sm font-semibold text-gray-700"
              >
                Model
              </label>
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isGenerating}
                className="h-[40px] px-2 text-black w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 
                         focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="temperature"
                className="block text-sm font-semibold text-gray-700"
              >
                Temperature
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (0.1 - 2.0)
                </span>
              </label>
              <input
                type="number"
                id="temperature"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                min="0.1"
                max="2.0"
                step="0.1"
                disabled={isGenerating}
                className="px-2 h-[40px] text-black w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 
                         focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <label
              htmlFor="prompt"
              className="block text-sm font-semibold text-gray-700"
            >
              Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={isGenerating}
              className="text-black p-2 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 
                       focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 
                       resize-none transition-all duration-200"
              placeholder="Enter your prompt here..."
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt?.trim()}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg
                     font-medium transition-all duration-200 hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center 
                     justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate
              </>
            )}
          </button>

          <div className="mt-8 space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Output
            </h2>
            <div
              className="bg-gray-50 rounded-lg border border-gray-200 p-4 font-mono text-sm
                          text-gray-800 shadow-inner min-h-[200px] whitespace-pre-wrap relative
                          overflow-auto transition-all duration-200"
            >
              {output || (
                <span className="text-gray-400 absolute inset-0 p-4">
                  Generated text will appear here...
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
