const fs = require('fs');
const path = require('path');
const EmojiSegmenter = require('./emoji/emoji').EmojiSegmenter;
const BidiSegmenter = require('./bidi/bidi').BidiSegmenter;
const ScriptSegmenter = require('./script/script').ScriptSegmenter;
const UnicodeTrie = require('unicode-trie');

const EMOJI_PATH = path.resolve(__dirname, 'emoji', 'emoji_classes.trie');
const WASM_PATH = path.resolve(__dirname, '..', 'wasm', 'bundle.wasm');

const trie = new UnicodeTrie(fs.readFileSync(EMOJI_PATH));

module.exports = WebAssembly.instantiate(fs.readFileSync(WASM_PATH), {})
  .then(wasm => {
    wasm.instance.exports.malloc(4); // TODO re-check the buffer after every malloc

    const emoji = EmojiSegmenter(wasm, trie);
    const bidi = BidiSegmenter(wasm);
    const script = ScriptSegmenter();

    return {emoji, bidi, script};
  });

