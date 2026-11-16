# C 语言高分全覆盖复习手册

> 以 C11 的常见期末考点为主。按类型、控制流、数据结构、内存和综合读题建立知识体系；各小节给出规则、代码及易错边界。演示片段中 printf 等需相应头文件；文件和内存接口另按片段说明使用。

## 基础语法

### 程序结构与变量声明

C 程序由函数组成，通常从 `main` 开始执行。语句以分号结束，花括号构成代码块。变量使用前要声明类型；标识符不能以数字开头，也不能使用关键字。

```c
#include <stdio.h>
int main(void) {
    int score = 88;
    printf("score=%d\n", score);
    return 0;
}
```

**读题要点**：先找入口函数，再按语句顺序执行；声明局部变量但未初始化时，值不确定。

### 基本类型与格式符

常见类型是 `char`、`int`、`float`、`double`。具体存储宽度由实现决定。字符常量用单引号，字符串用双引号；C 字符常量类型为 `int`。

| 类型/对象 | 常见用途 | 常用格式符 |
|---|---|---|
| `int` | 整数 | `printf: %d`；`scanf: %d` |
| `char` | 字符 | `%c` |
| `float` | 单精度浮点 | `printf: %f`；`scanf: %f` |
| `double` | 双精度浮点 | `printf: %f`；`scanf: %lf` |

```c
int age = 18;
char level = 'A';
double average = 92.5;
printf("%d %c %.1f\n", age, level, average);
```

### 运算、优先级与类型转换

乘除高于加减；关系运算结果为 `0` 或 `1`。赋值 `=` 和比较 `==` 不同。两个整数相除会向零截断；混合类型计算可能发生隐式转换，强制转换写作 `(类型)表达式`。

| 表达式 | 结果 | 原因 |
|---|---:|---|
| `7 / 2` | `3` | 两边都是整数 |
| `7.0 / 2` | `3.5` | 浮点运算 |
| `(double)7 / 2` | `3.5` | 显式转换 |
| `5 % 2` | `1` | 整数余数 |

```c
int a = 7, b = 2;
printf("%d\n", a / b);          /* 3 */
printf("%.1f\n", (double)a / b); /* 3.5 */
```

### 自增与输入输出

`++i` 先加后取值；`i++` 先取值后加。`scanf` 要把数据写入变量地址；格式串和参数类型必须匹配。`%c` 可能读到前一次输入留下的换行。

```c
int i = 4;
printf("%d ", i++); /* 输出 4，之后 i 为 5 */
printf("%d\n", ++i); /* 先变 6，再输出 6 */
int n;
scanf("%d", &n);
```

**避坑**：不要在一个表达式中多次修改同一变量；`scanf("%lf", &d)` 才用于读取 `double`。


### 高分易错点

- **整数除法先截断，再赋给浮点变量**：目标变量是 double 不能恢复已经丢失的小数。
- **把赋值当比较**：`if (x = 0)` 会先赋值，条件结果为假。
- **scanf 格式说明符不匹配**：读取 double 用 `%lf`，普通变量需传地址。
- **%c 读到换行**：数字输入后的换行可能留在缓冲区，格式串前加空格跳过空白。
- **自增副作用顺序复杂**：避免在同一表达式中多次修改同一变量。

```c
double avg = 3 / 2;       /* 1.0：整数除法已经截断 */
double correct = 3.0 / 2; /* 1.5 */
int x = 5;
if (x == 0) puts("zero");
scanf("%lf", &avg);
```

### 声明、初始化与赋值的区别

声明让名称和类型可见，初始化给新对象初值，赋值修改已经存在的对象。普通自动局部变量不会自动清零；文件作用域对象与局部 static 对象会零初始化。

```c
int global_count;             /* 静态存储期，初值 0 */
int main(void) {
    int count = 3;            /* 定义并初始化 */
    count = 5;               /* 赋值 */
    static int saved;         /* 初值 0，跨调用保留 */
    return 0;
}
```

### 常量、字面量与字符

`const` 限制对象经相应访问路径被修改；宏是文本替换；枚举成员是整数常量。`'A'` 是字符常量，`"A"` 是含结束符的字符数组字面量。在 C 中，普通整数字符常量的类型是 int。

```c
#define LIMIT 10
enum { CAPACITY = 8 };
const int limit = 6;
char ch = 'A';
char text[] = "A";           /* 两个 char：A 与空字符 */
```

### 表达式结果与可修改对象

赋值左侧需要可修改的对象；数组整体、常量、算术结果不能当作普通赋值目标。`=` 是赋值，`==` 是比较；赋值表达式的结果可继续参与计算。

```c
int a = 0, b = 0;
a = b = 4;                  /* 先 b=4，再 a=4 */
int same = (a == b);         /* 1 */
/* a + 1 = 5; 错：算术结果不能被赋值 */
```

## 运算规则与表达式专题

### 优先级与结合性

先看括号，再看优先级，最后看同级运算符的结合性。结合性决定表达式的分组，不等于运行时操作数的求值顺序。

| 从高到低的常用组 | 例子 | 读题提醒 |
|---|---|---|
| 后缀 | `a[i]`、`p->x`、`i++` | 点与箭头比一元解引用结合更紧 |
| 一元 | `*p`、`&x`、`!x`、`++i` | 解引用与乘法需按语境区分 |
| 乘除余、加减 | `* / %`、`+ -` | 整数除法先截断 |
| 移位、关系、相等 | `<< >>`、`< <=`、`== !=` | 位运算比较建议加括号 |
| 按位、逻辑 | `& ^ |`、`&& ||` | 只有逻辑运算短路 |
| 条件、赋值、逗号 | `?:`、`=`、`,` | 赋值从右向左；逗号结果取最后项 |

```c
int x = 6;
int even = ((x & 1) == 0);  /* 1 */
int n = 2 + 3 * 4;          /* 14 */
```

### 短路求值与副作用

`&&` 左侧为假则跳过右侧，`||` 左侧为真则跳过右侧。被跳过的自增、赋值和函数调用都不会发生。

```c
int a = 0, b = 1;
int r = a && ++b;
printf("%d %d\n", r, b);   /* 0 1 */
r = (a = 2) || ++b;
printf("%d %d\n", r, b);   /* 1 1 */
```

### 条件运算与逗号运算

