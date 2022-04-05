import { NonTerminal, Terminal } from "../../earley";

export class $KeywordLink extends Terminal { }
export class $KeywordEquals extends Terminal { }
export class $KeywordLParen extends Terminal { }
export class $KeywordRParen extends Terminal { }
export class $KeywordConst extends Terminal { }

export class $String extends Terminal {}
export class $Identifier extends Terminal {}

export class $Program extends NonTerminal { }
export class $Statement extends NonTerminal { }
export class $LinkStatement extends NonTerminal { }
export class $VariableDeclaration extends NonTerminal { }
export class $Expression extends NonTerminal { }
export class $InvocationExpression extends NonTerminal { }
export class $VariableReference extends NonTerminal { }