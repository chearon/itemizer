// Used for the trie
const Emoji = 1;
const Emoji_Presentation = 2;
const Emoji_Modifier = 3;
const Emoji_Modifier_Base = 4;
const Emoji_Extended_Pictographic = 5;

// Some unicode char constants from Pango
const kCombiningEnclosingCircleBackslashCharacter = 0x20E0;
const kCombiningEnclosingKeycapCharacter = 0x20E3;
const kVariationSelector15Character = 0xFE0E;
const kVariationSelector16Character = 0xFE0F;
const kZeroWidthJoinerCharacter = 0x200D;

// Scanner categories
const EMOJI = 0;
const EMOJI_TEXT_PRESENTATION = 1;
const EMOJI_EMOJI_PRESENTATION = 2;
const EMOJI_MODIFIER_BASE = 3;
const EMOJI_MODIFIER = 4;
const EMOJI_VS_BASE = 5;
const REGIONAL_INDICATOR = 6;
const KEYCAP_BASE = 7;
const COMBINING_ENCLOSING_KEYCAP = 8;
const COMBINING_ENCLOSING_CIRCLE_BACKSLASH = 9;
const ZWJ = 10;
const VS15 = 11;
const VS16 = 12;
const TAG_BASE = 13;
const TAG_SEQUENCE = 14;
const TAG_TERM = 15;
const kMaxEmojiScannerCategory = 1;

exports.EmojiSegmenter = function ({instance}, trie) {
  const {memory, malloc, free, emoji_scan} = instance.exports;
  const buffer = new Uint8Array(memory.buffer);

  function* scan(types, offsets) {
    const n = types.length;
    const ptr = malloc(n + 1);

    for (let i = 0; i < n; ++i) buffer[ptr + i] = types[i];

    let p = ptr;
		let isEmoji = false;

    do {
      p = emoji_scan(p, ptr + n, ptr + n);

      const pIsEmoji = Boolean(buffer[ptr + n]);

			if (pIsEmoji !== isEmoji) {
				yield {i: offsets[p - ptr - 1], isEmoji};
				isEmoji = pIsEmoji;
			}
    } while (p < ptr + n);

    yield {i: offsets[offsets.length - 1], isEmoji: Boolean(buffer[ptr + n])};

    free(ptr);
  }

  function* iterate(str) {
    const types = [];
    const offsets = [];

    for (let i = 0; i < str.length; ++i) {
      let code = str.charCodeAt(i);
      const next = str.charCodeAt(i + 1);

      offsets.push(i);

      // If a surrogate pair
      if ((0xd800 <= code && code <= 0xdbff) && (0xdc00 <= next && next <= 0xdfff)) {
        i += 1;
        code = ((code - 0xd800) * 0x400) + (next - 0xdc00) + 0x10000;
      }

			if (code === kCombiningEnclosingKeycapCharacter) {
				types.push(COMBINING_ENCLOSING_KEYCAP);
			} else if (code === kCombiningEnclosingCircleBackslashCharacter) {
				types.push(COMBINING_ENCLOSING_CIRCLE_BACKSLASH);
			} else if (code === kZeroWidthJoinerCharacter) {
				types.push(ZWJ);
			} else if (code === kVariationSelector15Character) {
				types.push(VS15);
			} else if (code === kVariationSelector16Character) {
				types.push(VS16);
			} else if (code === 0x1F3F4) {
				types.push(TAG_BASE);
			} else if ((code >= 0xE0030 && code <= 0xE0039) ||
					(code >= 0xE0061 && code <= 0xE007A)) {
				types.push(TAG_SEQUENCE);
			} else if (code === 0xE007F) {
				types.push(TAG_TERM);
			} else if (trie.get(code) === Emoji_Modifier_Base) {
				types.push(EMOJI_MODIFIER_BASE);
			} else if (trie.get(code) === Emoji_Modifier) {
				types.push(EMOJI_MODIFIER);
			} else if (code >= 0x1F1E6 && code <= 0x1F1FF) {
				types.push(REGIONAL_INDICATOR);
			} else if ((code >= 48 && code <= 57) || code === 35 || code === 42) {
				types.push(KEYCAP_BASE);
			} else if (trie.get(code) === Emoji_Presentation) {
				types.push(EMOJI_EMOJI_PRESENTATION);
			} else if (trie.get(code) === Emoji && trie.get(code) !== Emoji_Presentation) {
				types.push(EMOJI_TEXT_PRESENTATION);
			} else if (trie.get(code) === Emoji) {
				types.push(EMOJI);
			} else {
				types.push(kMaxEmojiScannerCategory);
			}
		}

    offsets.push(str.length);

		yield* scan(types, offsets);
  }

  return iterate;
};

exports.Emoji = Emoji;
exports.Emoji_Presentation = Emoji_Presentation;
exports.Emoji_Modifier = Emoji_Modifier;
exports.Emoji_Modifier_Base = Emoji_Modifier_Base;
exports.Emoji_Extended_Pictographic = Emoji_Extended_Pictographic;