条件运算符只计算被选中的一支；逗号运算符先执行左项，再执行右项，整体取右项的值。函数实参间的分隔逗号不是逗号运算符。

```c
int a = 2, b = 5;
int max = a > b ? a : b;     /* 5 */
int value = (a += 1, a * 2); /* a=3，value=6 */
```

### 类型转换与余数符号

两个整数先进行整数运算，赋给浮点变量不会恢复小数。C11 中整数除法向零截断，非零余数与被除数同号。

```c
printf("%d %d\n", -7 / 3, -7 % 3); /* -2 -1 */
printf("%.1f\n", (double)7 / 2);     /* 3.5 */
printf("%.1f\n", (double)(7 / 2));   /* 3.0 */
```

## 输入输出与格式控制

### printf 与 scanf 的类型要求

printf 根据格式读取参数值；scanf 根据格式写入参数指向的对象。float 传给 printf 时会提升为 double，但 float* 不会在 scanf 中变成 double*。

| 对象 | printf | scanf |
|---|---|---|
| int | `%d`，传值 | `%d`，传 int* |
| float | `%f`，提升后传值 | `%f`，传 float* |
| double | `%f`，传值 | `%lf`，传 double* |
| char | `%c`，提升后传值 | `%c`，传 char* |
| size_t | `%zu` | `%zu`，传 size_t* |
| 对象地址 | `%p`，转换为 void* | 不用于普通数值输入 |

```c
double price;
if (scanf("%lf", &price) == 1) {
    printf("%.2f\n", price);
}
```

### 空白、字符与输入返回值

`%d` 等转换通常跳过前导空白，`%c` 不跳过。格式串中的空白指令可以跳过一串空白。检查 scanf 返回值，避免在输入失败后读取未成功赋值的对象。

```c
int n;
char ch;
if (scanf("%d %c", &n, &ch) == 2) {
    printf("%d %c\n", n, ch);
}
/* 在线编译时，先在输入区填写，例如：12 A */
```

### 字符串读入与容量限制

`%s` 按空白分隔读取单词，应限制最多读取的字符数，并给结束符留一位。fgets 可以读取含空格的一行；若读到换行且空间足够，会把换行也存入数组。

```c
char word[8];
if (scanf("%7s", word) == 1) puts(word);
/* 另一次独立输入可用： */
/* char line[80]; if (fgets(line, sizeof line, stdin)) puts(line); */
```

### 输出宽度、精度与转义字符

宽度通常是最小宽度，不会截断超过宽度的整数。浮点精度表示小数位数；字符串精度可限制最多输出的字符数。`\n` 是换行，`\t` 是制表，`\\` 表示一个反斜杠。

```c
printf("%04d\n", 23);       /* 0023 */
printf("%.3s\n", "abcdef"); /* abc */
printf("%.1f\n", 3.21);     /* 3.2 */
```

## 分支与循环

### if 与逻辑表达式

条件值为 `0` 时为假，非零时为真。相等比较用 `==`。`&&` 和 `||` 采用短路求值：左侧已经决定结果时，右侧不再计算。

```c
int score = 76;
if (score >= 60 && score <= 100) {
    puts("pass");
} else {
    puts("check score");
}
```

**易错**：`if (score = 60)` 是赋值，不是比较；该表达式结果为 60，因此条件为真。

### switch 与 break

`switch` 根据整数或字符表达式匹配常量 `case`。命中后从该标签向下执行；`break` 退出 switch。漏写 break 会贯穿到后续分支。

```c
int grade = 2;
switch (grade) {
case 1: puts("low"); break;
case 2: puts("middle"); break;
default: puts("other");
}
```

### while、do-while 与 for

`while` 先判断，可能执行零次；`do-while` 先执行，至少一次；`for` 顺序为初始化、判断、循环体、迭代。

```c
int sum = 0;
for (int i = 1; i <= 5; i++) {
    sum += i;
}
/* sum=15；循环结束时 i=6（若作用域可见） */
```

边界对比：`i < n` 通常执行 n 次（从 0 开始）；`i <= n` 通常执行 n+1 次。循环体若修改循环变量，须重新逐轮推算。

### break、continue 与嵌套循环

`break` 结束最近一层循环或 switch；`continue` 跳过本轮剩余语句。for 遇到 continue 后仍执行迭代表达式。嵌套时只影响所在的最近一层。

```c
int sum = 0;
for (int i = 1; i <= 5; i++) {
    if (i % 2 == 0) continue;
    sum += i;
}
/* sum=1+3+5=9 */
```


### 高分易错点

- **循环边界多算或少算一次**：逐项写出首轮、末轮和退出时的 i。
- **for 后误加分号**：`for (...) ;` 会形成空循环体，后续语句只执行一次。
- **continue 跳过更新**：for 会执行迭代表达式；while 若更新在 continue 后，可能死循环。
- **switch 忘记 break**：后续 case 会贯穿执行。
- **else 配对最近的 if**：嵌套时加花括号，不要只凭缩进判断。

```c
for (int i = 0; i < 4; i++) {
    if (i == 1) continue;
    printf("%d", i);
}
/* 输出 023；continue 后仍执行 i++ */
```

### 条件真假与嵌套配对

零为假，非零为真；else 与最近的未匹配 if 配对。写花括号可以把分支范围明确下来。连续多个 if 与 if/else if 链的执行次数可能不同。

```c
int a = 1, b = 0;
if (a) {
    if (b) puts("A");
    else puts("B");         /* 输出 B */
}
```

### 循环计数、边界与退出值

分别记录进入循环的条件、循环体内的修改、循环末更新。退出值不一定是最后一次进入循环时的值；条件里的后置自增，在条件为假时也有副作用。

```c
int i = 0;
while (i++ < 3) { }
printf("%d\n", i);          /* 4：失败的判断也执行自增 */
```

### 嵌套循环与跳转范围

break 结束最近的循环或 switch；continue 作用于最近的循环。在循环内的 switch 中，break 退出 switch 后，当前轮后续语句仍可执行。

```c
int count = 0;
for (int i = 0; i < 3; i++) {
    switch (i) {
    case 1: break;           /* 只退出 switch */
    default: count++;
    }
    count++;
}
printf("%d\n", count);      /* 5 */
```

## 数组

### 一维数组与下标

数组存放同类型元素，长度为 n 时有效下标是 `0` 到 `n-1`。越界访问是未定义行为。部分初始化时，未写出的元素补零；未初始化的局部数组元素值不确定。

