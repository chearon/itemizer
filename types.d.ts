declare type ItemizerType = {
  emoji(s: string): Generator<{i: number, isEmoji: boolean}>,
  bidi(s: string): Generator<{i: number, dir: string}>,
  script(s: string): Generator<{i: number, script: string}>
};

declare namespace ItemizerInit {
  type Itemizer = ItemizerType;
}

declare const ItemizerInit:Promise<ItemizerType>;

export = ItemizerInit;
