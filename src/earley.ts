import { ansi } from './util/utils';

export abstract class Token {
  l: number;
  c: number;
  value: string;
  static terminal: boolean;
  constructor(l: number, c: number, value: string) {
    this.l = l;
    this.c = c;
    this.value = value;
  }
  static toString() {
    if(this.terminal) {
      return ansi(0, 3, 2)('$') + ansi(0, 5, 3)(`${this.name.substring(1)}`)
    } else {
      return ansi(0, 2, 3)('$') + ansi(0, 3, 5)(`${this.name.substring(1)}`)
    }
  }
  valueToString() {
    return this.constructor.toString();
  }
  toString() {
    return ansi(2)('(') +
           this.valueToString() +
           ansi(2)(':') +
           ansi(3)(this.l) +
           ansi(2)(':') +
           ansi(3)(this.c) +
           ansi(2)(')')
  }
}

export class NonTerminal extends Token { static terminal: false = false };
export class Terminal extends Token { static terminal: true = true };

// these tokens are special, for formatting and generalization reasons.
export class $Newline extends Terminal { }
export class $Whitespace extends Terminal { }
export class $EOF extends Terminal { }

function isTerminal(tokenClass: TokenClass): tokenClass is TerminalTokenClass {
  return tokenClass.terminal;
}

function isNonTerminal(tokenClass: TokenClass): tokenClass is NonTerminalTokenClass {
  return !tokenClass.terminal;
}

export type TerminalTokenClass = { new(...args: any[]) : Terminal, terminal: true }
export type NonTerminalTokenClass = { new(...args: any[]) : NonTerminal, terminal: false }
export type TokenClass = TerminalTokenClass | NonTerminalTokenClass;

function getTokenClassFromToken(token: Token): TokenClass {
  return token.constructor as TokenClass;
}

class TimeMachine<T> {
  states: T[] = [];
  stateConstructor: () => T;
  constructor(fn: () => T) {
    this.stateConstructor = fn;
    this.newState();
  }
  newState() {
    this.states.push(this.stateConstructor());
  }
  get current() {
    return this.states[this.states.length - 1];
  }
  get previousState() {
    console.assert(this.states.length >= 2, 'No previous state to get.');
    return this.stateByIndex(-1);
  }
  get currentIndex() {
    return this.states.length - 1;
  }
  stateByIndex(n: number) {
    if(n >= 0) {
      console.assert(n < this.states.length, `State index ${n} does not exist`);
      return this.states[n];
    } else {
      return this.states[this.states.length - 1 + n];
    }
  }
}

export interface Production {
  left: TokenClass;
  right: TokenClass[];
  resolver?: (...args: any[]) => any;
}

export class Grammar {
  private productions: Production[];
  private startingSymbol: NonTerminalTokenClass;

  constructor(productions: Production[], startingSymbol: NonTerminalTokenClass) {
    this.productions = productions;
    this.startingSymbol = startingSymbol;
  }