```c
int a[5] = {2, 4};
/* a 为 {2,4,0,0,0} */
int last = a[4]; /* 0 */
```

### 二维数组与行优先存储

`int m[2][3]` 表示 2 行 3 列，元素按行连续存储。`m[1][0]` 是线性顺序中的第 4 个元素；偏移为 `行下标*列数+列下标`。

```c
int m[2][3] = {{1,2,3},{4,5,6}};
printf("%d\n", m[1][0]); /* 4 */
```

### 字符数组与字符串

字符串末尾有 `\0`，容量必须多留一个字符。`sizeof` 对数组计算容量字节数；`strlen` 计算结束符之前的字符数。使用 `strcpy` 前需确认目标空间足够。

```c
#include <string.h>
char word[5] = "C99"; /* C、9、9、\0，剩余空间可用 */
printf("%zu %zu\n", sizeof(word), strlen(word)); /* 5 3 */
```

### 数组作为函数参数

数组传入函数时会转换为首元素指针，参数 `int a[]` 与 `int *a` 等价；长度不会自动传入。二维数组形参通常需要写明列数。

```c
int sum(const int a[], int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += a[i];
    return s;
}
```


### 高分易错点

- **下标上界写成长度**：长度 n 的合法下标是 0 到 n-1。
- **部分初始化与未初始化混淆**：缺省元素补 0；未初始化的局部数组值不确定。
- **字符串少留结束符**：n 个可见字符至少需要 n+1 个 char 空间。
- **函数形参里的 sizeof 变成指针大小**：数组传参会退化，长度需另传。
- **二维数组列数写错**：列数参与偏移计算，行列不能互换。

```c
int a[4] = {2};
for (int i = 0; i < 4; i++) printf("%d ", a[i]); /* 2 0 0 0 */
char word[4] = "cat"; /* 恰好需要 c、a、t、\0 */
```

### 数组长度、容量与逻辑长度

容量是实际分配的元素个数，逻辑长度是当前使用的元素个数。sizeof 求字节数；只有在数组没有退化为指针的位置，才能用“总大小 / 单元素大小”得到容量。

```c
int a[8] = {3, 5, 7};
size_t capacity = sizeof a / sizeof a[0]; /* 8 */
int used = 3;                            /* 由程序维护 */
printf("%zu %d\n", capacity, used);
```

### 指定初始化与二维初始化

C99 起可以用下标指定初始化。没有写出的聚合元素补零；二维数组的花括号对应每一行。

```c
int a[5] = {[2] = 7};        /* 0 0 7 0 0 */
int b[2][3] = {{1}, {2, 3}}; /* 1 0 0 / 2 3 0 */
printf("%d %d\n", a[2], b[1][2]); /* 7 0 */
```

### 数组名、首元素与整个数组

数组名在多数表达式中转换为首元素指针，但在 sizeof 和一元取地址等语境中保留数组性质。a+1 跨一个元素，&a+1 跨整个数组，二者类型不同。

```c
int a[4] = {1, 2, 3, 4};
int *element = a;            /* int * */
int (*whole)[4] = &a;        /* 指向整个数组 */
printf("%d\n", element[1]); /* 2 */
```

## 字符串与标准库

### strlen、sizeof 与嵌入的空字符

strlen 在第一个空字符处停止。sizeof 对字符数组求整个存储空间，包含所有元素，与当前字符串长度无关。

```c
#include <string.h>
char s[] = "ab\0cd";
printf("%zu %zu\n", sizeof s, strlen(s)); /* 6 2 */
```

### 复制、连接与比较

strcpy 复制含结束符的全部字符串；strcat 在目标现有字符串结尾追加；strcmp 只保证结果为负、零或正，不能假定负值恰好为 -1。

```c
#include <string.h>
char s[12] = "ab";
strcat(s, "cd");             /* abcd，需要足够容量 */
int same = strcmp(s, "abcd") == 0;
printf("%d\n", same);        /* 1 */
```

### 内存复制与重叠

memcpy 按字节复制，源与目标不能重叠；memmove 可以处理重叠区域。两者都不会按字符串规则自动补结束符。

```c
#include <string.h>
char s[8] = "abcd";
memmove(s + 1, s, 5);        /* 连同原结束符右移 */
s[0] = 'X';
printf("%s\n", s);          /* Xabcd */
```

### 字符分类与安全参数

isdigit、isalpha、toupper 等在 ctype.h 中声明。参数应为 EOF 或可表示为 unsigned char 的值；直接传负的 signed char 可能违反接口要求。

```c
#include <ctype.h>
char ch = '7';
int digit = isdigit((unsigned char)ch) != 0;
printf("%d\n", digit);      /* 1；不依赖函数真值的具体数值 */
```

## 数组算法与查找排序

### 最值与下标

最大值用首元素初始化，避免全负数组被初值 0 干扰；保存下标时，比较与更新都应围绕当前候选元素。

```c
int a[] = {-5, -2, -8};
int best = 0;
for (int i = 1; i < 3; i++)
    if (a[i] > a[best]) best = i;
printf("%d %d\n", best, a[best]); /* 1 -2 */
```

### 二分查找的边界

二分查找要求数据按相应比较规则有序。闭区间写法用 `left<=right`，排除中间项时更新为 `mid+1` 或 `mid-1`，否则可能原地死循环。

```c
int a[] = {2, 4, 6, 8, 10}, target = 8;
int left = 0, right = 4, found = -1;
while (left <= right) {
    int mid = left + (right - left) / 2;
    if (a[mid] == target) { found = mid; break; }
    if (a[mid] < target) left = mid + 1;
    else right = mid - 1;
}
/* found=3 */
```

### 冒泡与选择排序

冒泡交换相邻逆序元素，一趟把当前最大项移到右端。选择排序先找剩余区间的最小项，再与区间首项交换。读题先判断它正在完成“一趟”还是“全部排序”。

```c
int a[] = {3, 1, 2};
for (int i = 0; i < 2; i++)
    for (int j = 0; j < 2 - i; j++)
        if (a[j] > a[j + 1]) {
            int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
        }
/* a={1,2,3} */
```

### 逆序、移动与覆盖顺序

逆序交换对称下标；右移时从后往前搬，左移时从前往后搬。错误的搬移方向会用新值覆盖尚未使用的旧值。

