exports.BidiSegmenter = function ({instance}) {
  const {
    SBAlgorithmCreate,
    SBAlgorithmCreateParagraph,
    SBParagraphGetLevelsPtr,
    malloc,
    free,
    memory
  } = instance.exports;

  function* iterate(str, initialLevel = 0) {
    const strPtr = malloc(str.length * 2);
    const seqPtr = malloc(12); // sizeof(SBCodepointSequence)

    const strBuf = new Uint16Array(memory.buffer, strPtr, str.length);
    for (let i = 0; i < str.length; ++i) {
      strBuf[i] = str.charCodeAt(i);
    }

    // first byte is 1 because 1 === SBStringEncodingUTF16
    new Uint32Array(memory.buffer, seqPtr, 3).set([1, strPtr, str.length]);

    const algorithm = SBAlgorithmCreate(seqPtr);
    const paragraph = SBAlgorithmCreateParagraph(algorithm, 0, -1, initialLevel);
    const levels = new Uint8Array(memory.buffer, SBParagraphGetLevelsPtr(paragraph), str.length);

    let lastLevel = levels[0];
    for (let i = 0; i <= str.length; ++i) {
      const level = levels[i];
      if (level !== lastLevel) yield {i, level: lastLevel};
      lastLevel = level;
    }

    free(seqPtr);
    free(strPtr);
  }

  return iterate;
};
