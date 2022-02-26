

section .data
  

section .bss
  stackArguments resb 64
  trip resb 8 ; temporary return instruction pointer (for stack manipulation)
  ; tem resb 64

section .text
  global _start

_start:
  push text
  call _print
  call _exit

_print:
  ; first we remove the params from the stack
  ; remembering to not fuck up our return pointer
  pop qword [trip]  ; pop old instruction pointer, save for later.
  pop rax  ; pop first argument
  push qword [trip] ; push the old execution pointer back

  ; reset base stack to here.
  push rbp
  mov rbp, rsp

  ; push in our arguments
  push rax
  ; rbp+0  => old base pointer
  ; rbp+8  => old instruction pointer
  ; rbp+16 => last param
  ; rbp+24 => first param
  
  mov rax, 1
  mov rdi, 1
  mov rsi, [rbp - 8]
  mov rdx, 4
  syscall

  ; pop variables (arguments) off stack
  add rsp, 8
  pop rbp
  ret

_exit:
  mov rax, 60
  mov rdi, 0
  syscall
  ret