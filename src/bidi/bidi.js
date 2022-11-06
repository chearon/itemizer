exports.BidiSegmenter = function ({instance}) {
  const {
    SBAlgorithmCreate,
    SBAlgorithmGetParagraphBoundary,
    SBAlgorithmCreateParagraph,
    SBParagraphGetLevelsPtr,
    malloc,
    free,
    memory
  } = instance.exports;

  function* iterate(str, initialLevel = 0) {
    const strPtr = malloc(str.length * 2);
    const seqPtr = malloc(12); // sizeof(SBCodepointSequence)
    const twoInts = new Uint32Array(memory.buffer, malloc(8) /* sizeof(SBUInteger) * 2 */, 2);

    const strBuf = new Uint16Array(memory.buffer, strPtr, str.length);
    for (let i = 0; i < str.length; ++i) {
      strBuf[i] = str.charCodeAt(i);
    }

    // first byte is 1 because 1 === SBStringEncodingUTF16
    new Uint32Array(memory.buffer, seqPtr, 3).set([1, strPtr, str.length]);

    const algorithm = SBAlgorithmCreate(seqPtr);
    const paraLenPtr = twoInts.byteOffset;
    const paraSepPtr = twoInts.byteOffset + 4;
    let offset = 0;
    let lastLevel;
    while (offset < str.length) {
      twoInts.set([0, 0]);
      SBAlgorithmGetParagraphBoundary(algorithm, offset, str.length - offset, paraLenPtr, paraSepPtr);
      const [paraLen, paraSep] = twoInts;
      const paragraph = SBAlgorithmCreateParagraph(algorithm, offset, paraLen + paraSep, initialLevel);
      const levels = new Uint8Array(memory.buffer, SBParagraphGetLevelsPtr(paragraph), paraLen + paraSep);
      const isFirstParagraph = offset === 0;
      const isLastParagraph = offset + paraLen + paraSep >= /* see Tehreer/SheenBidi#18 */ str.length;
      let j = paraLen + paraSep;

      if (isFirstParagraph) lastLevel = levels[0];
      if (isLastParagraph) j += 1; /* check levels[levels.length] to emit the final character */

      for (let i = 0; i < j; ++i) {
        const level = levels[i];
        if (level !== lastLevel) yield {i: offset + i, level: lastLevel};
        lastLevel = level;
      }

      offset += paraLen + paraSep
    }

    free(seqPtr);
    free(strPtr);
  }

  return iterate;
};
