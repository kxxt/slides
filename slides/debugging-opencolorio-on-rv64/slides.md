---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: 'text-center'
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: false
# persist drawings in exports and build
drawings:
  persist: false
# page transition
transition: slide-left
# use UnoCSS
css: unocss
---

# OpenColorIO 修包杂记

## Arch 小队

## kxxt

<br>

## 2023/04

<br>

### 幻灯片可以在 https://kxxt.github.io/slides/debugging-opencolorio-on-rv64 找到

---
layout: image-left
image: /ocio.png
---

# 介绍
Introduction

前几天我在修 OpenColorIO 这个包的时候遇到了一些比较有趣的问题, 
在 Melon 的建议下, 我把这次修包历程整理成了一个报告.

![](/melon.png)

根据官网的介绍, OpenColorIO 是一款开源的完整的色彩管理解决方案

<!--
反正我是没有理解这个介绍的含义, 总之 OCIO 在干一些和色彩空间相关的事情
-->

---
layout: two-cols
---

# OCIO 在 riscv64 上的"问题"
Problems on riscv64

编译通过, 但是 cpu 测试过不去.

![](/test_before.png)

这些挂掉的测试有一个共同的特点, 
就是它们的结果和预期的结果很接近, 但是却不完全相同.

::right::

![](/test-fail-1.png)

![](/test-fail-2.png)

---
layout: two-cols
---
# 开始排查
Investigation

我首先想到的可能的原因是这个包在编译的时候开了 `-ffast-math` 或者 `-O3` 之类的优化选项,
但是找了一圈之后发现并没有找到这样的选项.

<!-- 因为这些优化选项会打破 IEEE 浮点数的兼容性 -->

当时我们觉得 x86_64 和 riscv64 上的浮点数都是 IEEE 标准的,
理所应当不应该出现行为差异. 

但是最后事实证明, 即使都是 IEEE 标准的浮点数, 
也可能有 implementation-defined 的行为. 

::right::

<img class="ml-4" src="/investigation-1.png"/>

---
layout: image-left
image: /investigation-2.png
---
# 开始排查
Investigation

因为之前版本的 OCIO 在 riscv64 上是可以顺利出包的, 2.2.0 和 2.2.1 这两个版本之间只有不到 20 个 commit,
所以我首先想到的办法是二分找出导致问题的 commit.

然而事情并不像我想的那样顺利, 
之前 OCIO 能顺利出包是因为 ArchLinux 上游没在 `PKGBUILD` 里跑测试.

在 2.2.1 版本之后, ArchLinux 上游把测试也加进去了, 这个包就开始在 riscv64 上表现出问题了.

我对 2.2.0 版本跑了一下测试, 发现它也是挂掉的, 二分法泡汤了.

那我就只好 get my hands dirty, 去调试一下代码了.

---
layout: two-cols
---

# 调试测试
Investigation

失败的测试有点多, 我就随便选了一个测试来调试.

这是 `tests/cpu/ops/gamma/GammaOpCPU_tests.cpp` 里的一个测试

我去看了 `GammaOpData`, `CreateGammaOp` 等代码的实现, 它们都很简单, 
只是在把一开始喂进去的参数传来传去, 最后存起来. 所以问题应该不在这里.

关注点在 `ApplyGamma` 这个函数.

::right::

<div style="height: 500px; overflow: scroll">

```cpp
OCIO_ADD_TEST(GammaOpCPU, apply_moncurve_mirror_style_fwd)
{
    const float errorThreshold = 1e-7f;
    const long numPixels = 9;

    float input_32f[numPixels * 4] = { ... };

    const float expected_32f[numPixels * 4] = { ... };

    OCIO::OpRcPtrVec ops;

    const OCIO::GammaOpData::Params redParams = { 2.4, 0.055 };
    const OCIO::GammaOpData::Params greenParams = { 2.2, 0.2 };
    const OCIO::GammaOpData::Params blueParams = { 2.0, 0.4 };
    const OCIO::GammaOpData::Params alphaParams = { 1.8, 0.6 };

    auto gammaData = 
      std::make_shared<OCIO::GammaOpData>(
        OCIO::GammaOpData::MONCURVE_MIRROR_FWD,
        redParams, greenParams,
        blueParams, alphaParams);
    OCIO_CHECK_NO_THROW(OCIO::CreateGammaOp(ops, gammaData, OCIO::TRANSFORM_DIR_FORWARD));
    OCIO_CHECK_NO_THROW(ops.finalize());
    OCIO_CHECK_NO_THROW(ops.optimize(OCIO::OPTIMIZATION_DEFAULT));
    OCIO_REQUIRE_EQUAL(ops.size(), 1);
    ApplyGamma(ops[0], input_32f, expected_32f, numPixels, __LINE__, errorThreshold);
}
```

