from pygdbmi.gdbcontroller import GdbController
import subprocess

class GdbRuntime:
    def __init__(self):
        self.gdb = GdbController()
        # Envia um comando para iniciar o GDB com o binário especificado
        self.response = self.gdb.write('-file-exec-and-symbols /usr/bin/arm-none-eabi-gdb')

    def compile(self, code):
        with open('temp.s', 'w') as f:
            f.write(code)
        subprocess.run(['arm-none-eabi-as', '-o', 'temp.o', 'temp.s'])
        subprocess.run(['arm-none-eabi-ld', '-o', 'temp.elf', 'temp.o'])
        self.gdb.write('-file-exec-and-symbols temp.elf')
        self.gdb.write('break _start')
