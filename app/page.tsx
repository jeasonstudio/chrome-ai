'use client';

import Image from 'next/image';
import React from 'react';

import { streamText } from 'ai';
import { chromeai } from 'chrome-ai';
import { z } from 'zod';
import { PromptCard } from './components/prompt-card';
import { ChatCard } from './components/chat-card';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Footer } from './components/footer';
import { checkEnv } from './utils';

const model = chromeai();

const HomePage: React.FC<unknown> = () => {
  const [result, setResult] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const onPrompt = async (prompt: string) => {
    try {
      await checkEnv();
      setResult(undefined);
      setError(undefined);
      setLoading(true);
      const startTimestamp = Date.now();
      const { textStream } = await streamText({ model, prompt });
      for await (const textPart of textStream) {
        setResult(textPart);
      }
      setLoading(false);
      const cost = Date.now() - startTimestamp;
      console.log('cost:', cost, 'ms');
      console.log('result:', result);
    } catch (error) {
      setLoading(false);
      setError((error as any).message);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <main className="container mx-auto grid gap-8 grid-cols-1">
        <div className="relative mb-4 flex items-center justify-center py-[26vh] pt-[18vh] sm:pt-[26vh]">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="relative mb-72 h-full w-full min-w-[29rem] max-w-[96rem] sm:mb-0">
              <Image
                alt="background"
                data-nimg="fill"
                width="0"
                height="0"
                className="pointer-events-none absolute inset-0 -z-10 -translate-x-2 select-none sm:translate-x-0 h-full w-full dark:hidden"
                src="https://v0.dev/v0-background.svg"
              />
            </div>
          </div>
          <div className="relative flex w-full flex-col items-center gap-6 px-6">
            <div className="flex w-full flex-col items-center gap-1.5">
              <h2
                className="text-4xl font-semibold tracking-tighter sm:text-5xl [@media(max-width:480px)]:text-[2rem]"
                data-testid="home-h2"
              >
                Chrome AI
              </h2>
              <p>Vercel AI provider for Chrome built-in model (Gemini Nano)</p>
            </div>
            <div className="z-10 m-auto flex w-full flex-col overflow-hidden sm:max-w-xl">
              <PromptCard onPrompt={onPrompt} />
              <div className="pt-4">
                <ChatCard message={result} loading={loading} />
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
