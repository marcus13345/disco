import { createTokenizer } from "../generalTokenizer";
import * as tokens from "./tokens";
import {
  $Newline,
} from "./../../earley";

const asmTokenizer = createTokenizer([
  // whitespaces
  [ /^[\r\t ]{1,}/, null],
  [ /^\n/, $Newline],

  // keywords
  [ /^section/, tokens.$Section],
  [ /^db/, tokens.$Db],
  [ /^global/, tokens.$Global],
  [ /^bits/, tokens.$Bits],
  [ /^default/, tokens.$Default],
  [ /^rel/, tokens.$Rel],
  [ /^word/, tokens.$Word],
  [ /^dword/, tokens.$DWord],
  [ /^qword/, tokens.$QWord],
  [ /^oword/, tokens.$OWord],
  
  // punctuation
  [ /^:/, tokens.$Colon],
  [ /^,/, tokens.$Comma],
  [ /^\[/, tokens.$LBracket],
  [ /^\]/, tokens.$RBracket],
  [ /^-/, tokens.$Minus],

  // instructions
  [ /^mov/, tokens.$Mov],
  [ /^push/, tokens.$Push],
  [ /^pop/, tokens.$Pop],
  [ /^syscall/, tokens.$Syscall],
  [ /^ret/, tokens.$Ret],
  [ /^je/, tokens.$Je],
  [ /^jmp/, tokens.$Jmp],
  [ /^cmp/, tokens.$Cmp],
  [ /^inc/, tokens.$Inc],

  // pseudo-instructions
  [ /^call/, tokens.$Call],

  // 8 bit general purpose registers...
  [ /^(al|ah|bl|bh|cl|ch|dl|dh)/, tokens.$Register ],
  // 16 bit general purpose registers...
  [ /^(ax|bx|cx|dx)/, tokens.$Register ],
  // 32 bit general purpose registers...
  [ /^(eax|ebx|ecx|edx)/, tokens.$Register ],
  // 64 bit general purpose registers...
  [ /^(rax|rbx|rcx|rdx)/, tokens.$Register ],
  // other registers, idk.
  [ /^(rbp|rsp|rdi|rsi)/, tokens.$Register],

  // user-defined
  [ /^[0-9]{1,}/, tokens.$Number],
  [ /^0x[0-9A-Fa-f]{1,}/, tokens.$Number],
  [ /^[A-Za-z._][A-Za-z_]{0,}/, tokens.$Identifier]
])
export default asmTokenizer;
