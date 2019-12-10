async function go() {
  const {emoji, bidi, script} = await require('.');

  {
    console.log("Emoji\n-----\n");

    const str = 'hello 😀 heres a fam 👪 and a dog 🐕';
    const segment = emoji.iterate(str);
    let last = 0;

    for (const {i, isEmoji} of segment) {
      console.log(`${last}..${i-1} (${isEmoji}): ${str.slice(last, i)}`);
      last = i;
    }
  }

  console.log();

  {
    console.log("Bidi\n----\n");

    const str = 'یہ ایک )car( ہے۔. Hebrew looks like אָלֶף־בֵּית עִבְרִי';
    const segment = bidi.iterate(str);
    let last = 0;

    for (const {i, dir} of segment) {
      console.log(`${last}..${i-1} (${dir}): ${str.slice(last, i)}`);
      last = i;
    }
  }

  console.log();

  {
    console.log("Script\n------\n");
    const str = 'Latin is the most common. スクリプトが大好きです！ពួកគេទាំងអស់';
    const segment = script.iterate(str);
    let last = 0;

    for (const {i, script} of segment) {
      console.log(`${last}..${i-1} (${script}): ${str.slice(last, i)}`);
      last = i;
    }
  }
}

go();
