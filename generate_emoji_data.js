const fs = require('fs');
const request = require('request');
const classes = require('./src/emojilib');
const UnicodeTrieBuilder = require('unicode-trie/builder');

const trie = new UnicodeTrieBuilder(classes.XX);

function process(data) {
  const matches = data.match(/^[0-9A-F]+(\.\.[0-9A-F]+)? *; *[_A-z]+/gm);

  for (let match of matches) {
    const [rangeColumn, typeColumn] = match.split(';');
    const ranges = rangeColumn.split('..');
    let rangeStart, rangeEnd;

    if (ranges.length === 1) {
      rangeStart = rangeEnd = ranges[0];
    } else {
      [rangeStart, rangeEnd] = ranges;
    }

    const rangeType = typeColumn.match(/[A-z_]+/)[0];

    if (rangeType in classes) {
      if (rangeType in classes) {
        trie.setRange(parseInt(rangeStart, 16), parseInt(rangeEnd, 16), classes[rangeType], true);
      }
    }
  }
}

request('http://www.unicode.org/Public/emoji/12.0/emoji-data.txt', function (err, res, data) {
  process(data);
  fs.writeFileSync(__dirname + '/src/emoji/emoji_classes.trie', trie.toBuffer());
});