</div>

---
layout: two-cols
---

# 调试测试
Debugging

`ApplyGamma` 这个函数只是应用了一下 `GammaOpCPU` 这个 op, 
然后和预期的结果比较了一下. 

这其实就是测试失败时输出错误的代码.

那么问题大概率就出在 `cpu->apply` 这里. 可以找到这个算子类的定义如下:

```cpp
class GammaMoncurveMirrorOpCPUFwd 
  : public GammaMoncurveOpCPU
{
public:
  explicit GammaMoncurveMirrorOpCPUFwd(
    ConstGammaOpDataRcPtr& gamma);
  void apply(const void* inImg, 
      void* outImg, long numPixels) const override;

protected:
  void update(ConstGammaOpDataRcPtr& gamma);
};
```


::right::

<div style="height: 500px; overflow: scroll">

```cpp
void ApplyGamma(const OCIO::OpRcPtr & op, 
                float * image, const float * result,
                long numPixels, unsigned line,
                float errorThreshold){
  const auto cpu = op->getCPUOp(true);

  OCIO_CHECK_NO_THROW_FROM(
    cpu->apply(image, image, numPixels), line);

  for(long idx=0; idx<(numPixels*4); ++idx){
    if (OCIO::IsNan(result[idx])){
      OCIO_CHECK_ASSERT_FROM(OCIO::IsNan(image[idx]), line);
      continue;
    }
    const bool equalRel = 
      OCIO::EqualWithSafeRelError(image[idx], 
        result[idx], errorThreshold, 1.0f);
    if (!equalRel){
      std::ostringstream message;
      message.precision(9);
      message << "Index: " << idx
              << " - Values: " << image[idx]
              << " and: " << result[idx]
              << " - Threshold: " << errorThreshold;
      OCIO_CHECK_ASSERT_MESSAGE_FROM(0, message.str(), line);
    }
  }
}
```

</div>

---
layout: two-cols
---

# 调试测试
Debugging

<div style="width: 17rem;">

这个函数看起来没什么问题, 里面使用的都是非常基本的浮点操作.

结果加上 log 之后, 我发现测试是在计算 `data` 数组的时候出的问题.

我一开始没有考虑传给 `std::pow` 的参数会有问题, 就以为是 `std::pow` 的问题.




</div>

<div v-click-hide="2">
  <img src="/debug-1.png" style="position: absolute; z-index: 114514; min-width: 1000px; margin-top: -10rem; margin-left: -5rem; display: hidden;" v-click="1"/>
</div>

<img src="/rv.png" v-click="3" style="position: absolute; z-index: 1919810;margin-top: -10rem; margin-left: -4rem;">

::right::

<div style="width: 40rem;margin-left: -10rem;">


```cpp
void GammaMoncurveMirrorOpCPUFwd::apply(const void* inImg, void* outImg, long numPixels) const {
  const float* in = (const float*)inImg;
  float* out = (float*)outImg;
  const float red[5] = { m_red.scale, m_red.offset, m_red.gamma, m_red.breakPnt, m_red.slope };
  const float grn[5] = { m_green.scale, m_green.offset, m_green.gamma, m_green.breakPnt, m_green.slope };
  const float blu[5] = { m_blue.scale, m_blue.offset, m_blue.gamma, m_blue.breakPnt, m_blue.slope };
  const float alp[5] = { m_alpha.scale, m_alpha.offset, m_alpha.gamma, m_alpha.breakPnt, m_alpha.slope };
  for (long idx = 0; idx < numPixels; ++idx){
    const float sign[4] = { std::copysign(1.0f, in[0]), std::copysign(1.0f, in[1]), 
                            std::copysign(1.0f, in[2]), std::copysign(1.0f, in[3]) };
    const float pixel[4] = { std::fabs(in[0]), std::fabs(in[1]), 
                             std::fabs(in[2]), std::fabs(in[3])};
    const float data[4] = { 
      std::pow(pixel[0] * red[0] + red[1], red[2]), 
      std::pow(pixel[1] * grn[0] + grn[1], grn[2]),
      std::pow(pixel[2] * blu[0] + blu[1], blu[2]), 
      std::pow(pixel[3] * alp[0] + alp[1], alp[2]) };
    out[0] = sign[0] * (pixel[0] <= red[3] ? pixel[0] * red[4] : data[0]);
    out[1] = sign[1] * (pixel[1] <= grn[3] ? pixel[1] * grn[4] : data[1]);
    out[2] = sign[2] * (pixel[2] <= blu[3] ? pixel[2] * blu[4] : data[2]);
    out[3] = sign[3] * (pixel[3] <= alp[3] ? pixel[3] * alp[4] : data[3]);
    in += 4;
    out += 4;
  }
}
```

</div>

---
layout: two-cols
---

