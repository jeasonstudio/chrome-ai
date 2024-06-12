# Chrome AI

`jeasonstudio/chrome-ai` is a community provider that uses Chrome built-in AI to provide language model. It works fine with vercel `ai`.

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