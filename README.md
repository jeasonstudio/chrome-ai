# Chrome AI

`jeasonstudio/chrome-ai` is a community provider that uses Chrome built-in AI to provide language model. It works fine with vercel `ai`.

## Enable AI in Chrome

Chrome built-in AI is a preview feature, you need to use chrome version 127 or greater, now in [dev](https://www.google.com/chrome/dev/?platform=mac&extra=devchannel) or [canary](https://www.google.com/chrome/canary/?platform=mac) channel, [may release on stable chanel at Jul 17, 2024](https://chromestatus.com/roadmap), if release schedule on time.

After then, you should turn on these flags:
* [chrome://flags/#prompt-api-for-gemini-nano](chrome://flags/#prompt-api-for-gemini-nano): `Enabled`
* [chrome://flags/#optimization-guide-on-device-model](chrome://flags/#optimization-guide-on-device-model): `Enabled BypassPrefRequirement`
  
Then click `Optimization Guide On Device Model` in [chrome://components/](chrome://components/) to download model.

Finally, you can use prompt api in console, or use `chrome-ai` with `vercel/ai` to build projects.

## Install

```bash
npm install chrome-ai ai
```

## Usage

generate text:

```javascript
import { generateText } from 'ai';
import { chromeai } from 'chrome-ai';

const { text } = await generateText({
  model: chromeai('text'),
  prompt: 'Who are you?',
});

console.log(text); //  I am a large language model, trained by Google.
```

stream text:

```javascript
import { streamText } from 'ai';
import { chromeai } from 'chrome-ai';

const { textStream } = await streamText({
  model: chromeai('text'),
  prompt: 'Who are you?',
});

let result = '';
for await (const textPart of textStream) {
  result = textPart;
}

console.log(result);
//  I am a large language model, trained by Google.
```

generate object:

```javascript
import { generateObject } from 'ai';
import { chromeai } from 'chrome-ai';
import { z } from 'zod';

const { object } = await generateObject({
  model: chromeai('text'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
        })
      ),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

console.log(object);
// { recipe: {...} }
```