# 调试测试
Debugging


<div style="width: 17rem;">

在中间多打印一下传给 `std::pow` 的参数, 发现确实是在计算参数的时候炸的.

<div v-click="3">

这就很奇怪了, 为什么会出现这种情况呢?

我就着手写了一个 minimal reproduction.

</div>

</div>

<div v-click-hide="2">
  <img src="/debug-2.png" style="position: absolute; z-index: 114514; min-width: 980px; margin-top: -10rem; margin-left: -4rem; display: hidden;" v-click="1"/>
</div>


::right::

<div style="width: 40rem;margin-left: -10rem;">

```cpp
void GammaMoncurveMirrorOpCPUFwd::apply(const void* inImg, void* outImg, long numPixels) const {
  const float* in = (const float*)inImg;
  float* out = (float*)outImg;
  const float red[5] = { m_red.scale, m_red.offset, m_red.gamma, m_red.breakPnt, m_red.slope };
  const float grn[5] = { m_green.scale, m_green.offset, m_green.gamma, m_green.breakPnt, m_green.slope };
  const float blu[5] = { m_blue.scale, m_blue.offset, m_blue.gamma, m_blue.breakPnt, m_blue.slope };
  const float alp[5] = { m_alpha.scale, m_alpha.offset, m_alpha.gamma, m_alpha.breakPnt, m_alpha.slope };
  for (long idx = 0; idx < numPixels; ++idx){
    const float sign[4] = { std::copysign(1.0f, in[0]), std::copysign(1.0f, in[1]), 
                            std::copysign(1.0f, in[2]), std::copysign(1.0f, in[3]) };
    const float pixel[4] = { std::fabs(in[0]), std::fabs(in[1]), 
                             std::fabs(in[2]), std::fabs(in[3])};
    const float intermediate[4] = { 
      pixel[0] * red[0] + red[1], pixel[1] * grn[0] + grn[1], 
      pixel[2] * blu[0] + blu[1], pixel[3] * alp[0] + alp[1] };
    const float data[4] = { 
      std::pow(intermediate[0], red[2]), std::pow(intermediate[1], grn[2]),
      std::pow(intermediate[2], blu[2]), std::pow(intermediate[3], alp[2]) };
    out[0] = sign[0] * (pixel[0] <= red[3] ? pixel[0] * red[4] : data[0]);
    out[1] = sign[1] * (pixel[1] <= grn[3] ? pixel[1] * grn[4] : data[1]);
    out[2] = sign[2] * (pixel[2] <= blu[3] ? pixel[2] * blu[4] : data[2]);
    out[3] = sign[3] * (pixel[3] <= alp[3] ? pixel[3] * alp[4] : data[3]);
    in += 4;
    out += 4;
  }
}
```

</div>

---
layout: two-cols
---

# Minimal Reproduction

<div class="w-100">

```cpp
#include <cmath>
#include <iostream>
using namespace std;
int pixel2Int = 0x3f400000;
int blu[2] = { 0x3f36db6e, 0x3e924925 };
float pixel2, blu0, blu1, result;

int main()
{
  pixel2 = *(float*)(&pixel2Int);
  blu0 = *(float*)(&blu[0]);
  blu1 = *(float*)(&blu[1]);
  result = pixel2 * blu0 + blu1;
  cout.precision(17);
  cout << result << endl;
  return 0;
}
```