```c
int a[5] = {1, 2, 3, 4};
for (int i = 4; i > 1; i--) a[i] = a[i - 1];
a[1] = 9;                   /* 插入后：1 9 2 3 4 */
```

### 前缀和与稳定筛选

前缀和保存“到当前位置为止”的累加结果。双下标筛选时，读下标扫描原数据，写下标只在保留元素时增加；一般保持 `write<=read` 才能原地覆盖。

```c
int a[] = {3, 2, 5, 4}, used = 0;
for (int read = 0; read < 4; read++)
    if (a[read] % 2) a[used++] = a[read];
/* 逻辑内容为 3、5，used=2；后面的旧值不属于结果 */
```

## 函数

### 声明、定义与调用

原型提供返回类型和参数类型；定义提供函数体。调用前需要可见声明。`void` 参数列表表示不接收参数。

```c
int max(int a, int b); /* 原型 */
int max(int a, int b) {
    return a > b ? a : b;
}
int bigger = max(3, 8); /* 8 */
```

### 值传递与指针参数

C 普通参数按值传递，函数拿到的是副本。修改形参不会改调用处变量；传地址后才能间接修改原对象。

```c
void set_zero(int *p) {
    *p = 0;
}
int x = 7;
set_zero(&x); /* x 变为 0 */
```

### 作用域、生命周期与返回值

局部变量只在所属代码块可见，普通局部变量离开代码块后生命周期结束。`static` 局部变量保留值到程序结束。`return` 结束当前函数；返回类型要和函数声明一致。

```c
int next_id(void) {
    static int id = 0;
    return ++id; /* 多次调用依次返回 1、2、3... */
}
```

### 递归

递归必须有可达的终止条件，并让问题规模不断减小。每次调用有独立的形参和局部变量，过深可能耗尽调用栈。

```c
int fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}
/* fact(4) = 4*3*2*1 = 24 */
```


### 高分易错点

- **普通形参按值传递**：函数内改形参不会改调用方变量；要修改原对象就传地址。
- **数组形参不含长度**：`int a[]` 在参数位置等价于指针，`sizeof(a)` 不是原数组大小。
- **返回局部变量地址**：函数退出后局部对象生命周期结束，返回其地址会悬空。
- **有返回类型的路径漏写 return**：返回值不确定，不能依赖。
- **static 局部变量不会每次重置**：多次调用共享并保留其值。

```c
int *bad(void) {
    int local = 7;
    return &local; /* 错：返回已失效对象的地址 */
}
void set_value(int *p) { *p = 7; } /* 传地址修改调用方对象 */
```

### 原型、返回路径与接口约定

原型说明参数与返回类型，不替代实现。非 void 函数应让使用到的返回路径给出返回值。无参数原型用 `(void)`；按 C11 学习时不要把空括号声明理解为明确无参数。

```c
int maximum(int, int);
int maximum(int a, int b) {
    if (a > b) return a;
    return b;               /* 假分支也有明确返回值 */
}
```

### 作用域、存储期与链接属性

作用域回答“名称在哪里可用”，存储期回答“对象何时存在”，链接属性回答“不同声明能否指向同一实体”。局部 static 是块作用域、静态存储期；文件作用域 static 通常具有内部链接。

```c
static int internal_count;  /* 文件内可引用，贯穿运行 */
int next_id(void) {
    static int value;        /* 仅函数块内可见，值保留 */
    return ++value;
}
```

### 地址参数仍然按值传递

传指针时复制的是地址值。写 `*p` 可以改目标；仅改变 p 的指向，不会改变调用方的指针变量。要改调用方指针，可传二级指针。

```c
void point_to(int **slot, int *target) {
    *slot = target;
}
int x = 8;
int *p = NULL;
point_to(&p, &x);            /* p 现在指向 x */
```

## 函数与递归专题

### 用调用帧区分每层局部变量

每次调用有独立的普通形参和局部变量。先算当前层参数，再展开子调用；得到子调用返回值后，代回当前层 return 表达式。

```c
int sum(int n) {
    if (n == 0) return 0;
    int child = sum(n - 1);
    return n + child;
}
/* sum(3)：3+sum(2) → 3+2+sum(1) → 6 */
```

### 递归前输出与返回后输出

调用前的语句按进入顺序执行，调用后的语句按返回顺序执行。不要只看最深一层，也不要把所有输出当成从左到右的一次扫描。

```c
void visit(int n) {
    if (n == 0) return;
    printf("%d", n);
    visit(n - 1);
    printf("%d", n);
}
/* visit(3) 输出 321123 */
```

### 多分支返回与递归树

两个子调用都参与返回值时，要分别求值再组合。先算小规模值可以避免反复展开整棵树。

```c
int f(int n) {
    if (n <= 1) return 1;
    int left = f(n - 1);
    int right = f(n - 2);
    return left + 2 * right;
}
/* f(0)=1，f(1)=1，f(2)=3，f(3)=5，f(4)=11 */
```

### 共享状态与静态局部变量

递归中 static 对象由各层共享，普通局部对象逐层独立。读代码时给 static 单独建一列，不能在返回时把它当成旧值自动恢复。

```c
int count_calls(int n) {
    static int calls;
    calls++;
    if (n == 0) return calls;
    return count_calls(n - 1);
}
/* 先 count_calls(2) 得 3，再 count_calls(1) 得 5 */
```

### 递归规模与结束条件

结束条件必须可达。参数每次减一、减二、除二的深度不同；存在分支时，深度与总调用次数也不是同一个数。

```c
int levels(unsigned n) {
    if (n == 0) return 0;
    return 1 + levels(n / 2);
}
/* levels(8)：8→4→2→1→0，返回 4 */
```

## 指针

### 声明、取地址与解引用

指针保存地址。`&x` 取地址，`*p` 访问目标对象。指针类型应匹配目标类型；声明后须先让指针指向有效对象再解引用。

```c
int x = 4;
int *p = &x;
*p = 9; /* x 现在为 9 */
```

### 指针与数组

`a[i]` 等价于 `*(a+i)`。指针加一会移动一个所指类型元素，不是一个字节。末尾后一位可用于比较，不能解引用。

```c
int a[] = {10, 20, 30};
int *p = a;
printf("%d %d\n", *p, *(p + 2)); /* 10 30 */
```

### 指针参数与 const

