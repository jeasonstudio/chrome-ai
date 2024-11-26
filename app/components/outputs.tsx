'use client';

import React from 'react';
import { cn } from '../utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ChromeAIAssistantCapabilities } from '@/src/global';

export interface OutputsProps extends React.HTMLAttributes<HTMLDivElement> { }

export const Outputs = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<OutputsProps>
>(({ children, ...props }, ref) => {
  let infoElement = null;

  const [isEnabledFlags, setIsEnabledFlags] = React.useState(true);

  React.useEffect(() => {
    function getChromeVersion() {
      var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
      return raw ? parseInt(raw[2], 10) : 0;
    }
    const version = getChromeVersion();
    // setIsBrowserSupport(version >= 127);

    setIsEnabledFlags(!!globalThis.ai?.languageModel);

    globalThis.ai?.languageModel.capabilities().then((cap: ChromeAIAssistantCapabilities) => {

      setIsEnabledFlags(cap.available === 'readily');
    });
  }, []);

  if (!isEnabledFlags) {
    infoElement = (
      <div className="w-[500px] m-auto flex flex-col gap-4">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Enabling AI in Chrome
        </h2>
        <p className="leading-7">
          Chrome&apos;s implementation of built-in AI with Gemini Nano is
          experimental and will change as they test and address feedback.
        </p>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Your browser is not supported.</AlertTitle>
          <AlertDescription>
            Please update Chrome to version 127 or higher.
          </AlertDescription>
        </Alert>

        {isEnabledFlags ? null : (
          <div className="flex flex-col items-start justify-start">
            <p className="leading-7 mb-4">
              Once your browser is installed, ensure the following flags are
              set:
            </p>
            <ol className="grid gap-4 counter-reset:step">
              <li className="flex items-center gap-4 text-sm">
                <div className="flex h-6 w-6 text-xs items-center justify-center rounded-full bg-primary text-primary-foreground counter:step">
                  1
                </div>
                <div className="w-full">
                  <h4 className="font-medium">
                    Step 1:&nbsp;
                    <Link
                      href="chrome://flags/#prompt-api-for-gemini-nano"
                      target="_blank"
                      className="underline"
                    >
                      chrome://flags/#prompt-api-for-gemini-nano
                    </Link>
                  </h4>
                  <p className="text-muted-foreground">
                    Select &apos;Enabled&apos;
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-4 text-sm">
                <div className="flex h-6 w-6 text-xs items-center justify-center rounded-full bg-primary text-primary-foreground counter:step">
                  2
                </div>
                <div className="w-full">
                  <h4 className="font-medium">
                    Step 2:&nbsp;
                    <Link
                      href="chrome://flags/#optimization-guide-on-device-model"
                      target="_blank"
                      className="underline"
                    >
                      chrome://flags/#optimization-guide-on-device-model
                    </Link>
                  </h4>
                  <p className="text-muted-foreground">
                    Select &apos;Enabled BypassPrefRequirement&apos;
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-4 text-sm">
                <div className="flex h-6 w-6 text-xs items-center justify-center rounded-full bg-primary text-primary-foreground counter:step">
                  3
                </div>
                <div className="w-full">
                  <h4 className="font-medium">
                    Step 3:&nbsp;
                    <Link
                      href="chrome://components"
                      target="_blank"
                      className="underline"
                    >
                      chrome://components
                    </Link>
                  </h4>
                  <p className="text-muted-foreground">
                    Click &apos;Check for Update&apos; on Optimization Guide On
                    Device Model to download the model. If you don&apos;t see
                    Optimization Guide, ensure you have set the flags correctly
                    above, relaunch your browser, and refresh the page.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}
      </div>
    );
  } else {
    infoElement = null;
  }

  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        'relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2 mt-2',
        props.className
      )}
    >
      {infoElement ?? children}
    </div>
  );
});

Outputs.displayName = 'Outputs';
