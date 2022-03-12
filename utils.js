const chalk = require('chalk');

module.exports.printTokens = function printTokens(tokens) {
  for(const token of tokens) {
    if(token.type === 'NEWLINE') {
      process.stdout.write(chalk.bgRedBright.black(' LF ') + '  ');
      continue;
    }
    const correctedToken = ('value' in token ? token.type + ':' + token.value : token.type)
      .replaceAll('\n', chalk.inverse('LF'))
      .replaceAll('\r', chalk.inverse('CR'))
      .replaceAll('\t', chalk.inverse('TB'))
      .replaceAll('\n', chalk.inverse('LF'))
    process.stdout.write(`${chalk.grey('(')}${chalk.cyanBright(correctedToken)}${chalk.grey(')')}  `);
  }
  console.log();
}

module.exports.printProductions = function printProductions(productions) {
  for(const resolvedName in productions) {
    for(const [production, resolver] of productions[resolvedName]) {
      console.log(chalk.green.inverse(resolvedName), chalk.grey('->'), production.map(v => typeof v === 'function' ? chalk.red(v.name) : chalk.green(v)).join(' '));
    }
  }
}