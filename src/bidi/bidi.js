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

  function* iterate(str, baseDir = 'ltr') {
    const strPtr = malloc(str.length * 2);
    const seqPtr = malloc(12); // sizeof(SBCodepointSequence)

    const strBuf = new Uint16Array(memory.buffer, strPtr, str.length);
    for (let i = 0; i < str.length; ++i) {
      strBuf[i] = str.charCodeAt(i);
    }

    // first byte is 1 because 1 === SBStringEncodingUTF16
    new Uint32Array(memory.buffer, seqPtr, 3).set([1, strPtr, str.length]);

    const algorithm = SBAlgorithmCreate(seqPtr);
    const paragraph = SBAlgorithmCreateParagraph(algorithm, 0, -1, baseDir === 'ltr' ? 0 : 1);
    const line = SBParagraphCreateLine(paragraph, 0, SBParagraphGetLength(paragraph));
    const runCount = SBLineGetRunCount(line);
    const runArray = SBLineGetRunsPtr(line);

    for (let i = runCount - 1; i >= 0; --i) {
      const runBuf = new Uint32Array(memory.buffer, runArray + i * 12, 3); // 12: sizeof(SBRun)
      const [offset, length, level] = runBuf;
      const dir = level % 2 === 0 ? 'ltr' : 'rtl';

      yield {i: offset + length, dir};
    }

    free(seqPtr);
    free(strPtr);
  }

  return iterate;
};
