import * as chalk from 'chalk';
import { Token, $Newline } from '../earley';

export function printTokens(tokens: Token[]) {
  for(const token of tokens) {
    process.stdout.write(token.toString() + '  ');
    if(token instanceof $Newline) console.log();
  }
  console.log();
}

const rgb2ansi = (r: number, g: number, b: number) => r * 36 + g * 6 + b + 16
export const ansi = (r: number, g = r, b = r) => chalk.ansi256(rgb2ansi(r, g, b));
