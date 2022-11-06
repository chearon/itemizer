WASI_SYSROOT = ""
RL = ragel
CXX = /usr/local/opt/llvm/bin/clang
CXXFLAGS = \
	-Wall \
	--target=wasm32 \
	-Os \
	-DNDEBUG \
	--sysroot=$(WASI_SYSROOT)
LD = /usr/local/opt/llvm/bin/wasm-ld
LDFLAGS = \
	--allow-undefined \
	--no-entry \
	--strip-all \
	--export-dynamic \
	--initial-memory=262144 \
	-error-limit=0 \
	--lto-O3 \
	-O3 \
	--gc-sections \
	--export-all \
	-L$(WASI_SYSROOT)/lib/wasm32-wasi \
	-lc

all: setup wasm/bundle.wat

setup:
	mkdir -p wasm/emoji wasm/bidi

wasm/bundle.wat: wasm/bundle.wasm
	wasm2wat $< > $@

wasm/bundle.wasm: wasm/emoji/emoji_scan.o wasm/bidi/bidi.o
	$(LD) $(LDFLAGS) -o $@ --no-entry $^

src/emoji/emoji_scan.c: src/emoji/emoji_scan.rl
	$(RL) src/emoji/emoji_scan.rl -o src/emoji/emoji_scan.c

wasm/emoji/emoji_scan.o: src/emoji/emoji_scan.c
	$(CXX) -c $(CXXFLAGS) $< -o $@

wasm/bidi/bidi.o: src/bidi/Source/SheenBidi.c
	$(CXX) -c $(CXXFLAGS) -DSB_CONFIG_UNITY -Isrc/bidi/Headers $< -o $@

clean:
	rm -f wasm/bidi/* wasm/emoji/* src/emoji/emoji_scan.c