经 Asuna🍓 提醒, 这段代码有 [UB](https://stackoverflow.com/questions/36803351/will-this-strict-aliasing-rule-violation-have-the-behavior-i-expect/36803716#36803716).
不过它在 x86_64 和 riscv64 上的行为都符合预期, 所以可以暂时不管.

可以使用 `std::bit_cast`(C++ 20) 来避免 UB.

</div>

::right::
 
为了精确起见, 我直接将导致问题的浮点数的十六进制表示写进了代码里.

解决掉 UB 之后, 代码如下:

```cpp
#include <cmath>
#include <iostream>
#include <bit>

using namespace std;

uint32_t pixel2Int = 0x3f400000;
uint32_t blu[2] = { 0x3f36db6e, 0x3e924925 };
float pixel2, blu0, blu1, result;

int main()
{
  pixel2 = bit_cast<float>(pixel2Int);
  blu0 = bit_cast<float>(blu[0]);
  blu1 = bit_cast<float>(blu[1]);
  result = pixel2 * blu0 + blu1;
  cout.precision(17);
  cout << result << endl;
  return 0;
}
```

---
layout: two-cols
---

# Minimal Reproduction
Result

![](/mr-r.png)

- g++ 在没开优化的情况下, 程序输出了预期结果.
- clang++ 在不开优化的情况下, 程序输出了非预期结果.
- 而 g++ 在 `O2` 优化下, 程序输出了非预期结果.

::right::

比对一下生成的汇编代码,

<img style="min-width:550px" src="/mr-cmp.png">

可以发现  clang 生成的代码使用了 `fmadd.s` 指令,
而 g++ 生成的代码使用了 `fmul.s` 和 `fadd.s` 两条指令.

难道这会有差异吗?

---

# 翻翻 Spec
RTFM

我去翻了翻 RISC-V 指令集文档, 发现了这么一段:

<div style="overflow: scroll;height: 400px;">
<img src="/spec.png"  >
</div>

<!-- 我看了 Spec 之后觉得 fmadd.s 和 先 fmul.s 再 fadd.s 应该没有结果上的差异. 我又写了一个汇编的 repro,  事实证明我的想法是错的. -->


---
layout: two-cols
---

# 汇编 Minimal Repro

```c
#include <stdint.h>
#include <stdio.h>
uint32_t pixel2Int = 0x3f400000;
uint32_t blu[2] = {0x3f36db6e, 0x3e924925};
float fmadd(){
  float result;
  asm("flw ft1, %1\n" "flw ft2, %2\n" "flw ft3, %3\n"
      "fmadd.s ft0, ft1, ft2, ft3\n" "fsw ft0, %0\n"
      : "=m"(result)
      : "m"(pixel2Int), "m"(blu[0]), "m"(blu[1]));
  return result;
}
float fmul_and_fadd() {
    float result;
    asm("flw ft1, %1\n" "flw ft2, %2\n" "flw ft3, %3\n"
        "fmul.s ft1, ft1, ft2\n" "fadd.s ft0, ft1, ft3\n"
        "fsw ft0, %0\n" : "=m"(result)
        : "m"(pixel2Int), "m"(blu[0]), "m"(blu[1]));
    return result;
}
int main() {
    printf("fmadd.s           : %.17f\n", fmadd());
    printf("fmul.s then fadd.s: %.17f\n", fmul_and_fadd());
    return 0;
}
```
::right::

然后, 果然是 `fmadd.s` 指令的问题.

![](/asm-1.png)

我们一开始认为是 CPU Bug, 但是发现在各种板子/模拟器上都能复现.

<!-- ![](/asm-2.png) -->
<img src="/asm-3.png" style="width: 300px;">
<img src="/asm-2.png" style="position: absolute; margin-top: -10rem;margin-left: 18rem; width: 16rem;">

---
layout: two-cols
---

# 问题根源
Cause

后来, 在 Yang 同学的帮助下, 我们发现了这个问题的根源:

![](/cause-1.png)

`fmadd` 比先`fmul`再`fadd` 少了一次写回, 也就少了一次 `round` 操作, 所以 `fmadd` 算出来的结果精度更高.

::right::

<img src="/cause-2.png" style="height: 600px;">

---
layout: two-cols
---

# 问题根源
Cause

那么, 编译器生成 `fmadd` 指令符合 IEEE 754 标准吗?

sterprim 同学找到了标准中的相关描述:

> The operation `fusedMultiplyAdd(x, y, z)` computes $(x \times y ) + z$ as if with un-
bounded range and precision, rounding only once to the destination format. No underflow, overflow, or inexact
exception (see 7) can arise due to the multiplication, but only due to the addition; and so
fusedMultiplyAdd differs from a multiplication operation followed by an addition operation.

所以说编译器对下面这类表达式生成 FMA 指令是符合 IEEE 754 标准的:

```cpp
pixel[2] * blu[0] + blu[1]
```

::right::

<div class="ml-8">

所以说, 最后的结论是 OCIO 的测试写的有问题, 他们没考虑到 FMA 指令的存在会使得计算结果的精度更高.

即使使用的都是 IEEE 754 标准的浮点数, 在不同的平台上的计算结果也可能不一样.

- 去看 gcc 的文档, 发现 `-ffp-contract` 选项默认是 `-ffp-contract=fast`, 也就是说允许编译器把多个浮点操作收缩成一个, 即默认启用 FMA.
- clang 现在默认是 `-ffp-contract=on`, 启用 FMA.
- 但是**注意 gcc 里 `-ffp-contract=on` 是等价与 `-ffp-contract=off` 的**.

> `-ffp-contract=on` enables floating-point expression contraction if allowed by the language standard. This is currently not implemented and treated equal to `-ffp-contract=off`. 


</div>

---
layout: cover
---

# End

## 在此感谢各位同学对我的 Debugging 提供的帮助

---

# References

- https://irem.univ-reunion.fr/IMG/pdf/ieee-754-2008.pdf
- https://riscv.org/wp-content/uploads/2017/05/riscv-spec-v2.2.pdf
- https://clang.llvm.org/docs/UsersManual.html
- https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html

# Bug Report

- https://github.com/AcademySoftwareFoundation/OpenColorIO/issues/1784