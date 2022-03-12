export const AST = {
  Body(statements: any[]): any {
    return {
      type: 'body',
      value: statements
    }
  },
  Link(identifier: any): any                   { return { type: 'link',   value: identifier } },
  Invocation(identifier: any, ...args: any[]): any    { return { type: 'invo',   value: identifier, args } },
  Const(name: any, value: any): any                 { return { type: 'const',  value, name } },
  Int(n: any): any                             { return { type: 'int',    value: n } },
  String(s: any): any                          { return { type: 'string', value: s } },
  Variable(name: any, value: any): any              { return { type: 'var',    value, name } },
  VariableReference(name: any): any            { return { type: 'ref',    value: name } },
}