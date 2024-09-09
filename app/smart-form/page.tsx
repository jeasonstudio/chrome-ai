'use client';

// import 'chrome-ai/polyfill';
import { Button } from '../components/ui/button';
import { Layout } from '../components/layout';
import React from 'react';
import { CoreMessage, streamObject } from 'ai';
import {
  Settings,
  useSettingsForm,
  useSettingsModel,
} from '../components/settings';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Outputs } from '../components/outputs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/use-toast';
import { Textarea } from '../components/ui/textarea';
import { Toaster } from '../components/ui/toaster';
import { LoaderCircle, ClipboardPaste } from 'lucide-react';
import { useAIModel, AIModelProvider } from 'use-ai-lib';

const schema = z.object({
  name: z.string({ description: 'Name' }),
  address: z.string({ description: 'Address' }),
  phone: z.string({ description: 'Phone Number' }),
});

const defaultEmailContent = `Dear Administrator,

I hope this message finds you well. My name is Jeason, and I am writing to request an update to my mailing address in your system. My current address is 123 Main Street, Apt 4B, Springfield, IL 62704, USA. You can reach me at my phone number, (555) 123-4567, should you need any further information or verification.

Please let me know once the update has been completed. Thank you for your assistance and cooperation.

Best regards,
Jeason`;

const SmartForm: React.FC<unknown> = () => {
  const [emailContent, setEmailContent] = React.useState(defaultEmailContent);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
    },
  });

  function onSubmit(data: z.infer<typeof schema>) {
    toast({
      title: 'Congratulations, you have successfully submitted these values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4 break-all">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  const settingsForm = useSettingsForm({
    temperature: 0,
    topK: 3,
    content: '',
  });
  const model = useSettingsModel(settingsForm);

  const [messages, setMessages] = React.useState<CoreMessage[]>([]); 

  const { isGenerating } = useAIModel(model, {
    schema,
    messages,
    stream: true,
    onSuccess: (chunk) => {
      console.log(chunk);
      form.reset(chunk);
    }
  });

  const onGenerate = async () => {
    const content = await navigator.clipboard.readText();

    if (!content) {
      toast({
        title: 'No content found',
        description: 'Please copy some content to your clipboard first.',
      });
      return;
    }
    const userMessage: CoreMessage = {
      role: 'user',
      content: `Extract useful information from the content of this email and generate an object based on the JSON schema:\n${content}`,
    };
    const [role, roleContent] = settingsForm.getValues(['role', 'content']);
    const systemMessage: CoreMessage = { role, content: roleContent };

    const messages = [systemMessage, userMessage];

    setMessages(messages);
  };

  return (
    <Layout>
      <Toaster />
      <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3 h-screen">
        <Settings form={settingsForm} />
        <Outputs>
          <h2 className="mt-4 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors">
            Smart Form
          </h2>
          <p className="leading-7 mt-6">
            Smart Form is an intelligent feature that fills out forms
            automatically using data from the user&apos;s clipboard. Here is an
            example for shadcn/ui.
          </p>

          <p className="leading-7 mt-6">
            For example, I&apos;m submitting incoming mail to a database and I
            need your name, address, and phone number. You can directly copy the
            email content, then click the `Paste with AI` button, and the form
            will automatically fill out.
          </p>

          <Textarea
            className="mt-6 h-[240px]"
            value={emailContent}
            onChange={(event) => setEmailContent(event.target.value)}
          />
          <Form {...form}>
            <form className="grid w-full items-start gap-6 mt-6">
              <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                  Form Example
                </legend>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="name, e.g. John Doe" {...field} />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="address" {...field} />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="your phone number" {...field} />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => onSubmit(form.getValues())}
                    className="grow"
                  >
                    Submit
                  </Button>

                  {isGenerating ? (
                    <Button
                      className="ml-auto"
                      disabled={isGenerating}
                      type="button"
                    >
                      <LoaderCircle className="animate-spin size-3.5 mr-1" />{' '}
                      Generating...
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="ml-auto"
                      onClick={onGenerate}
                      disabled={isGenerating}
                    >
                      <ClipboardPaste className="size-3.5 mr-1" /> Paste with AI
                    </Button>
                  )}
                </div>
              </fieldset>
            </form>
          </Form>
        </Outputs>
      </main>
    </Layout>
  );
};

const SmartFormPage = () => {
  return <AIModelProvider>
    <SmartForm />
  </AIModelProvider>
}

export default SmartFormPage;
