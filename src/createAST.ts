import * as chalk from 'chalk';

const rgb2ansi = (r: number, g: number, b: number) => r * 36 + g * 6 + b + 16
const ansi = (r: number, g = r, b = r) => chalk.ansi256(rgb2ansi(r, g, b));

abstract class Token {
  l: number;
  c: number;
  static terminal: boolean;
  constructor(l: number, c: number) {
    this.l = l;
    this.c = c;
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
class NonTerminal extends Token { static terminal: false = false };
class Terminal extends Token { static terminal: true = true };

function isTerminal(tokenClass: TokenClass): tokenClass is TerminalTokenClass {
  return tokenClass.terminal;
}

function isNonTerminal(tokenClass: TokenClass): tokenClass is NonTerminalTokenClass {
  return !tokenClass.terminal;
}

type TerminalTokenClass = { new(...args: any[]) : Terminal, terminal: true }
type NonTerminalTokenClass = { new(...args: any[]) : NonTerminal, terminal: false }
type TokenClass = TerminalTokenClass | NonTerminalTokenClass;

// class Identifier extends Token { constructor(l, c, value) { super(l, c); this.value = value; } }
class $Number extends Terminal { value: string; constructor(l: number, c: number, value: string) { super(l, c); this.value = value; } }
class $Plus extends Terminal { }
class $Times extends Terminal { }
class $Term extends NonTerminal { }
class $Poop extends NonTerminal { }
class $Addition extends NonTerminal { }

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

interface Production {
  left: TokenClass;
  right: TokenClass[];
  // resolver: (...args: any[]) => any;
}

class Grammar {
  private productions: Production[];
  private startingSymbol: NonTerminalTokenClass;

  constructor(productions: Production[], startingSymbol: NonTerminalTokenClass) {
    this.productions = productions;
    this.startingSymbol = startingSymbol;
  }

  solveFor(tokens: Token[]) {
    const state = new TimeMachine<SingleEarleyState>(() => new SingleEarleyState());

    const possibleStartingProductions = getProductionsForTokenClass(this.productions, this.startingSymbol)
    for(const production of possibleStartingProductions) {
      state.current.partialMatches.push(new PartialMatch(production, 0, state.currentIndex));
    }

    // expand all non terminals here again
    const expand = (partial: PartialMatch) => {
      if(partial.complete) {
        const pastPartials = state.stateByIndex(partial.source).partialMatches;
        for(const pastPartial of pastPartials) {
          if(pastPartial.nextTokenClass === partial.production.left) {
            const newPartial = pastPartial.getAdvancedCopy();
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
        const partialMatch = new PartialMatch(production, 0, state.currentIndex);
        expand(partialMatch);
        state.current.partialMatches.push(partialMatch)
      }
    }

    state.current.partialMatches.forEach(expand);

    // expand all non terminals here

    console.log(ansi(3, 3, 0)('s') + ansi(4, 4, 0)(state.currentIndex) + ': ' + this.startingSymbol.toString());
    console.log(state.current.toString(), '\n\n')

    for(const token of tokens) {
      state.newState();
      console.log(ansi(3, 3, 0)('s') + ansi(4, 4, 0)(state.currentIndex) + ': ' + token.toString());

      for(const partialMatch of state.previousState.partialMatches) {
        if(partialMatch.complete) continue;
        // if our current token falls in line with what we need, then yeah, lets do it.
        if(token instanceof partialMatch.nextTokenClass) {
          state.current.partialMatches.push(partialMatch.getAdvancedCopy());
        }
      }

      console.assert(state.current.partialMatches.length !== 0, ansi(4, 1, 1)('unexpected token ' + token.toString()))

      state.current.partialMatches.forEach(expand);
      state.current.deduplicate()

      console.log(state.current.toString(), '\n\n')
    }
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
  constructor(production: Production, completion: number, source: number) {
    this.production = production;
    this.progress = completion;
    this.source = source;
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
  getAdvancedCopy() {
    return new PartialMatch(this.production, this.progress + 1, this.source);
  }
  toString() {
    const rightSide = [];
    const addDot = () => rightSide.push(ansi(5, 1, 2)('\u2022'))
    for(let i = 0; i < this.production.right.length; i++) {
      if(this.progress === i) addDot();
      rightSide.push(this.production.right[i].toString())
    }
    if(this.complete) addDot();
    return this.production.left.toString() + ansi(2, 2, 2)(' => ') + rightSide.join(' ') + ansi(2, 2, 2)(' (' + this.source + ')')
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

const tokens: Token[] = [
  new $Number(1, 1, '45'),
  new $Plus(1, 3),
  new $Number(1, 1, '45'),
  new $Times(1, 3),
  new $Number(1, 1, '45'),
  new $Plus(1, 3),
  new $Number(1, 1, '45'),
]


const ps: Production[] = [
  {
    left: $Term, right: [$Addition, $Times, $Addition]
  },
  {
    left: $Addition, right: [$Number, $Plus, $Number]
  },
]

const grammar = new Grammar(ps, $Term);

console.log(grammar.solveFor(tokens));

// console.log(getFirstTerminalsForTokenClass(ps, $Term))
