'use client';

import React from 'react';
import { Layout } from '../components/layout';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { cosineSimilarity, embedMany } from 'ai';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Outputs } from '../components/outputs';
import { chromeai, ChromeAIEmbeddingModel } from 'chrome-ai';

const schema = z.object({
  text1: z.string(),
  text2: z.string(),
});

const EmbeddingPage: React.FC<unknown> = () => {
  const modelRef = React.useRef<ChromeAIEmbeddingModel>();
  React.useEffect(() => {
    modelRef.current = chromeai('embedding');
  }, []);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      text1: 'sunny day at the beach',
      text2: 'rainy afternoon in the city',
    },
  });

  const [cost, setCost] = React.useState<number>(0);
  const [similarity, setSimilarity] = React.useState<number>(0);

  async function onSubmit(data: z.infer<typeof schema>) {
    setSimilarity(0);
    setCost(0);
    const startTime = performance.now();
    const { embeddings } = await embedMany({
      model: modelRef.current!,
      values: [data.text1, data.text2],
    });

    const similarity = cosineSimilarity(embeddings[0], embeddings[1]);
    setSimilarity(similarity);
    setCost(performance.now() - startTime);
  }
  return (
    <Layout>
      <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3 h-screen">
        <Outputs className="w-full">
          <h2 className="mt-4 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors">
            Embedding
          </h2>
          <p className="leading-7 mt-6">
            After embedding values, you can calculate the similarity between
            them using the cosineSimilarity function. This is useful to e.g.
            find similar words or phrases in a dataset. You can also rank and
            filter related items based on their similarity.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-2/3 space-y-6 mt-5"
            >
              <FormField
                control={form.control}
                name="text1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text 1</FormLabel>
                    <FormControl>
                      <Input placeholder="text 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="text2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text 2</FormLabel>
                    <FormControl>
                      <Input placeholder="text 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Get Similarity</Button>
            </form>
          </Form>

          {!!similarity && !!cost ? (
            <div className="mt-6">
              <div className="flex ">
                <div>
                  Similarity: {similarity}{' '}
                  <span className="gray">(cost: {cost}ms)</span>
                </div>
              </div>
            </div>
          ) : null}
        </Outputs>
      </main>
    </Layout>
  );
};
export default EmbeddingPage;
