<div align="center">
<a name="readme-top"></a>

<img src="https://mdn.alipayobjects.com/huamei_1hrimu/afts/img/A*OLMCRq2wg7cAAAAAAAAAAAAADp95AQ/original" alt="chrome-ai" width="200"/>

<h1>Chrome AI</h1>

[Vercel AI](https://sdk.vercel.ai/docs/introduction) provider for Chrome built-in model (Gemini Nano).

[![NPM version][npm-image]][npm-url]
[![NPM downloads][download-image]][download-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]

[![CI status][github-action-image]][github-action-url]
[![codecov][codecov-image]][codecov-url]
[![Follow Twitter][twitter-image]][twitter-url]

[Report Bug](https://github.com/jeasonstudio/chrome-ai/issues/new) · [Pull Request](https://github.com/jeasonstudio/chrome-ai/compare)

![](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

[npm-image]: https://img.shields.io/npm/v/chrome-ai?style=for-the-badge
[npm-url]: http://npmjs.org/package/chrome-ai
[download-image]: https://img.shields.io/npm/dm/chrome-ai.svg?style=for-the-badge
[download-url]: https://npmjs.org/package/chrome-ai
[github-action-image]: https://img.shields.io/github/actions/workflow/status/jeasonstudio/chrome-ai/ci.yml?style=for-the-badge
[github-action-url]: https://github.com/jeasonstudio/chrome-ai/actions?query=workflow=%22ci%22
[codecov-image]: https://img.shields.io/codecov/c/github/jeasonstudio/chrome-ai/main.svg?style=for-the-badge
[codecov-url]: https://codecov.io/gh/jeasonstudio/chrome-ai/branch/main
[license-shield]: https://img.shields.io/github/license/jeasonstudio/chrome-ai.svg?style=for-the-badge
[license-url]: https://github.com/jeasonstudio/chrome-ai/blob/main/LICENSE

[stars-shield]: https://img.shields.io/github/stars/jeasonstudio/chrome-ai.svg?style=for-the-badge
[stars-url]: https://github.com/jeasonstudio/chrome-ai/stargazers
[issues-shield]: https://img.shields.io/github/issues/jeasonstudio/chrome-ai.svg?style=for-the-badge
[issues-url]: https://github.com/jeasonstudio/chrome-ai/issues
[twitter-image]: https://img.shields.io/twitter/follow/jeasonstudio?style=for-the-badge&logo=x
[twitter-url]: https://twitter.com/jeasonstudio

</div>

> ⚠️ Note:
> * This module is under development and may contain errors and frequent incompatible changes.
> * Chrome's implementation of [built-in AI with Gemini Nano](https://developer.chrome.com/docs/ai/built-in) is an experiment and will change as they test and address feedback.
> * If you've never heard of it before, [follow these steps](#enabling-ai-in-chrome) to turn on Chrome's built-in AI.

## 📦 Installation

The ChromeAI provider is available in the `chrome-ai` module. You can install it with:

```bash
npm install chrome-ai
```

## 🦄 Language Models

The `chromeai` provider instance is a function that you can invoke to create a language model:

```ts
import { chromeai } from 'chrome-ai';

const model = chromeai();
```

It automatically selects the correct model id. You can also pass additional settings in the second argument:

```ts
import { chromeai } from 'chrome-ai';

const model = chromeai('text', {
  // additional settings
  temperature: 0.5,
  topK: 5,
});
```

You can use the following optional settings to customize:

- **modelId** `'text' (default: `'text'`)
- **temperature** `number` (default: `0.8`)
- **topK** `number` (default: `3`)

## ⭐️ Embedding models

```ts
import { chromeai } from 'chrome-ai';
import { embedMany, cosineSimilarity } from 'ai';

const { embeddings } = await embedMany({
  model: chromeai('embedding'),
  values: ['sunny day at the beach', 'rainy afternoon in the city'],
});
// [[1.9545, 0.0318...], [1.8015, 0.1504...]]

const similarity = cosineSimilarity(embeddings[0], embeddings[1]);
// similarity: 0.9474937159037822
```

## 🎯 Examples

You can use Chrome built-in language models to generate text with the `generateText` or `streamText` function:

```javascript
import { generateText } from 'ai';
import { chromeai } from 'chrome-ai';

const { text } = await generateText({
  model: chromeai(),
  prompt: 'Who are you?',
});

console.log(text); //  I am a large language model, trained by Google.
```

```javascript
import { streamText } from 'ai';
import { chromeai } from 'chrome-ai';

const { textStream } = await streamText({
  model: chromeai(),
  prompt: 'Who are you?',
});

let result = '';
for await (const textPart of textStream) {
  result += textPart;
}

console.log(result);
//  I am a large language model, trained by Google.
```

Chrome built-in language models can also be used in the `generateObject/streamObject` function:

```javascript
import { generateObject } from 'ai';
import { chromeai } from 'chrome-ai';
import { z } from 'zod';

const { object } = await generateObject({
  model: chromeai(),
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

```javascript
import { streamObject } from 'ai';
import { chromeai } from 'chrome-ai';
import { z } from 'zod';

const { partialObjectStream } = await streamObject({
  model: chromeai(),
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

for await (const partialObject of result.partialObjectStream) {
  console.log(JSON.stringify(partialObject, null, 2));
  // { recipe: {...} }
}
```

> Due to model reasons, `toolCall/functionCall` are not supported. We are making an effort to implement these functions by prompt engineering.

## Enabling AI in Chrome

Chrome built-in AI is a preview feature, you need to use chrome version 127 or greater, now in [dev](https://www.google.com/chrome/dev/?extra=devchannel) or [canary](https://www.google.com/chrome/canary/) channel, [may release on stable chanel at Jul 17, 2024](https://chromestatus.com/roadmap).

After then, you should turn on these flags:
* [chrome://flags/#prompt-api-for-gemini-nano](chrome://flags/#prompt-api-for-gemini-nano): `Enabled`
* [chrome://flags/#optimization-guide-on-device-model](chrome://flags/#optimization-guide-on-device-model): `Enabled BypassPrefRequirement`
* [chrome://components/](chrome://components/): Click `Optimization Guide On Device Model` to download the model.

Or you can try using the experimental feature: `chrome-ai/polyfill`, to use `chrome-ai` in any browser that supports WebGPU and WebAssembly.

```ts
import 'chrome-ai/polyfill';
// or
require('chrome-ai/polyfill');
```

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=jeasonstudio/chrome-ai&type=Date)](https://star-history.com/#jeasonstudio/chrome-ai&Date)

## License

[MIT](LICENSE) License © 2024 [Jeason](https://github.com/jeasonstudio)
