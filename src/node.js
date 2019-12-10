const fs = require('fs');
const EmojiSegmenter = require('./emoji/emoji').EmojiSegmenter;
const BidiSegmenter = require('./bidi/bidi').BidiSegmenter;
const ScriptSegmenter = require('./script/script').ScriptSegmenter;
const UnicodeTrie = require('unicode-trie');

const trie = new UnicodeTrie(fs.readFileSync('./src/emoji/emoji_classes.trie'));

module.exports = WebAssembly.instantiate(fs.readFileSync('./wasm/bundle.wasm'), {})
  .then(wasm => {
    wasm.instance.exports.malloc(4); // TODO re-check the buffer after every malloc

    const emoji = EmojiSegmenter(wasm, trie);
    const bidi = BidiSegmenter(wasm);
    const script = ScriptSegmenter();

    return {emoji, bidi, script};
  });

