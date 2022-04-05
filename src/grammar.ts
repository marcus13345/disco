import { $Newline, Grammar, NonTerminal, Production, Terminal, Token } from "./earley";
import { AST } from './ast';
import * as t from './util/disco/tokens';

const ps: Production[] = [
  { left: t.$Program, right: [t.$Statement], resolver: (s) => !!s ? AST.Body([s]) : AST.Body([]) },
  { left: t.$Program, right: [t.$Statement, t.$Program], resolver: (s, ss) => !!s ? AST.Body([s, ...ss.value]) : ss},

  { left: t.$Statement, right: [$Newline], resolver: () => false },
  { left: t.$Statement, right: [t.$LinkStatement], resolver: a => a },
  { left: t.$Statement, right: [t.$VariableDeclaration], resolver: a => a },
  { left: t.$Statement, right: [t.$Expression], resolver: a => a },

  { left: t.$Expression, right: [t.$String], resolver: (s: t.$String) => AST.String(s.value) },
  { left: t.$Expression, right: [t.$InvocationExpression], resolver: a => a },
  { left: t.$Expression, right: [t.$VariableReference], resolver: a => a },

  { left: t.$VariableReference, right: [t.$Identifier], resolver: (identifier: t.$Identifier) => AST.VariableReference(identifier.value) },

  { left: t.$InvocationExpression, right: [t.$Identifier, t.$KeywordLParen, t.$Expression, t.$KeywordRParen],
    resolver: (identifier: t.$Identifier, _, arg: any, __) => AST.Invocation(identifier.value, arg) },

  { left: t.$VariableDeclaration, right: [t.$KeywordConst, t.$Identifier, t.$KeywordEquals, t.$Expression],
    resolver: (_, identifier: t.$Identifier, __, value: any) => AST.Const(identifier.value, value) },

  { left: t.$LinkStatement, right: [t.$KeywordLink, t.$Identifier], resolver: (_, identifier: t.$Identifier) => AST.Link(identifier.value) },

]

const grammar = new Grammar(ps, t.$Program);

export default grammar;