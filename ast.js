module.exports = {
  Body(statements)                   { return { type: 'body',   value: statements } },
  Link(identifier)                   { return { type: 'link',   value: identifier } },
  Invocation(identifier, ...args)    { return { type: 'invo',   value: identifier, args } },
  Const(name, value)                 { return { type: 'const',  value, name } },
  Int(n)                             { return { type: 'int',    value: n } },
  String(s)                          { return { type: 'string', value: s } },
  Variable(name, value)              { return { type: 'var',    value, name } },
  VariableReference(name)            { return { type: 'ref',    value: name } },
}