# Emoji iterator

Upstream repo: https://github.com/google/emoji-segmenter

## Background

Google's state machine is fed a list of character classes (one class per
codepoint) and it writes out which parts are emoji and which not. The results
are translated back to character indices and spat out in JS generator form.

The JS code was hand-ported from Pango.

## Modifications

The only changes to the rl file are typedefing the required emoji_text_iter_t,
defining true, false, and bool, and naming the function emoji_sc, and naming
the function emoji_sc
