exports.BidiSegmenter = function ({instance}) {
  const {
    SBAlgorithmCreate,
    SBAlgorithmCreateParagraph,
    SBParagraphGetLength,
    SBParagraphCreateLine,
    SBLineGetRunCount,
    SBLineGetRunsPtr,
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
    const line = SBParagraphCreateLine(paragraph, 0, SBParagraphGetLength(paragraph));
    const runCount = SBLineGetRunCount(line);
    const runArray = SBLineGetRunsPtr(line);
    const inc = initialLevel % 2 ? -1 : 1;
    let i = initialLevel % 2 ? runCount - 1 : 0;

    while (i >= 0 && i < runCount) {
      const runBuf = new Uint32Array(memory.buffer, runArray + i * 12, 3); // 12: sizeof(SBRun)
      const [offset, length, level] = runBuf;

      yield {i: offset + length, level};

      i += inc;
    }

    free(seqPtr);
    free(strPtr);
  }

  return iterate;
};
