declare type ItemizerType = {
  emoji(s: string): Generator<{i: number, isEmoji: boolean}>,
  bidi(s: string, initialLevel: number): Generator<{i: number, level: number}>,
  script(s: string): Generator<{i: number, script: string}>
};

declare namespace ItemizerInit {
  type Itemizer = ItemizerType;
}

declare const ItemizerInit:Promise<ItemizerType>;

export = ItemizerInit;
