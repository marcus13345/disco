import { Grammar, Production, $Newline } from "../../earley";
import { ansi } from "../utils";
import * as t from "./tokens";

// add EOF token to basic shit, and always add it to tokenizer
// const grammar = new Grammar(ps, );
type ansiRGB = [number, number, number];

const registerColor: ansiRGB = [5, 3, 0];
const numberColor: ansiRGB = [4, 4, 0];
const keywordColor: ansiRGB = [2, 4, 0];
const instructionColor: ansiRGB = [5, 1, 4];
const syscallColor: ansiRGB = [5, 1, 5];
const identifierColor: ansiRGB = [0, 4, 5];
const pointerColor: ansiRGB = [3, 0, 5];

export default new Grammar([
  { left: t.$Program, right: [t.$Line], resolver: (s) => !!s ? s : '' },
  { left: t.$Program, right: [t.$Line, $Newline, t.$Program], resolver: (s, _, ss) => !!s ? s + '\n' + ss : ss},

  // lines that arent instructions? idk man.
  { left: t.$Line, right: [t.$Section, t.$Identifier],
    resolver: (_, identifier) => `${ansi(...keywordColor).bold('section')} ${ansi(...identifierColor)(identifier.value)}` },
  { left: t.$Line, right: [t.$Identifier, t.$Db, t.$CompoundString],
    resolver: (identifier, _, ns) => `  ${ansi(...identifierColor)(identifier.value)} ${ansi(...keywordColor).bold('db')} ${ns}` },
  { left: t.$Line, right: [t.$Global, t.$Identifier],
    resolver: (_, {value}) => `  ${ansi(...keywordColor).bold('global')} ${ansi(...identifierColor)(value)}` },
  { left: t.$Line, right: [t.$Identifier, t.$Colon], resolver: ({value}) => `${ansi(...identifierColor)(value)}:` },
  { left: t.$Line, right: [t.$Bits, t.$Number], resolver: (_, n) => `${ansi(...keywordColor).bold('bits')} ${ansi(...numberColor)(n.value)}`},
  { left: t.$Line, right: [t.$Default, t.$Rel], resolver: () => `${ansi(...keywordColor).bold('default')} ${ansi(...keywordColor).bold('rel')}`},

  // actual instructions
  { left: t.$Line, right: [t.$Push, t.$DataSize, t.$LBracket, t.$Rel, t.$Identifier, t.$RBracket],
    resolver: (_, size, __, ___, identifier) => `  ${ansi(...instructionColor)('push')} ${size} ${ansi(...pointerColor)('[')}${ansi(...keywordColor).bold('rel')} ${ansi(...identifierColor)(identifier.value)}${ansi(...pointerColor)(']')}` },
  { left: t.$Line, right: [t.$Push, t.$Value], resolver: (_, v) => `  ${ansi(...instructionColor)('push')} ${v}` },
  { left: t.$Line, right: [t.$Pop, t.$Value], resolver: (_, v) => `  ${ansi(...instructionColor)('pop')} ${v}` },
  { left: t.$Line, right: [t.$Cmp, t.$Register, t.$Comma, t.$Value],
    resolver: (_, register, __, value) => `  ${ansi(...instructionColor)('cmp')} ${ansi(...registerColor)(register.value)}, ${value}`},
  { left: t.$Line, right: [t.$Je, t.$Identifier], resolver: (_, {value}) => `  ${ansi(...instructionColor)('je')} ${ansi(...identifierColor)(value)}` },
  { left: t.$Line, right: [t.$Jmp, t.$Identifier], resolver: (_, {value}) => `  ${ansi(...instructionColor)('jmp')} ${ansi(...identifierColor)(value)}` },
  { left: t.$Line, right: [t.$Ret], resolver: () => `  ${ansi(...keywordColor).bold('ret')}`},
  { left: t.$Line, right: [t.$Inc, t.$Register], resolver: (_, register) => `  ${ansi(...instructionColor)('inc')} ${ansi(...registerColor)(register.value)}` },
  { left: t.$Line, right: [t.$Syscall], resolver: () => `  ${ansi(...syscallColor).bold('syscall')}` },
  { left: t.$Line, right: [t.$Mov, t.$Register, t.$Comma, t.$Value],
    resolver: (_, register, __, value) => `  ${ansi(...instructionColor)('mov')} ${ansi(...registerColor)(register.value)}, ${value}` },
  { left: t.$Line, right: [t.$Mov, t.$Register, t.$Comma, t.$PointerDereference],
    resolver: (_, register, __, value) => `  ${ansi(...instructionColor)('mov')} ${ansi(...registerColor)(register.value)}, ${value}` },
  { left: t.$Line, right: [t.$Call, t.$Identifier], resolver: (_, {value}) => `  ${ansi(...keywordColor).bold('call')} ${ansi(...identifierColor)(value)}` },

  { left: t.$PointerDereference, right: [t.$LBracket, t.$Value, t.$Minus, t.$Number, t.$RBracket],
    resolver: (_, v, __, n) => `${ansi(...pointerColor)('[')}${v}-${ansi(...numberColor)(n.value)}${ansi(...pointerColor)(']')}` },
  { left: t.$PointerDereference, right: [t.$LBracket, t.$Value, t.$RBracket], resolver: (_, v) => `${ansi(...pointerColor)('[')}${v}${ansi(...pointerColor)(']')}` },

  { left: t.$Value, right: [t.$Number], resolver: (v) => ansi(...numberColor)(v.value) },
  { left: t.$Value, right: [t.$Register], resolver: (v) => ansi(...registerColor)(v.value) },
  { left: t.$Value, right: [t.$Identifier], resolver: (v) => ansi(...identifierColor)(v.value) },

  { left: t.$CompoundString, right: [t.$Number], resolver: (n) => ansi(...numberColor)(n.value) },
  { left: t.$CompoundString, right: [t.$Number, t.$Comma, t.$CompoundString], resolver: (n, _, ns) => ansi(...numberColor)(n.value) + ',' + ns },

  { left: t.$DataSize, right: [t.$Word], resolver: (v) => ansi(...keywordColor).bold(v.value) },
  { left: t.$DataSize, right: [t.$DWord], resolver: (v) => ansi(...keywordColor).bold(v.value) },
  { left: t.$DataSize, right: [t.$QWord], resolver: (v) => ansi(...keywordColor).bold(v.value) },
  { left: t.$DataSize, right: [t.$OWord], resolver: (v) => ansi(...keywordColor).bold(v.value) },
], t.$Program);