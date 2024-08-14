SECTIONS {
  . = 0x40000000;   /* 0x8000 para Raspberry Pi, 0x40000000 para qemu */
  .text : { 
     boot.o(.text)
     *(.text) 
  }

  . = ALIGN(4);
  .data : { *(.data) }

  . = ALIGN(4);
  bss_begin = .;
  .bss : { *(.bss*) }
  bss_end = .;

  . = ALIGN(8);
  . = . + 8K;
  stack_svr = .;
}