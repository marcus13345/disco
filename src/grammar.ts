import { Grammar, NonTerminal, Production, Terminal, Token } from "./earley";
import { AST } from './ast';

export class $KeywordLink extends Terminal { }
export class $KeywordEquals extends Terminal { }
export class $KeywordLParen extends Terminal { }
export class $KeywordRParen extends Terminal { }
export class $KeywordConst extends Terminal { }

export class $String extends Terminal {}
export class $Identifier extends Terminal {}

export class $Newline extends Terminal { }

export class $Program extends NonTerminal { }
export class $Statement extends NonTerminal { }
export class $LinkStatement extends NonTerminal { }
export class $VariableDeclaration extends NonTerminal { }
export class $Expression extends NonTerminal { }
export class $InvocationExpression extends NonTerminal { }
export class $VariableReference extends NonTerminal { }

const ps: Production[] = [
  { left: $Program, right: [$Statement], resolver: (s) => !!s ? AST.Body([s]) : AST.Body([]) },
  { left: $Program, right: [$Statement, $Program], resolver: (s, ss) => !!s ? AST.Body([s, ...ss.value]) : ss},

  { left: $Statement, right: [$Newline], resolver: () => false },
  { left: $Statement, right: [$LinkStatement], resolver: a => a },
  { left: $Statement, right: [$VariableDeclaration], resolver: a => a },
  { left: $Statement, right: [$Expression], resolver: a => a },

  { left: $Expression, right: [$String], resolver: (s: $String) => AST.String(s.value) },
  { left: $Expression, right: [$InvocationExpression], resolver: a => a },
  { left: $Expression, right: [$VariableReference], resolver: a => a },

  { left: $VariableReference, right: [$Identifier], resolver: (identifier: $Identifier) => AST.VariableReference(identifier.value) },

  { left: $InvocationExpression, right: [$Identifier, $KeywordLParen, $Expression, $KeywordRParen],
    resolver: (identifier: $Identifier, _, arg: any, __) => AST.Invocation(identifier.value, arg) },

  { left: $VariableDeclaration, right: [$KeywordConst, $Identifier, $KeywordEquals, $Expression],
    resolver: (_, identifier: $Identifier, __, value: any) => AST.Const(identifier.value, value) },

  { left: $LinkStatement, right: [$KeywordLink, $Identifier], resolver: (_, identifier: $Identifier) => AST.Link(identifier.value) },

]

const grammar = new Grammar(ps, $Program);

export default grammar;