传入地址可修改调用方对象。`const int *p` 不可通过 p 改目标，但 p 可改指向；`int *const p` 指针本身不可改指向，但目标可修改。

```c
void add_one(int *p) { (*p)++; }
int n = 4;
add_one(&n); /* n 为 5 */
```

### 空指针、野指针与悬空指针

空指针不指向对象；未初始化指针地址不确定；悬空指针指向的对象生命周期已结束。以上情况都不能安全解引用。指针运算不得越过数组边界。

```c
int *p = NULL;
if (p != NULL) {
    printf("%d\n", *p); /* 只有确认非空后才解引用 */
}
```


### 高分易错点

- **声明不等于初始化**：`int *p;` 只声明指针，不能立即解引用。
- **混淆 p、*p、&p**：p 是地址值，*p 是目标对象，&p 是指针变量自身的地址。
- **指针加一不是加一个字节**：移动量由所指类型决定。
- **越界或解引用末尾后一位**：末尾后一位可比较，不能读写。
- **const 位置含义不同**：`const int *p` 限制目标修改；`int *const p` 限制指针改指向。

```c
int a[] = {10, 20, 30};
int *p = a;
printf("%d\n", *(p + 1)); /* 20：前进一个 int 元素 */
int *end = a + 3;          /* 可比较，不可解引用 */
```

### 指针加减的合法范围

指针算术应限制在同一数组及末尾后一位范围内。末尾后一位可以形成、比较和求差，不能解引用；不同无关数组的指针相减不能作为通用距离运算。

```c
int a[4];
int *begin = a, *end = a + 4;
printf("%td\n", end - begin); /* 4，不是字节距离 */
/* *end = 3; 错：end 不指向数组元素 */
```

### 二级指针与别名

先画“谁保存谁的地址”：p 保存 x 的地址，pp 保存 p 的地址。修改 `**pp` 改 x，修改 `*pp` 改 p 的指向。

```c
int x = 2, y = 9;
int *p = &x;
int **pp = &p;
**pp = 5;                   /* x=5 */
*pp = &y;                   /* p 改为指向 y */
printf("%d %d\n", x, *p);   /* 5 9 */
```

### 字符串常量与可写字符数组

`char a[]="abc"` 定义自己的字符数组，可修改内容；`const char *p="abc"` 指向字符串常量，不应修改常量存储。改变指针位置与改变字符是两件事。

```c
char a[] = "abc";
a[0] = 'x';
const char *p = "abc";
p++;                        /* 指针移到 b */
printf("%s %s\n", a, p);    /* xbc bc */
```

## 指针声明与复杂表达式

### 从变量名出发读声明

先处理括号，后看数组和函数后缀，再看星号。不要把相邻声明符中的星号共享给所有变量。

```c
int *a[3];                  /* 指针数组：三个 int* */
int (*p)[3];                /* 数组指针：指向一行三个 int */
int *x, y;                  /* x 是指针，y 是 int */
int (*operation)(int, int); /* 函数指针 */
```

### 四种常见指针表达式

先确定自增作用于指针还是目标，再区分前置与后置。后缀 ++ 比一元 * 结合更紧。

| 表达式 | 等价分组 | 修改对象 |
|---|---|---|
| `*p++` | `*(p++)` | 指针移动，表达式读取旧位置 |
| `(*p)++` | `(*p)++` | 当前元素增加，表达式取旧值 |
| `*++p` | `*(++p)` | 先移动，再读取新位置 |
| `++*p` | `++(*p)` | 先增加当前元素，再取新值 |

```c
int a[] = {4, 7};
int *p = a;
int old = *p++;
printf("%d %d\n", old, *p); /* 4 7 */
```

### const 的位置

`const int *p` 不能通过 p 改目标，但 p 可换指向；`int *const p` 固定指向，但目标可改；两者结合则同时受限。

```c
int x = 3, y = 5;
const int *read_only = &x;
read_only = &y;             /* 可以换指向 */
int *const fixed = &x;
*fixed = 8;                 /* 可以修改 x */
```

### typedef 与指针常量

typedef 表示整个类型的别名，不能按文本替换方式阅读它与 const 的关系。

```c
typedef int *IntPtr;
int x = 3;
const IntPtr p = &x;         /* 等价于 int *const p */
*p = 7;                     /* 可以改目标 */
/* p = NULL; 错：p 本身只读 */
```

### 函数指针的调用

函数指针保存兼容函数的地址，可用于把一段处理规则传给另一个函数。参数类型与返回类型应匹配。

```c
int add(int a, int b) { return a + b; }
int apply(int (*f)(int, int), int a, int b) {
    return f(a, b);
}
/* apply(add, 2, 3) 返回 5 */
```

## 结构体

### 定义、初始化与成员访问

结构体把不同类型的相关成员组合起来。结构体变量使用 `.` 访问成员；结构体指针使用 `->`。

```c
struct Student { int id; double score; };
struct Student s = {1001, 88.5};
s.score = 90.0;
```

### 结构体指针

`p->member` 等价于 `(*p).member`。括号不能省略，因为点运算符优先级高于一元解引用。

```c
struct Student *p = &s;
printf("%d %.1f\n", p->id, (*p).score);
```

### 整体赋值与结构体数组

同类型结构体可整体赋值，成员值被复制。结构体整体通常不能直接用 `==` 比较；应按成员比较。结构体数组常用于保存记录。

```c
struct Student list[2] = {{1, 80.0}, {2, 95.0}};
struct Student copy = list[1];
/* copy.score 为 95.0 */
```

### 指针成员、浅拷贝与内存布局

整体赋值会复制指针成员的地址，不会复制指针所指的数据；多个副本可能共享数据。结构体还可能包含对齐填充，`sizeof` 不一定等于成员大小简单相加。

```c
struct Record { int *value; };
int n = 3;
struct Record a = {&n};
struct Record b = a; /* a.value 和 b.value 指向同一个 n */
```


### 高分易错点

- **变量与指针的成员访问符号混用**：结构体变量用点号，结构体指针用箭头。
- **漏写解引用括号**：`(*p).score` 才等价于 `p->score`。
- **初始化顺序看成员声明顺序**：不能按成员名称自行重排初始值。
- **整体赋值只是成员复制**：含指针成员时复制的是地址，属于浅拷贝。
- **用 == 比较整个结构体或猜 sizeof**：整体通常不能直接比较；布局可能含填充字节。

