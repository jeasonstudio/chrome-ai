# Chrome AI

`jeasonstudio/chrome-ai` is a community provider that uses Chrome built-in AI to provide language model. It works fine with vercel `ai`.

## Install

```bash
npm install chrome-ai ai
```

## Usage

```javascript
import { generateText } from 'ai';
import { chromeai } from 'chrome-ai';

const { text } = await generateText({
  model: chromeai('text'),
  prompt: 'Who are you?',
});

console.log(text); //  I am a large language model, trained by Google.
```


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