# Todo List

- [x] colorize the assembly output
- [x] create generalTokenizer to make tokenization generic
- [ ] rewrite disco tokenizer to the new generalTokenizer
- [ ] add an EOF token to earley, and yknow, add it to the tokenizer.
- [ ] add number support
- [ ] add comment support
- [ ] add fixed length array support
- [ ] organize AST elements into classes
- [ ] better logging of the AST
- [ ] optionally artifically slow down compilation (for fun)
- [ ] implement functions
- [ ] implement some basic maths operations
- [ ] implement multi-argument invocations
- [ ] implement return values
- [ ] write a regex compiler
- [ ] write log in disco. creat a library for just doing syscalls. the rest can be done in disco

# Changelog

- fixed macos compilation to use relative addressing (i think)
- fixed a bug in the general tokenizer that failed to match some tokens properly.

---

- create generalized tokenizer
- implement assembly language grammar for syntax highlighting
- create a vscode extension for syntax highlighting

---

- compile disco code to assembly as POC
- create an AST for disco code
- implement earley grammar for disco including:
  - linking library functions
  - calling functions
  - string literals
  - string variables
- created earley parser