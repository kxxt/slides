---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://cover.sli.dev
# some information about your slides, markdown enabled
title:  Electron RISC-V Porting
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# apply any unocss classes to the current slide
class: text-center
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# https://sli.dev/guide/drawing
drawings:
  persist: false
# slide transition: https://sli.dev/guide/animations#slide-transitions
transition: slide-left
# enable MDC Syntax: https://sli.dev/guide/syntax#mdc-syntax
mdc: true
---

# <img src="/electron.png" width="128px" style="display: inline"> Electron RISC-V <img src="/riscv.png" width="128px" style="display: inline"> Porting

## Presenter: kxxt \<rsworktech@outlook.com\>

## <logos-archlinux  /> Arch Linux RISC-V at PLCT Lab

<br>

#### Rendered slides are available at https://kxxt.github.io/slides/electron-riscv-porting/

---

# Contents

- What is Electron?
- Status of the RISC-V port
- How does Electron's build system work?
- Brief History of the RISC-V Port
- How does the RISC-V port work?
- A recent performance regression

---
transition: fade-out
---

# What is Electron <img src="/electron.png" width="64px" style="display: inline">?

电子垃圾

It's a cross-platform framework for building desktop applications using web technologies.

<style>
h1.equ {
  font-size: 64px !important;
}  
</style>

<h1 class="equ"> <logos-electron size="74px"/> > <logos-chrome size="74px"/> + <logos-nodejs size="74px"/> (shared <logos-v8 size="74px"/>) </h1>

<v-click>

<img src="/meme1.png" width="200px" style="display: inline">

</v-click>
<v-click>
<img src="/meme2.png" width="400px" style="display: inline">

</v-click>

---

# Status of the RISC-V port

Most of the electron apps can be made to work on riscv64. The performance still needs improvement.

<img src="/apps.png" width="640px" style="display: inline">

<p style="float: right; width: 10em;">
  Electron Apps running on Arch Linux RISC-V on SG2042
  <br>
  <br>
  Top Right: VSCodium (Upstreamed)
  <br>
  <br>
  Bottom Right: Obsidian
  (Proprietary, unmodified, using system electron)
  <br>
  <br>
  Bottom Left: Zettlr (PKGBUILD Patched)
  <br>
</p>

---

# Status of the RISC-V port

Element Desktop running on Arch Linux RISC-V on Unmatched board

<img src="/element.png" width="666px" style="display: inline">

<p style="float: right; width: 9em;">
  The performance of the RISC-V port is still not good enough to fluently run Element Desktop.

  (Or we can say, we need better hardware to run it fluently.)
</p>

---
transition: slide-up
level: 2
---

# How does Electron's build system work?

DEPS and patches