```c
struct Item { int *value; };
int n = 4;
struct Item a = {&n};
struct Item b = a; /* a.value 与 b.value 指向同一个 n */
*b.value = 9;      /* n 也变成 9 */
```

### 数组成员与指针成员的复制区别

结构体整体赋值会复制数组成员的内容，也会复制指针成员的地址值。前者得到独立数组，后者通常仍指向同一目标。

```c
struct Item { char name[4]; int *score; };
int score = 80;
struct Item a = {"cat", &score};
struct Item b = a;
b.name[0] = 'b';             /* 只改 b 的数组成员 */
*b.score = 90;              /* 共享的 score 被修改 */
printf("%s %s %d\n", a.name, b.name, score); /* cat bat 90 */
```

### 结构体按值传递与返回

函数接收结构体值时获得副本；接收结构体指针时可改原对象。函数可以返回结构体值，返回值内的指针是否有效还需单独分析。

```c
struct Point { int x, y; };
struct Point shift(struct Point p) {
    p.x += 1;
    return p;
}
struct Point a = {2, 3};
struct Point b = shift(a);   /* a.x=2，b.x=3 */
```

## 结构体、联合体与枚举

### 标签与类型别名

结构体标签和 typedef 类型别名不是同一种名字。匿名结构体通过别名使用；带标签的结构体可用于自引用指针成员。

```c
typedef struct Node {
    int value;
    struct Node *next;
} Node;
Node item = {4, NULL};
```

### 联合体共享存储

union 的各成员共享存储；写入一个成员后，不能认为其它成员的旧值也被独立保留。用联合体表达多种可能的数据时，通常另存标签说明当前有效成员。

```c
enum Kind { NUMBER, LETTER };
struct Value {
    enum Kind kind;
    union { int number; char letter; } data;
};
struct Value v = {NUMBER, {.number = 42}};
if (v.kind == NUMBER) printf("%d\n", v.data.number);
```

### 枚举默认取值

未显式赋值的第一个枚举成员从 0 开始，后续成员在前一个值的基础上加一。枚举名称不是字符串。

```c
enum State { OFF, START = 3, RUN, END };
printf("%d %d %d\n", OFF, RUN, END); /* 0 4 5 */
```

### 对齐、填充与成员比较

结构体可能有成员间填充和尾部填充，不能默认整体大小等于成员大小之和。比较业务意义上的相等时，应比较成员；用 memcmp 比较整个结构体可能把填充字节也算进去。

```c
struct Point { int x, y; };
int equal(struct Point a, struct Point b) {
    return a.x == b.x && a.y == b.y;
}
```

## 链表与结构体综合

### 节点、头指针与链尾

链表通过 next 地址连接节点，节点不必在内存中相邻。头指针为 NULL 表示空表；最后一个节点的 next 通常为 NULL。

```c
struct Node { int value; struct Node *next; };
struct Node b = {7, NULL};
struct Node a = {3, &b};
for (struct Node *p = &a; p != NULL; p = p->next)
    printf("%d ", p->value); /* 3 7 */
```

### 插入和删除的连接顺序

插入时先让新节点接住原后继，再让前驱指向新节点。删除时先保存被删节点和后继，重新连边；只有确实来自动态分配的节点才可 free。

```c
struct Node { int value; struct Node *next; };
struct Node b = {7, NULL}, a = {3, &b}, added = {5, NULL};
added.next = a.next;
a.next = &added;             /* 3 → 5 → 7 */
/* a.next = added.next; 只把 added 从链中移除，不会释放它 */
```

### 动态链表的释放

释放当前节点前先保存 next，不能 free 后再读取已释放节点的成员。栈上声明的节点不能用 free 释放。

```c
struct Node { int value; struct Node *next; };
void destroy(struct Node *head) {
    while (head != NULL) {
        struct Node *next = head->next;
        free(head);         /* 前提：节点都由动态分配得到 */
        head = next;
    }
}
```

### 迭代反转链表

每轮先保存后继，再把当前节点的 next 指向已反转部分。若先改 next 而未保存后继，会丢失尚未处理的链。

```c
struct Node { int value; struct Node *next; };
struct Node *reverse(struct Node *head) {
    struct Node *prev = NULL;
    while (head != NULL) {
        struct Node *next = head->next;
        head->next = prev;
        prev = head;
        head = next;
    }
    return prev;
}
```

## 内存模型与动态分配

### 进程内存的常见布局

常见系统会把进程地址空间分成代码、全局/静态数据、动态分配区和调用栈等区域。**这是理解程序的常见实现模型，不是 C 标准规定的固定内存图**。写 C 程序时更应从对象的存储期与生命周期理解数据何时存在：局部自动对象通常随代码块进入和退出；静态对象贯穿程序运行；动态分配对象从成功分配开始，到释放结束。

```c
int global_count;             /* 静态存储期，默认初始化为 0 */
void work(void) {
    int local = 3;             /* 自动存储期，离开函数后生命周期结束 */
    static int calls;          /* 静态存储期，跨调用保留值 */
    calls++;
}
```

### malloc、calloc 与 free

`malloc(bytes)` 分配指定字节数，成功返回指向起始位置的 `void *`，失败返回空指针；分配的内容不自动清零。`calloc(count, size)` 分配数组空间并把字节初始化为零。分配完成后要检查空指针，并用 `free` 释放一次。`sizeof *p` 可减少变量类型变化时的重复维护。

```c
#include <stdlib.h>
int main(void) {
    int n = 5;
    int *a = malloc((size_t)n * sizeof *a);
    if (a == NULL) return 1;
    for (int i = 0; i < n; i++) a[i] = i * 10;
    free(a);
    a = NULL;
    return 0;
}
```

### realloc 与扩容

`realloc(p, bytes)` 尝试调整动态区大小。成功时返回新地址，原内容在新旧区域较小范围内保留；地址可能改变。失败时返回空指针，原块仍然有效。不要直接把结果覆盖唯一的原指针，否则失败时会丢失释放原块所需的地址。

```c
int n = 5;
int *a = malloc((size_t)n * sizeof *a);
if (a == NULL) return 1;
int *tmp = realloc(a, (size_t)10 * sizeof *a);
if (tmp != NULL) {
    a = tmp;       /* 成功后才更新原指针 */
    n = 10;
}
/* 失败时 a 仍指向原数组，可继续使用或释放 */
free(a);
```

