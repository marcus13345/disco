import { Terminal, NonTerminal } from "../../earley";

// Instruction keywords...
export class $Mov extends Terminal { }
export class $Push extends Terminal { }
export class $Pop extends Terminal { }
export class $Call extends Terminal { }
export class $Syscall extends Terminal { }
export class $Ret extends Terminal { }
export class $Je extends Terminal { }
export class $Inc extends Terminal { }
export class $Cmp extends Terminal { }
export class $Jmp extends Terminal { }

// keywords
export class $Section extends Terminal { }
export class $Global extends Terminal { }
export class $Db extends Terminal { }
export class $LBracket extends Terminal { }
export class $RBracket extends Terminal { }
export class $Comma extends Terminal { }
export class $Colon extends Terminal { }
export class $Minus extends Terminal { }
export class $Bits extends Terminal { }
export class $Default extends Terminal { }
export class $Rel extends Terminal { }
export class $Word extends Terminal { }
export class $DWord extends Terminal { }
export class $QWord extends Terminal { }
export class $OWord extends Terminal { }

// varying tokens
export class $Identifier extends Terminal { }
export class $String extends Terminal { }
export class $Number extends Terminal { }
export class $Register extends Terminal { }

// non terminals
export class $Line extends NonTerminal { }
export class $PointerDereference extends NonTerminal { }
export class $Program extends NonTerminal { }
export class $CompoundString extends NonTerminal { }
export class $Value extends NonTerminal { }
export class $DataSize extends NonTerminal { }