- [Electron uses DEPS(invented by chromium) to manage dependencies](https://github.com/riscv-forks/electron/blob/v31.0.1-riscv/DEPS)
- After syncing the dependencies, a hook applies [tons of patches](https://github.com/riscv-forks/electron/tree/v31.0.1-riscv/patches) to chromium and nodejs source code
- It reuses chromium's build system(gn, ninja) to build the final electron binary
- So basically, electron uses chromium's build system

# How does Chromium's build system work?

- Chromium maintains its own builds of clang and rust toolchain.
- The build system uses debian sysroots by default.

---

# How does this complicates the RISC-V port?
To follow upstream's approach
- [A separately maintained patch](https://github.com/riscv-forks/electron/blob/README/sysroot.patch) to create debian sysroots for riscv64.
- Chroimum's clang build is missing some riscv64 parts(e.g. compiler-rt), so for cross-compilation, [we need to build clang ourselves](https://github.com/riscv-forks/electron/blob/v30.1.1-riscv/patches/chromium/0001-clang-add-riscv64-support-to-package-script.patch).
- Rust also needs to be built because of [#121924](https://github.com/rust-lang/rust/issues/121924). I fixed it in [#123612](https://github.com/rust-lang/rust/pull/123612). This fix has landed in rust 1.79.0 (Released on 13 June).

<div style="float: left;--prism-font-size: 1rem;">

```c
// reproducer.c
extern void hello();
int test () {
  hello();return 0;
}
```

Cross Language LTO

is broken on RISC-V

</div>

<div style="float: left;--prism-font-size: 1rem;">

```rust
// reproducer.rs
#![feature(no_core)]
#![feature(lang_items)]
#![no_std]
#![no_core]
#[lang = "sized"]
trait Sized {}
#[no_mangle]
pub fn hello() {}
```

</div>


```makefile
.PHONY: clean
libreproducer.so: reproducer.o libreproducer.rlib
	clang --target=riscv64-linux-gnu -flto=thin -march=rv64gc -mabi=lp64d -fuse-ld=lld -shared -nostdlib -o $@ $^
libreproducer.rlib: reproducer.rs rust-toolchain
	rustc --target riscv64gc-unknown-linux-gnu -Clinker-plugin-lto -Cpanic=abort --crate-type=rlib reproducer.rs
reproducer.o: reproducer.c
	clang --target=riscv64-linux-gnu -march=rv64gc -mabi=lp64d -flto=thin -O2 -c $< -o $@
```

```
ld.lld: error: lto.tmp: cannot link object files with
different floating-point ABI from lto.tmp
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

---

# Brief History of the RISC-V Port

- [OpenSUSE's port of electron to riscv64](https://build.opensuse.org/package/show/openSUSE:Factory:RISCV/nodejs-electron)
- electron22 ported to Arch Linux riscv64 based on OpenSUSE's port.
- Initially it's compiled directly on Arch Linux riscv64 (1day+ build time on 5950X via qemu-user).
- On SG2042, it could be built in 6 hours but [SG2042 can't build it reliably](https://github.com/revyos/revyos/issues/27).
  It's likely a kernel/firmware bug because it can't be reproduced on other riscv64 platforms.
- Later, I [established a fork](https://github.com/riscv-forks/electron) and get cross-compilation working.
  - It is also used in Arch Linux riscv64 to directly build on riscv64: https://github.com/felixonmars/archriscv-packages/tree/master/electron28

---
layout: image-right
image: https://github.com/kxxt/slides/blob/main/slides/electron-riscv-porting/public/branches.png?raw=true
---

# How does the RISC-V port work?

Branch model

- For each upstream tag, a branch based on it is created.
- We need a branch because we might release multiple revisions for a single upstream tag.
- There are also branches like `main-riscv`. But they are rarely maintained.

---
layout: image-right
image: https://github.com/kxxt/slides/blob/main/slides/electron-riscv-porting/public/releases.png?raw=true
---

# How does the RISC-V port work?

Release model
<style>
    li {
        font-size: 1.4rem !important;
        line-height: 1.8rem !important;
    }
</style>
[A separate repo](https://github.com/riscv-forks/electron-riscv-releases) is used to publish the releases because of
- The source repo is already used to publish toolchains 
- To avoid creating tags like v31.0.1.riscv1 in the source repo.
  - Electron's build system get its version from the git tag.
  - I don't want the built binaries to have a version like v31.0.1.riscv1, which might break the assumptions of some tools.

---
layout: image-right
image: https://github.com/kxxt/slides/blob/main/slides/electron-riscv-porting/public/releases.png?raw=true
---

# How does the RISC-V port work?

Release model

In addition to tags like `v31.0.1.riscv1`, releases are also published to upstream tags like `v31.0.1` because
some poor electron tooling doesn't support the former tags well.

This creates a problem: there is only one upstream tag but multiple riscv revisions based on it.
I have no choice but to upload the latest revision to the upstream tag and clobber the old one.

Thus the upstream tag can be taken as a pointer to the latest riscv revision.

---
layout: image-right
image: https://github.com/kxxt/slides/blob/main/slides/electron-riscv-porting/public/assets.png?raw=true
backgroundSize: contain
---

# How does the RISC-V port work?

Release Assets

I publish what the upstream electron release publishes.

Thus, the release assets are fully compatible with the upstream electron release.

Except one difference: 

Upstream publishes debug zip files, but I can't publish them because for riscv they are too large and exceed the GitHub release asset size limit.
So I publish the zstd compressed debug tar files if their size is less than 2GB.

---

# How does the RISC-V port work (internally)?

- Re-use electron's patching infrastructure to apply RISC-V patches.
- For each electron major version, the RISC-V patches need to be updated. This is the core part of the work.
- For electron minor version updates, usually the RISC-V patches don't need to be updated. It's a trival git rebase.
- [The Continuous Delivery](https://github.com/riscv-forks/electron-riscv-releases/blob/main/.github/workflows/release.yml)
  builds electron on self-hosted runners because of poor performance of GitHub runners.
  - Optionally, we need to build clang and rust toolchains in the pipeline if they were not already built.
  - The self-hosted runners run in a systemd-nspawn container and should be migrated to <logos-docker width="100px" /> to make it more portable and reproducible.

---
class: px-20
---

# A recent performance regression

A V8 Performance regression

<img src="/performance-comparation.gif" width="680px" style="float: left; margin-left: -3em;">

<div style="float: right; width: 12em; margin-right: -2em;">

[riscv-forks/electron#1](https://github.com/riscv-forks/electron/issues/1)

Severe performance regression are encountered when running Code OSS/VSCodium with electron >= 26.

Left: Performance regression

Right: Performance regression fixed

</div>

---

# A recent performance regression

Bisection

- We have Continuous Delivery that could cross-compile electron quickly, that makes it possible to bisect the performance regression. 
- There are two layers of bisecting at first:
  - Electron: First bisected to `[25.9.8, 26.0.0]`, then to `[v26.0.0-nightly.20230523, v26.0.0-nightly.20230524]`.
    - The only commit that looks suspicious is `30e992dec4 chore: bump chromium to 115.0.5786.0 (main) (#38301)`. It bumps chromium from `115.0.5760.0` to `115.0.5786.0`.
  - Chromium: bisect `115.0.5760.0..115.0.5786.0`, 5889 commits in total, at most 13 commits need to be checked.
    - The bisection finished after checking 9 commits.
---

# A recent performance regression

Bisection

The bisection of chromium shows that the performance regression is caused by:

```log
commit 6a609fb2d6c29f25c2dbce26afa165c0e80f4768
Author: v8-ci-autoroll-builder <v8-ci-autoroll-builder@chops-service-accounts.iam.gserviceaccount.com>
Date:   Wed May 17 17:38:50 2023 +0000

    Update V8 to version 11.5.138.
    
    Summary of changes available at:
    https://chromium.googlesource.com/v8/v8/+log/5e9b891a..0f44e4c2
    
    Change-Id: Ib5f6f43ba7ecbbbbc93867850d149a52bd692483
    Reviewed-on: https://chromium-review.googlesource.com/c/chromium/src/+/4544498
    Bot-Commit: v8-ci-autoroll-builder <v8-ci-autoroll-builder@chops-service-accounts.iam.gserviceaccount.com>
    Commit-Queue: v8-ci-autoroll-builder <v8-ci-autoroll-builder@chops-service-accounts.iam.gserviceaccount.com>
    Cr-Commit-Position: refs/heads/main@{#1145460}

 DEPS | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

Unfortunately, this means that we need to bisect further from chromium into V8.

---

# A recent performance regression

V8 Bisection

But fortunately, there are only 7 commits between `11.5.137` and `11.5.138`.

```log
0f44e4c2a6f Version 11.5.138
f6d19916516 [riscv] Implement probe mmu mode
004ee17f86a [heap] Remove dead code from sweeper
8d8a6c11ba6 [riscv][simulator]Modify the implementation of the vfsgnj
08f3d86855e [test] Update ODROID dimension after upgrade
6fed41859a3 [api] Instantiate lazy accessors in DefinePropertyWithInterceptor
2d134cf5556 [riscv64][android] apply flush_icache system call number directly
```

`8d8a6c11ba6` is good. At this point, I looked into `f6d19916516 [riscv] Implement probe mmu mode` and I think it's the cause of the performance regression.

---

# A recent performance regression

V8 Code

<div style="float: left;">

````md magic-move {lines: true}
```cpp
void Assembler::li_ptr(Register rd, int64_t imm) {
  // Initialize rd with an address
  // Pointers are 48 bits
  // 6 fixed instructions are generated
  DCHECK_EQ((imm & 0xfff0000000000000ll), 0);
  int64_t a6 = imm & 0x3f;                      // bits 0:5. 6 bits
  int64_t b11 = (imm >> 6) & 0x7ff;             // bits 6:11. 11 bits
  int64_t high_31 = (imm >> 17) & 0x7fffffff;   // 31 bits
  int64_t high_20 = ((high_31 + 0x800) >> 12);  // 19 bits
  int64_t low_12 = high_31 & 0xfff;             // 12 bits
  lui(rd, (int32_t)high_20);
  addi(rd, rd, low_12);  // 31 bits in rd.
  slli(rd, rd, 11);      // Space for next 11 bis
  ori(rd, rd, b11);      // 11 bits are put in. 42 bit in rd
  slli(rd, rd, 6);       // Space for next 6 bits
  ori(rd, rd, a6);       // 6 bits are put in. 48 bis in rd
}
```
```cpp {2-3,19-22|all|2}
void Assembler::li_ptr(Register rd, int64_t imm) {
  base::CPU cpu;
  if (cpu.riscv_mmu() != base::CPU::RV_MMU_MODE::kRiscvSV57) {
    // Initialize rd with an address
    // Pointers are 48 bits
    // 6 fixed instructions are generated
    DCHECK_EQ((imm & 0xfff0000000000000ll), 0);
    int64_t a6 = imm & 0x3f;                      // bits 0:5. 6 bits
    int64_t b11 = (imm >> 6) & 0x7ff;             // bits 6:11. 11 bits
    int64_t high_31 = (imm >> 17) & 0x7fffffff;   // 31 bits
    int64_t high_20 = ((high_31 + 0x800) >> 12);  // 19 bits
    int64_t low_12 = high_31 & 0xfff;             // 12 bits
    lui(rd, (int32_t)high_20);
    addi(rd, rd, low_12);  // 31 bits in rd.
    slli(rd, rd, 11);      // Space for next 11 bis
    ori(rd, rd, b11);      // 11 bits are put in. 42 bit in rd
    slli(rd, rd, 6);       // Space for next 6 bits
    ori(rd, rd, a6);       // 6 bits are put in. 48 bis in rd
  } else {
    FATAL("SV57 is not supported");
    UNIMPLEMENTED();
  }
}
```
````

</div>

<v-click click="4">
<div style="float: right; width: 14em;">

Although my <mdi-language-cpp color="purple"/> skills has now become a little rusty <mdi-language-rust color="brown" />,
I could see that the `cpu` variable declaration could bring a lot of side effects.

<img src="/ferris.svg" >

</div>
</v-click>

---

# A recent performance regression

V8 Code (Simplified)
<div style="float: left; margin-top: -1em;">

```cpp
// src/base/cpu.cc
CPU::CPU() : // - skip -
      riscv_mmu_(RV_MMU_MODE::kRiscvSV48),
      has_rvv_(false) {
  memcpy(vendor_, "Unknown", 8);
#if V8_HOST_ARCH_RISCV64
#if V8_OS_LINUX
  CPUInfo cpu_info;
  char* features = cpu_info.ExtractField("isa");
  if (HasListItem(features, "rv64imafdc"))
    has_fpu_ = true;
  if (HasListItem(features, "rv64imafdcv")) {
    has_fpu_ = true; has_rvv_ = true;
  }
  char* mmu = cpu_info.ExtractField("mmu");
  if (HasListItem(mmu, "sv48"))
    riscv_mmu_ = RV_MMU_MODE::kRiscvSV48;
  if (HasListItem(mmu, "sv39"))
    riscv_mmu_ = RV_MMU_MODE::kRiscvSV39;
  if (HasListItem(mmu, "sv57"))
    riscv_mmu_ = RV_MMU_MODE::kRiscvSV57;
#endif
#endif  // V8_HOST_ARCH_RISCV64
}
```

</div>

<div style="float: left; margin-left: 1em; margin-top: -2.8em;">

```cpp
CPUInfo() : datalen_(0) {
  static const char PATHNAME[] = "/proc/cpuinfo";
  FILE* fp = base::Fopen(PATHNAME, "r");
  if (fp != nullptr) {
    for (;;) {
      char buffer[256];
      size_t n = fread(buffer, 1, sizeof(buffer), fp);
      if (n == 0) break;
      datalen_ += n;
    }
    base::Fclose(fp);
  }
  // Read the contents of the cpuinfo file.
  data_ = new char[datalen_ + 1];
  fp = base::Fopen(PATHNAME, "r");
  if (fp != nullptr) {
    for (size_t offset = 0; offset < datalen_; ) {
      size_t n = fread(data_ + offset, 1, datalen_ - offset, fp);
      if (n == 0) break;
      offset += n;
    }
    base::Fclose(fp);
  }
  // Zero-terminate the data.
  data_[datalen_] = '\0';
}
```

</div>

<v-click>
<div style="position: absolute; left: 50%;">
<p style="position: relative; background: darkblue; padding: 2rem; left: -50%; border-radius: 1.2rem; margin-inline: auto;" >

Every call to `Assembler::li_ptr` constructs a new `CPU` instance,
where the constructor will open and read the entire contents of `/proc/cpuinfo` to probe MMU mode.

This is the cause of the performance regression.

</p>
</div>
</v-click>

---

# A recent performance regression

Fix

It is partially fixed in [`[riscv] Skip check sv57 when enable pointer compress`](https://chromium-review.googlesource.com/c/v8/v8/+/5430889)
as the `cpu` variable becomes an unused variable.

I opened [`[riscv] avoid cpu probing in li_ptr`](https://chromium-review.googlesource.com/c/v8/v8/+/5612950)
to remove the `cpu` variable declaration in `Assembler::li_ptr` to completely fix it.

For electrons, this performance regression is fixed in **v29.4.0.riscv2, v29.4.2.riscv2, v30.1.0.riscv2, v27.3.11.riscv2, v26.6.10.riscv2, v28.3.3.riscv2 and all later releases**.

This performance regression also affects Node.js **21 and 22 and the main branch**.

It is fixed in main branch by [nodejs/node#53412](https://github.com/nodejs/node/pull/53412). It will be backported to 22.x.

But Node.js 21 won't get the fix because it is already EOL.

---
layout: center
---

# Q & A

## Thank you for listening!

### <logos-opensource /> The slides are open source at https://github.com/kxxt/slides/blob/main/slides/electron-riscv-porting/slides.md

#### Rendered slides are available at https://kxxt.github.io/slides/electron-riscv-porting/