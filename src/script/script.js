const {getScript} = require('unicode-properties');

const pairedChars = [
  0x0028, 0x0029, /* ascii paired punctuation */
  0x003c, 0x003e,
  0x005b, 0x005d,
  0x007b, 0x007d,
  0x00ab, 0x00bb, /* guillemets */
  0x0f3a, 0x0f3b, /* tibetan */
  0x0f3c, 0x0f3d,
  0x169b, 0x169c, /* ogham */
  0x2018, 0x2019, /* general punctuation */
  0x201c, 0x201d,
  0x2039, 0x203a,
  0x2045, 0x2046,
  0x207d, 0x207e,
  0x208d, 0x208e,
  0x27e6, 0x27e7, /* math */
  0x27e8, 0x27e9,
  0x27ea, 0x27eb,
  0x27ec, 0x27ed,
  0x27ee, 0x27ef,
  0x2983, 0x2984,
  0x2985, 0x2986,
  0x2987, 0x2988,
  0x2989, 0x298a,
  0x298b, 0x298c,
  0x298d, 0x298e,
  0x298f, 0x2990,
  0x2991, 0x2992,
  0x2993, 0x2994,
  0x2995, 0x2996,
  0x2997, 0x2998,
  0x29fc, 0x29fd,
  0x2e02, 0x2e03,
  0x2e04, 0x2e05,
  0x2e09, 0x2e0a,
  0x2e0c, 0x2e0d,
  0x2e1c, 0x2e1d,
  0x2e20, 0x2e21,
  0x2e22, 0x2e23,
  0x2e24, 0x2e25,
  0x2e26, 0x2e27,
  0x2e28, 0x2e29,
  0x3008, 0x3009, /* chinese paired punctuation */
  0x300a, 0x300b,
  0x300c, 0x300d,
  0x300e, 0x300f,
  0x3010, 0x3011,
  0x3014, 0x3015,
  0x3016, 0x3017,
  0x3018, 0x3019,
  0x301a, 0x301b,
  0xfe59, 0xfe5a,
  0xfe5b, 0xfe5c,
  0xfe5d, 0xfe5e,
  0xff08, 0xff09,
  0xff3b, 0xff3d,
  0xff5b, 0xff5d,
  0xff5f, 0xff60,
  0xff62, 0xff63
];

function getPairIndex(ch) {
  let lower = 0;
  let upper = pairedChars.length - 1;

  while (lower <= upper) {
    const mid = Math.floor((lower + upper) / 2);

    if (ch < pairedChars[mid]) {
      upper = mid - 1;
    } else if (ch > pairedChars[mid]) {
      lower = mid + 1;
    } else {
      return mid;
    }
  }

  return -1;
}

exports.ScriptSegmenter = function () {
  function* iterate(text) {
    let textStart = 0;
    let textEnd = text.length;
    let scriptEnd = 0;
    let runningScript = 'Common';
    let startParen = -1;
    const parens = [];

    if (!text.length) return;

    while (scriptEnd < textEnd) {
      let jump = 1;
      let code = text.charCodeAt(scriptEnd);
      const next = text.charCodeAt(scriptEnd + 1);

      // If a surrogate pair
      if ((0xd800 <= code && code <= 0xdbff) && (0xdc00 <= next && next <= 0xdfff)) {
        jump += 1;
        code = ((code - 0xd800) * 0xd400) + (next - 0xdc00) + 0x10000
      }

      let script = getScript(code);
      const pairIndex = script !== 'Common' ? -1 : getPairIndex(code);

      // Paired character handling:
      // if it's an open character, push it onto the stack
      // if it's a close character, find the matching open on the stack, and use
      // that script code. Any non-matching open characters above it on the stack
      // will be popped.
      if (pairIndex >= 0) {
        if (pairIndex % 2 === 0) {
          parens.push({index: pairIndex, script: runningScript});
        } else if (parens.length > 0) {
          const pi = pairIndex & ~1;

          while (parens.length && parens[parens.length - 1].index !== pi) {
            parens.pop();
          }

          if (parens.length - 1 < startParen) {
            startParen = parens.length - 1;
          }

          if (parens.length > 0) {
            script = parens[parens.length - 1].script;
          }
        }
      }

      // TODO Unknonwn is being treated as Common by unicode-properties, and I
      // don't think Invalid is possible (what's that for anyways?)
      const runningIsReal = runningScript !== 'Common' && runningScript !== 'Inherited';
      const isReal = script !== 'Common' && script !== 'Inherited';
      const isSame = !runningIsReal || !isReal || script === runningScript;

      if (isSame) {
        if (!runningIsReal && isReal) {
          runningScript = script;

          // Now that we have a final script code, fix any open characters we
          // pushed before we knew the real script code.
          while (parens[startParen + 1]) parens[++startParen].script = script;

          if (pairIndex >= 0 && pairIndex % 2 === 1 && parens.length > 0) {
            parens.pop();

            if (parens.length - 1 < startParen) {
              startParen = parens.length - 1;
            }
          }
        }

        scriptEnd += jump;
      } else {
        yield {i: scriptEnd, script: runningScript};

        startParen = parens.length - 1;
        runningScript = 'Common';
      }
    }

    yield {i: scriptEnd, script: runningScript};
  }

  return iterate;
};
