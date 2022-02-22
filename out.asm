section .data
  YMYJYNCD db "Hello World",10,0
section .text
  global _start

_start:
  mov rax, YMYJYNCD
  call _log

  call _exit

_exit:
  mov rax, 60
  mov rdi, 0
  syscall

_log:
  push rax
  mov rbx, 0
_log_loop:
  mov cl, [rax]
  cmp cl, 0
  je _log_loop_end
  inc rax
  inc rbx
  jmp _log_loop
_log_loop_end:
  mov rdx, rbx
  mov rax, 1
  mov rdi, 1
  pop rsi
  syscall
  ret