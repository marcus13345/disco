import { createTokenizer } from "../generalTokenizer";
import * as tokens from "./tokens";
import {
  $Newline,
} from "./../../earley";

export default createTokenizer([
  { match: /^[\r\t ]{1,}$/, token: null },
  { match: 'section', token: tokens.$Section },
  { match: 'db', token: tokens.$Db },
  { match: 'global', token: tokens.$Global },
  { match: '\n', token: $Newline },
  { match: ':', token: tokens.$Colon },
  { match: ',', token: tokens.$Comma },
  { match: '[', token: tokens.$LBracket },
  { match: ']', token: tokens.$RBracket },
  { match: '-', token: tokens.$Minus },
  { match: 'mov', token: tokens.$Mov },
  { match: 'push', token: tokens.$Push },
  { match: 'pop', token: tokens.$Pop },
  { match: 'call', token: tokens.$Call },
  { match: 'syscall', token: tokens.$Syscall },
  { match: 'ret', token: tokens.$Ret },
  { match: 'je', token: tokens.$Je },
  { match: 'jmp', token: tokens.$Jmp },
  { match: 'cmp', token: tokens.$Cmp },
  { match: 'inc', token: tokens.$Inc },
  { match: /^[0-9]{1,}$/, token: tokens.$Number },
  { match: /^(rbp|rsp|rax|rcx|rbx|rdx|rdi|rsi|al|bl|cl|dl|ah|bh|ch|dh|ax|bx|cx|dx|eax|ebx|ecx|edx)$/, token: tokens.$Register },
  { match: /^[A-Za-z._][A-Za-z_]{0,}$/, token: tokens.$Identifier },
])