### 所有权与常见内存错误

每块动态内存要有明确的释放责任。内存泄漏是分配后失去所有可用地址却没有释放；重复释放同一块、释放非动态地址、释放后继续读写都属于错误。释放动态对象后，所有指向该对象的别名都不应再解引用。

```c
int *p = malloc(sizeof *p);
if (p == NULL) return 1;
*p = 42;
free(p);
p = NULL;             /* 只清空 p；若还有别名，别名也已悬空 */
```

### 高分易错点

- C 标准不要求变量必须位于名为“栈”或“堆”的固定区域；答题以存储期、生命周期和对象语义为准。
- `malloc` 的返回内容未初始化；`calloc` 对分配区域按字节清零，不等价于所有类型语义上的“赋值 0”。
- `realloc` 失败时旧块仍有效；先接临时指针，再更新原指针。
- `free` 后不再访问对象；将一个指针设为 NULL 不会自动清理其它别名。

## 数据表示与位运算

### 整数范围、溢出与无符号运算

整数类型的宽度由实现决定，可用 `sizeof` 查看对象占用字节。无符号整数运算按模 2 的位宽回绕；有符号整数溢出在标准 C 中属于未定义行为，不能假设它一定回绕。需要固定宽度类型时可查看 `<stdint.h>` 是否提供 `int32_t` 等类型。

```c
#include <limits.h>
unsigned int u = UINT_MAX;
u = u + 1u;       /* 无符号运算按模回绕，结果为 0 */
/* int x = INT_MAX; x = x + 1; 不能依赖有符号溢出结果 */
```

### 位运算符与掩码

`&` 按位与、`|` 按位或、`^` 按位异或、`~` 按位取反、`<<` 左移、`>>` 右移。不要把位运算符与逻辑 `&&`、`||` 混淆。掩码可用于测试、设置或清除某一位；移位量必须非负并小于左操作数的位宽，带符号数移位还有额外限制，初学时优先对无符号值操作。

```c
unsigned int flags = 0u;
unsigned int mask = 1u << 3;   /* 第 3 位，从最低位按 0 开始编号 */
flags |= mask;                 /* 设置该位 */
int enabled = (flags & mask) != 0u;
flags &= ~mask;                 /* 清除该位 */
```

### 字节序与可移植性

多字节对象在内存中的字节顺序由平台决定，常见有小端和大端。C 程序不能仅凭语言规则假设某个整数在内存里一定以哪种字节序排列。需要处理文件格式或网络协议时，应按协议明确拆装字节，而不是直接把结构体内存写出去。

```c
unsigned int value = 0x12345678u;
unsigned char bytes[4];
bytes[0] = (unsigned char)(value >> 24);
bytes[1] = (unsigned char)(value >> 16);
bytes[2] = (unsigned char)(value >> 8);
bytes[3] = (unsigned char)value; /* 显式生成高位到低位的字节序列 */
```

### 高分易错点

- 无符号回绕是有定义的模运算；有符号溢出不能按“补码自然回绕”推答案。
- `&` / `|` 与 `&&` / `||` 是不同运算符，短路行为只属于逻辑运算。
- 左移表达式先看操作数类型和移位量，不能把所有移位都当成安全乘 2。
- 字节序是实现细节；二进制文件和网络数据应显式编码。

## 预处理、编译与链接

### 预处理指令与头文件

预处理器在编译前处理 `#include`、`#define` 和条件编译。头文件通常放函数声明、类型定义和宏；函数定义一般放在 `.c` 源文件中。头文件保护可避免同一头文件被重复包含导致重复声明定义问题。

```c
#ifndef SCORE_H
#define SCORE_H
int max_score(int a, int b);  /* 声明 */
#endif
```

### 宏与函数的区别

对象式宏会做文本替换，不进行普通函数参数类型检查。带参数宏应给参数和整体加括号；宏参数若出现多次，传入的自增表达式可能被求值多次。简单计算通常优先用函数或 `static inline`（课程标准支持时）。

```c
#define SQUARE(x) ((x) * (x))
int a = 3;
int result = SQUARE(a + 1); /* 展开后括号确保得到 (a+1)*(a+1) */
```

### 编译、目标文件与链接

常见构建流程可概括为预处理、编译、汇编、链接。编译阶段检查单个源文件的语法并生成目标文件；链接阶段把目标文件和库组合，解析外部符号。头文件中的函数原型让调用处知道接口，但不等于函数本体；函数定义缺失通常会在链接阶段表现为未定义引用。

```c
/* main.c */
#include <stdio.h>
int add(int, int);                 /* 声明 */
int main(void) { printf("%d\\n", add(2, 3)); }

/* math_part.c */
int add(int a, int b) { return a + b; } /* 定义 */
```

### extern 与 static 的可见性

文件作用域对象和函数默认具有外部链接（除非另有限定），可由其他源文件引用；文件作用域的 `static` 名称只在当前源文件可见。局部 `static` 变量则是块作用域但静态存储期，两个概念不要混为一谈。

```c
/* counter.c */
static int internal_count;  /* 仅本源文件可见 */
int public_count;           /* 可由其他文件用 extern 声明引用 */
```

### 高分易错点

- 头文件中的声明与 `.c` 文件中的定义职责不同；声明不能替代函数实现。
- `#define` 是文本替换，宏表达式要为参数和整体加括号。
- 文件作用域 `static` 控制链接可见性；块作用域 `static` 控制存储期，不能混淆。
- 多文件程序需把相关源文件都交给构建命令，否则可能编译通过但链接失败。

## 文件输入输出

### 打开模式与失败判断

fopen 成功后返回 FILE*，失败返回 NULL。`r` 读已有文件，`w` 创建或清空后写，`a` 在末尾追加。二进制模式在相应模式后加 b。

```c
#include <stdio.h>
int main(void) {
    FILE *fp = fopen("score.txt", "w");
    if (fp == NULL) return 1;
    fprintf(fp, "%d\n", 88);
    fclose(fp);
    return 0;
}
```

### 以读取结果控制循环

不要用 `while(!feof(fp))` 预测下一次能否读到数据。EOF 标志通常在读取失败后才设置，应直接判断 fscanf、fgets 或 fgetc 的返回值。

```c
int value;
while (fscanf(fp, "%d", &value) == 1) {
    printf("%d\n", value);
}
```

