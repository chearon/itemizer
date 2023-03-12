const fs = require('fs');
const path = require('path');
const EmojiSegmenter = require('./emoji/emoji').EmojiSegmenter;
const BidiSegmenter = require('./bidi/bidi').BidiSegmenter;
const ScriptSegmenter = require('./script/script').ScriptSegmenter;
const UnicodeTrie = require('unicode-trie');

const EMOJI_PATH = path.resolve(__dirname, 'emoji', 'emoji_classes.trie');
const WASM_PATH = path.resolve(__dirname, '..', 'wasm', 'bundle.wasm');

const trie = new UnicodeTrie(fs.readFileSync(EMOJI_PATH));

module.exports = WebAssembly.instantiate(fs.readFileSync(WASM_PATH), {
  // I used to patch wasi-libc to not create all these imports but as the library
  // has changed, even more of them have showed up. it's getting too hard, so
  // instead I've just stubbed them out here. they don't get called.
  wasi_snapshot_preview1: {
    args_get() {},
    args_sizes_get() {},
    environ_get() {},
    environ_sizes_get() {},
    clock_res_get() {},
    clock_time_get() {},
    fd_advise() {},
    fd_allocate() {},
    fd_close() {},
    fd_datasync() {},
    fd_fdstat_get() {},
    fd_fdstat_set_flags() {},
    fd_fdstat_set_rights() {},
    fd_filestat_get() {},
    fd_filestat_set_size() {},
    fd_filestat_set_times() {},
    fd_pread() {},
    fd_prestat_get() {},
    fd_prestat_dir_name() {},
    fd_pwrite() {},
    fd_read() {},
    fd_readdir() {},
    fd_renumber() {},
    fd_seek() {},
    fd_sync() {},
    fd_tell() {},
    fd_write() {},
    path_create_directory() {},
    path_filestat_get() {},
    path_filestat_set_times() {},
    path_link() {},
    path_open() {},
    path_readlink() {},
    path_remove_directory() {},
    path_rename() {},
    path_symlink() {},
    path_unlink_file() {},
    poll_oneoff() {},
    proc_exit() {},
    sched_yield() {},
    random_get() {},
    sock_accept() {},
    sock_recv() {},
    sock_send() {},
    sock_shutdown() {},
  }
})
  .then(wasm => {
    wasm.instance.exports.malloc(4); // TODO re-check the buffer after every malloc

    const emoji = EmojiSegmenter(wasm, trie);
    const bidi = BidiSegmenter(wasm);
    const script = ScriptSegmenter();

    return {emoji, bidi, script};
  });

