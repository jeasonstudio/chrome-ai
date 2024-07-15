'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '../components/ui/tooltip';
import { Slider } from '../components/ui/slider';
import { UseFormReturn, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import React from 'react';
import { chromeai } from 'chrome-ai';
import { Footer } from '../components/footer';
import { cn } from '../utils';

const formSchema = z.object({
  model: z.enum(['text']),
  temperature: z.number().min(0).max(1),
  topK: z.number().min(1),
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
});

export interface SettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  initialValue?: Partial<z.infer<typeof formSchema>>;
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export const useSettingsForm = (
  initialValue?: Partial<z.infer<typeof formSchema>>
) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: Object.assign(
      {
        model: 'text',
        temperature: 0.8,
        topK: 3,
        role: 'system',
        content: 'You are a helpful assistant.',
      },
      initialValue
    ),
  });
  return form;
};

export const useSettingsModel = (
  form: UseFormReturn<z.infer<typeof formSchema>>
) => {
  const [model, temperature, topK] = form.watch([
    'model',
    'temperature',
    'topK',
  ]);

  const ai = React.useMemo(
    () =>
      chromeai(model, {
        temperature: temperature,
        topK: topK,
      }),
    [model, temperature, topK]
  );
  return ai;
};

export const Settings = React.forwardRef<null, SettingsProps>(
  ({ initialValue, form, ...props }, ref) => {
    React.useImperativeHandle(ref, () => null, []);

    return (
      <div
        x-chunk="dashboard-03-chunk-0"
        {...props}
        className={cn(
          'relative hidden flex-col items-start gap-8 md:flex',
          props.className
        )}
      >
        <Form {...form}>
          <form className="grid w-full items-start gap-6">
            <fieldset className="grid gap-6 rounded-lg border p-4">
              <legend className="-ml-1 px-1 text-sm font-medium">
                Settings
              </legend>

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          id="model"
                          className="items-start [&_[data-description]]:hidden"
                        >
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* <SelectItem value="generic">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <div>
                              Gemini Nano{' '}
                              <span className="font-medium text-foreground">
                                Generic
                              </span>
                            </div>
                          </div>
                        </SelectItem> */}
                        <SelectItem value="text">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <div>
                              Gemini Nano{' '}
                              <span className="font-medium text-foreground">
                                Text
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="grid gap-3">
                            <div className="flex items-center justify-between">
                              <FormLabel>Temperature</FormLabel>
                              <span className="text-right text-sm text-muted-foreground">
                                {field.value}
                              </span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          align="start"
                          className="w-80"
                        >
                          <p className="m-2">
                            The value is passed through to the provider. <br />
                            The range depends on the provider and model. For
                            most providers, 0 means almost deterministic
                            results, and higher values mean more randomness.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <FormControl>
                      <Slider
                        onValueChange={field.onChange}
                        value={[field.value]}
                        id="temperature"
                        className="hover:cursor-pointer"
                        defaultValue={[0.8]}
                        max={1}
                        min={0}
                        step={0.1}
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topK"
                render={({ field }) => (
                  <FormItem>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="grid gap-3">
                            <div className="flex items-center justify-between">
                              <FormLabel>Top K</FormLabel>
                              <span className="text-right text-sm text-muted-foreground">
                                {field.value}
                              </span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          align="start"
                          className="w-80"
                        >
                          <p className="m-2">
                            Only sample from the top K options for each
                            subsequent token. <br />
                            Used to remove &quot;long tail&quot; low probability
                            responses. Recommended for advanced use cases only.
                            You usually only need to use temperature.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <FormControl>
                      <Slider
                        id="topK"
                        className="hover:cursor-pointer"
                        onValueChange={field.onChange}
                        value={[field.value]}
                        defaultValue={[3]}
                        max={20}
                        min={1}
                        step={1}
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
            <fieldset className="grid gap-6 rounded-lg border p-4">
              <legend className="-ml-1 px-1 text-sm font-medium">
                Messages
              </legend>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          id="model"
                          className="items-start [&_[data-description]]:hidden"
                        >
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="You are a..."
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
          </form>
          <Footer />
        </Form>
      </div>
    );
  }
);
Settings.displayName = 'Settings';
