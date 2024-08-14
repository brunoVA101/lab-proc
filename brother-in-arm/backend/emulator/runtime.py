from pygdbmi.gdbcontroller import GdbController
import subprocess

class GdbRuntime:
    def __init__(self):
        self.gdb = GdbController()
        # Envia um comando para iniciar o GDB com o binário especificado
        self.response = self.gdb.write('-file-exec-and-symbols /usr/bin/arm-none-eabi-gdb')

    def compile(self, code: str):
        print("ok")
        with open('temp.s', 'w') as f:
            f.write(code)
        subprocess.run(['arm-none-eabi-as', '-o', 'temp.o', 'temp.s', '-g'])
        subprocess.run(['arm-none-eabi-ld', '-T', 'linker.ld', '-o', 'temp.elf', 'temp.o', '-M=temp.map', '-L/usr/lib/gcc/arm-none-eabi/10.3.1/', '-lgcc'])
        qemu_process = subprocess.Popen(['qemu-system-arm', '-s', '-M', 'virt', '-kernel', 'temp.elf'])
        self.gdb.write('-file-exec-and-symbols temp.elf')
        self.gdb.write('-break-insert main')
        return self.gdb.write('-exec-run')
    def go_next(self):
        response = self.gdb.write('next')
        return response
    def get_state(self):
        return self.gdb.get_gdb_response(timeout_sec=1)