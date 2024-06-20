<div align="center">
<a name="readme-top"></a>

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

## Installation

```bash
$ npm i ai chrome-ai
```

## Enable AI in Chrome

Chrome built-in AI is a preview feature, you need to use chrome version 127 or greater, now in [dev](https://www.google.com/chrome/dev/?platform=mac&extra=devchannel) or [canary](https://www.google.com/chrome/canary/?platform=mac) channel, [may release on stable chanel at Jul 17, 2024](https://chromestatus.com/roadmap), if release schedule on time.

After then, you should turn on these flags:
* [chrome://flags/#prompt-api-for-gemini-nano](chrome://flags/#prompt-api-for-gemini-nano): `Enabled`
* [chrome://flags/#optimization-guide-on-device-model](chrome://flags/#optimization-guide-on-device-model): `Enabled BypassPrefRequirement`
  
Then click `Optimization Guide On Device Model` in [chrome://components/](chrome://components/) to download model.

Finally, you can use prompt api in console, or use `chrome-ai` with `vercel/ai` to build projects.

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