  solveFor(tokens: Token[], options: { silent: boolean } = { silent: true }) {
    const state = new TimeMachine<SingleEarleyState>(() => new SingleEarleyState());

    const possibleStartingProductions = getProductionsForTokenClass(this.productions, this.startingSymbol)
    for(const production of possibleStartingProductions) {
      state.current.partialMatches.push(new PartialMatch(production, 0, state.currentIndex, []));
    }

    // expand all non terminals here again
    const expand = (partial: PartialMatch) => {
      if(partial.complete) {
        const resolvedData = partial.resolve();
        const pastPartials = state.stateByIndex(partial.source).partialMatches;
        for(const pastPartial of pastPartials) {
          if(pastPartial.nextTokenClass === partial.production.left) {
            const newPartial = pastPartial.getAdvancedCopy(resolvedData);
            expand(newPartial);
            state.current.partialMatches.push(newPartial);
          }
        }
        return;
      }
      const nextTokenClass = partial.nextTokenClass;
      if(isTerminal(nextTokenClass)) return;
      const possibleProductions = getProductionsForTokenClass(this.productions, nextTokenClass);
      for(const production of possibleProductions) {
        const partialMatch = new PartialMatch(production, 0, state.currentIndex, []);
        expand(partialMatch);
        state.current.partialMatches.push(partialMatch)
      }
    }

    state.current.partialMatches.forEach(expand);

    // expand all non terminals here

    if(!options.silent) console.log(ansi(3, 3, 0)('s') + ansi(4, 4, 0)(state.currentIndex) + ': ' + this.startingSymbol.toString());
    if(!options.silent) console.log(state.current.toString(), '\n')

    for(const token of tokens) {
      state.newState();
      if(!options.silent) console.log(ansi(3, 3, 0)('s') + ansi(4, 4, 0)(state.currentIndex) + ': ' + token.toString());

      for(const partialMatch of state.previousState.partialMatches) {
        if(partialMatch.complete) continue;
        // if our current token falls in line with what we need, then yeah, lets do it.
        if(token instanceof partialMatch.nextTokenClass) {
          state.current.partialMatches.push(partialMatch.getAdvancedCopy(token));
        }
      }

      console.assert(state.current.partialMatches.length !== 0, ansi(4, 1, 1)('unexpected token ' + token.toString()))
      if(state.current.partialMatches.length === 0) {
        if(!options.silent) console.log();
        process.exit(1);
      }

      state.current.partialMatches.forEach(expand);
      state.current.deduplicate()

      if(!options.silent) console.log(state.current.toString(), '\n')
    }

    const completedResolutions = [];

    for(const partial of state.current.partialMatches) {
      if(partial.complete && partial.source === 0) {
        completedResolutions.push(partial.resolve());
      }
    }

    return completedResolutions;
  }
}

function getProductionsForTokenClass(productions: Production[], tokenClass: TokenClass): Production[] {
  return productions.filter((p: Production) => {
    return p.left === tokenClass
  })
}

function getFirstTerminalsForTokenClass(productions: Production[], tokenClass: TokenClass): TerminalTokenClass[] {
  if(isTerminal(tokenClass)) return [tokenClass];
  const tokenClasses = getProductionsForTokenClass(productions, tokenClass).map((p: Production) => {
    return getFirstTerminalsForTokenClass(productions, p.right[0])
  }).flat();
  const tokenClassesDeduped = [... new Set(tokenClasses)];
  return tokenClassesDeduped;
}

class PartialMatch {
  readonly production: Production;
  readonly progress: number = 0;
  readonly source: number = 0;
  readonly resolvedData = [];
  constructor(production: Production, completion: number, source: number, resolvedData: any[]) {
    this.production = production;
    this.progress = completion;
    this.source = source;
    this.resolvedData = resolvedData;
  }
  get complete() {
    return this.production.right.length === this.progress;
  }
  get nextTokenClass(): TokenClass {
    return this.production.right[this.progress];
  }
  // getNextTerminal(productions: Production[]) {
  //   if()
  //   return getFirstTerminalsForTokenClass
  // }
  resolve() {
    if('resolver' in this.production) {
      return this.production.resolver(...this.resolvedData);
    } else {
      return this.resolvedData;
    }
  }
  getAdvancedCopy(resolvedData: any) {
    return new PartialMatch(this.production, this.progress + 1, this.source, [...this.resolvedData, resolvedData]);
  }
  toString() {
    const rightSide = [];
    const addDot = () => rightSide.push(ansi(5, 1, 2)('\u2022'))
    for(let i = 0; i < this.production.right.length; i++) {
      if(this.progress === i) addDot();
      rightSide.push(this.production.right[i].toString())
    }
    if(this.complete) addDot();
    return this.production.left.toString() + ansi(2, 2, 2)(' => ') + rightSide.join(' ') + ansi(2, 2, 2)(' (' + this.source + ')');
  }
}

function deduplicate<T>(arr: T[], fn: (a: T, b: T) => boolean) {
  const newArr = [];
  for(const item of arr) {
    if(!newArr.map((a) => fn(a, item)).reduce((a, b) => a || b, false)) newArr.push(item);
  }
  return newArr;
}

class SingleEarleyState {
  partialMatches: PartialMatch[] = [];
  constructor() {}

  deduplicate() {
    this.partialMatches = deduplicate(this.partialMatches, (a: PartialMatch, b: PartialMatch) => {
      return a.production === b.production
          && a.progress === b.progress
          && a.source === b.source
    })
  }

  toString() {
    return this.partialMatches.map(pm => pm.toString()).join('\n');
  }
}