### fgetc 的返回类型

fgetc 返回 int，以便既表示所有 unsigned char 值，又表示 EOF。先用 char 接收可能丢失区分 EOF 的信息。

```c
int ch;
while ((ch = fgetc(fp)) != EOF) {
    putchar(ch);
}
```

### 二进制块读写

fread、fwrite 的返回值是成功处理的元素个数，不是必然等于请求的数量。直接写结构体内存不适合作为可移植文件格式。

```c
unsigned char bytes[16];
size_t count = fread(bytes, 1, sizeof bytes, fp);
/* count 是本次实际读取的字节数，因为每个元素大小为 1 */
```

## 常见错误与未定义行为

### 未定义、未指定与实现定义

未定义行为没有可依赖的结果；未指定行为允许多个结果且不要求说明选哪个；实现定义要求实现给出所选规则。题目没交代平台时，不要把本机观察当成标准结论。

```c
int a[3] = {1, 2, 3};
/* printf("%d", a[3]); 未定义行为，不能填“随机数”当作保证 */
/* int x=INT_MAX; x++; 有符号溢出，不能保证回绕 */
```

### 修改副作用与求值顺序

不要按“从左到右”猜测 `i++ + ++i`，也不要依赖函数实参的求值顺序来传递共享状态。拆成独立语句更容易确定结果。

```c
int i = 1;
int first = i++;
int second = ++i;
printf("%d %d %d\n", first, second, i); /* 1 3 3 */
```

### 数组越界与无效地址

越界下标、空指针解引用、未初始化指针、释放后访问都不能得到稳定标准答案。“编译通过”不能证明运行行为合法。

```c
int *p = NULL;
if (p != NULL) printf("%d\n", *p);
/* 数组访问前还需确认 0<=index 且 index<length */
```

### 格式错误与对象类型不匹配

可变参数函数依赖格式串解释参数；传错指针类型不只是显示格式问题，可能直接写坏内存。强制转换指针不能修复目标对象类型错误。

```c
double d;
if (scanf("%lf", &d) == 1) printf("%f\n", d);
/* scanf("%d", &d); 错：%d 要 int*，不是 double* */
```

## 长程序阅读与手算

### 先固定输出目标

找出所有 printf、puts、putchar 和返回值。标记空格、换行、输出次数；区分“最终变量值”与“之前已经输出的旧值”。

```c
int x = 2;
printf("%d ", x++);         /* 已输出 2 */
x *= 3;
printf("%d\n", x);         /* 再输出 9 */
```

### 为循环建状态表

每行记录“进入条件时 → 循环体结束 → 更新后”。遇到 continue 时标出被跳过的语句，遇到 break 时标出是否还会执行本轮更新。

```c
int s = 0;
for (int i = 1; i <= 4; i++) {
    if (i == 2) continue;
    s += i;
}
/* i=1/2/3/4 时 s 依次为 1/1/4/8 */
```

### 为指针建指向表

分别列出变量的值、指针指向的对象、数组被改写的元素。先看操作改的是地址还是内容，再更新指向关系。

```c
int a = 2, b = 5;
int *p = &a, *q = &b;
p = q;                      /* p、q 都指向 b */
*p += 3;                    /* b=8 */
q = &a;                     /* q 指向 a，p 仍指向 b */
printf("%d %d\n", *p, *q);  /* 8 2 */
```

### 完整综合示例：递归修改数组

进入递归时先修改当前元素，返回时再读取可能已被其它层修改的共享数组。普通局部 old 属于各自调用帧，a 指向的数组则共享。

```c
#include <stdio.h>
int update(int a[], int n) {
    if (n == 0) return 0;
    int old = a[n - 1];
    a[n - 1] += n;
    return old + update(a, n - 1);
}
int main(void) {
    int a[] = {1, 2, 3};
    int sum = update(a, 3);
    printf("%d %d %d %d\n", sum, a[0], a[1], a[2]);
    return 0;
}
/* 输出 6 2 4 6：返回旧值之和，同时原数组逐项修改 */
```

## 综合读题流程

1. **认类型**：标出整数、浮点、数组、指针和结构体。
2. **拆表达式**：按括号、优先级、结合性和类型转换计算。
3. **追踪状态**：逐行记录变量值、数组元素和指针指向。
4. **查边界**：循环终止值、数组下标、字符串结束符、指针有效性。
5. **核对控制流**：if/else 配对、switch 贯穿、break/continue 范围、return。
6. **手算后再选项**：不要只凭语法印象或数学直觉。

> 这是通用复习底稿；正式课程资料与题库应按学校大纲、教材和往年试卷校订。

## 考前综合速查

### 数据与表达式检查

| 检查项 | 先问自己 |
|---|---|
| 除法 | 运算发生前，两个操作数是否都为整数？ |
| 条件 | 有没有把 = 当成 ==？逻辑运算是否短路？ |
| 自增 | 修改的是指针还是目标？取旧值还是新值？ |
| sizeof | 这里仍是数组，还是已调整为指针形参？ |
| 字符串 | 容量是否足够？第一个空字符在哪里？ |

```c
int a[] = {2, 4, 6};
size_t n = sizeof a / sizeof a[0];
printf("%zu %.1f\n", n, (double)7 / 2); /* 3 3.5 */
```

### 控制流与生命周期检查

| 检查项 | 先问自己 |
|---|---|
| 循环 | 首轮、末轮、失败判断和退出值分别是什么？ |
| switch | 从哪个标签开始？在哪里遇到 break？ |
| 函数 | 修改副本还是原对象？每条被使用的返回路径都有值吗？ |
| 递归 | 参数如何接近终点？返回时还有哪些操作？ |
| 指针 | 对象还存在吗？是否越界、已释放、未初始化？ |

```c
int n = 3;
int *p = &n;
(*p)++;                     /* 改的是 n，不是 p */
printf("%d\n", n);          /* 4 */
```

### 四档训练应该掌握什么

基础：认识类型、语法、格式和常见规则。应用：能独立追踪短代码。综合：同时处理边界、指针与作用域。挑战：能按调用栈和共享状态读完整长程序。

```c
/* 阅读递归题时先算出小规模值，再求目标值 */
int f(int n) {
    if (n <= 1) return 1;
    return f(n - 1) + f(n - 2);
}
/* f0=1，f1=1，f2=2，f3=3，f4=5 */
```
