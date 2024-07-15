'use client';

// require('chrome-ai/polyfill');
import {
  CornerDownLeft,
  Command,
  Eraser,
  Chrome,
  Triangle,
  LoaderCircle,
} from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from './components/ui/tooltip';
import { Layout } from './components/layout';
import { marked } from 'marked';
import React from 'react';
import { CoreMessage, streamText } from 'ai';
import { Skeleton } from './components/ui/skeleton';
import {
  Settings,
  useSettingsForm,
  useSettingsModel,
} from './components/settings';
import { Outputs } from './components/outputs';

const HomePage: React.FC<unknown> = () => {
  const form = useSettingsForm({
    temperature: 0.8,
    topK: 3,
    content: 'You are a helpful assistant.',
  });
  const model = useSettingsModel(form);

  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string>('');
  const [messages, setMessages] = React.useState<CoreMessage[]>([]);

  const onSendMessage = async () => {
    const userMessage: CoreMessage = { role: 'user', content: message };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setMessage('');

    const [role, roleContent] = form.getValues(['role', 'content']);
    const promptMessage: CoreMessage = { role, content: roleContent };

    try {
      setLoading(true);
      const startTimestamp = Date.now();
      const { textStream } = await streamText({
        model,
        messages: [promptMessage, ...newMessages],
      });
      let resultMessage = '';
      setMessages([
        ...newMessages,
        { role: 'assistant', content: resultMessage },
      ]);
      for await (const textPart of textStream) {
        resultMessage += textPart;
        setMessages([
          ...newMessages,
          { role: 'assistant', content: resultMessage },
        ]);
      }
      setLoading(false);
      const cost = Date.now() - startTimestamp;
      console.log('cost:', cost, 'ms');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3 h-screen">
        <Settings form={form} />
        <Outputs>
          <Badge variant="outline" className="absolute right-3 top-3">
            Outputs
          </Badge>
          <div className="flex-1 mt-3 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                className="w-full flex flex-row gap-2 p-2 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 rounded"
                key={JSON.stringify(msg) + index}
              >
                <div className="flex-grow-0 text-muted-foreground">
                  {msg.role === 'user' ? (
                    <Triangle className="size-5 m-1" />
                  ) : (
                    <Chrome className="size-5 m-1" />
                  )}
                </div>

                {!msg.content && loading && index === messages.length - 1 ? (
                  <Skeleton className="h-5 mt-1 mb-1 w-60" />
                ) : (
                  <article
                    className="prose prose-zinc prose-base flex-grow dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(msg.content as string),
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <form
            className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
            x-chunk="dashboard-03-chunk-1"
          >
            <Label htmlFor="message" className="sr-only">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type your message here..."
              className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  onSendMessage();
                }
              }}
            />
            <div className="flex items-end p-3 pt-0">
              {/* <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Paperclip className="size-4" />
                      <span className="sr-only">Attach file</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Attach File</TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
              {/* <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Mic className="size-4" />
                      <span className="sr-only">Use Microphone</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Use Microphone</TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
              {loading ? (
                <Button size="sm" className="ml-auto" disabled={loading}>
                  <LoaderCircle className="animate-spin size-3.5 mr-1" />{' '}
                  Generating...
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  className="ml-auto"
                  onClick={onSendMessage}
                  disabled={loading}
                >
                  Send Message (<Command className="size-3.5" />+
                  <CornerDownLeft className="size-3.5" />)
                </Button>
              )}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      disabled={loading}
                    >
                      <Eraser className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    align="end"
                    onClick={() => {
                      setMessages([]);
                    }}
                  >
                    Clear chat history
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </form>
        </Outputs>
      </main>
    </Layout>
  );
};

export default HomePage;
