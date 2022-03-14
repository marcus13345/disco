import { Terminal } from "../../earley";

// Instruction keywords...
export class $Mov extends Terminal {}
export class $Push extends Terminal {}
export class $Pop extends Terminal {}
export class $Call extends Terminal {}
export class $Syscall extends Terminal {}
export class $Ret extends Terminal {}
export class $Je extends Terminal {}
export class $Inc extends Terminal {}
export class $Cmp extends Terminal {}
export class $Jmp extends Terminal {}

export class $Identifier extends Terminal {}