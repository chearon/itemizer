# itemizer

Dice up JS strings by script, emoji and bidi direction. Hand ported from Pango with the help of [SheenBidi](https://github.com/Tehreer/SheenBidi) and [emoji-segmenter](https://github.com/google/emoji-segmenter), both of which are compiled and distributed in WebAssembly form.

A useful text-stack component if you want to do your own font selection and shaping in JS, or if you need more power to customize the display of different scripts or emojis in a browser.

## API

The module itself is a promise since WASM loads asynchronously:

```javascript
const {emoji, script, bidi} = await require('itemizer');
```

Each of the values on the resolved object have the same API but iterate different things. The emoji iterator stops at boundaries between text and emoji sequences:

```javascript
const str = 'I 👏🏼 proper i18n support';
let last = 0;
for (const {i, isEmoji} of emoji(str)) {
  console.log(str.slice(last, i)); // logs 3 times
  last = i;
}
```

The bidi iterator has the same API:


```javascript
const str = 'Latin is common ពួកគេទាំងអស់   ';

let last = 0;
for (const {i, dir} of bidi(str, 0 /* base level (ex. 1 for RTL) */)) {
  console.log(str.slice(last, i)); // logs 2 times
  last = i;
}
```
and so does the script iterator's API:

```javascript
const str = 'Latin is common ពួកគេទាំងអស់   ';

for (const {i, script} of script(str)) {
  console.log(script); // logs 2 times
}
```

## Bigger example

Check out the repo and run

```bash
$ node test.js
```

## Building the WebAssembly locally

1. Get [ragel](http://www.colm.net/open-source/ragel/) from your package manager
2. Get [WASI (sysroot version)](https://github.com/CraneStation/wasi-sdk/releases/download/wasi-sdk-8/wasi-sysroot-8.0.tar.gz)
3. Get LLVM Clang 9+ from your package manager
4. Open the makefile and set `RL`, `WASI_SYSROOT` `CXX` according to steps 1, 2, 3
5. `make`
