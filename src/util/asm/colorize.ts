import grammar from './grammar';
import tokenize from './tokenizer';

export default function colorize(str: string): string {
  return grammar.solveFor(tokenize(str))[0];
}