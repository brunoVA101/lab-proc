from pygdbmi.gdbcontroller import GdbController
import subprocess
import socket
import time

def wait_for_port(host, port, timeout=0.1):
    while True:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(timeout)
            try:
                sock.connect((host, port))
                break
            except (ConnectionRefusedError, socket.timeout):
                time.sleep(0.01)  # Wait for 1 second before retrying

class GdbRuntime:
    SHOWN_REGISTERS = [
        "r1",
        "r2",
        "r3",
        "r4",
        "r5",
        "r6",
        "r7",
        "r8",
        "r9",
        "r10",
        "r11",
        "r12",
        "sp",
        "lr",
        "pc",
        "cpsr",
    ]

    def __init__(self):
        self.gdb = None
        self.qemu_process = None

    def compile(self, code: str = None):
        if self.gdb:
            self.gdb.exit()
        if self.qemu_process:
            self.qemu_process.kill()

        self.gdb = GdbController(['gdb-multiarch'])
        
        if code:
            with open('temp.s', 'w') as f:
                f.write(code)
        subprocess.run(['arm-none-eabi-as', '-o', 'temp.o', 'temp.s', '-g'])
        subprocess.run(['arm-none-eabi-ld', '-T', 'linker.ld', '-o', 'temp.elf', 'temp.o', '-M=temp.map', '-L/usr/lib/gcc/arm-none-eabi/10.3.1/', '-lgcc'])
        self.qemu_process = subprocess.Popen(['qemu-system-arm', '-s', '-S', '-M', 'virt', '-kernel', 'temp.elf'])
        self.gdb.write('set architecture arm')
        wait_for_port('localhost', 1234)
        self.gdb.write('target extended-remote :1234')
        ##self.gdb.write('-file-exec-and-symbols temp.elf')
        self.gdb.write('file temp.elf')
        ##self.gdb.write('y')
        self.gdb.write('b main')
        self.gdb.write('continue')
        return self.get_state()
    def go_next(self):
        self.gdb.write('step')
        return self.get_state()
    def go_back(self):
        return self.compile()
    def get_state(self):
        response = self.gdb.write('info registers')
        registers = []
        for element in response:
            reg = element["payload"].split()
            if reg[0] == "(gdb)":
                registers.append({
                    "register": reg[1],
                    "hex_value": reg[2],
                    "dec_value": reg[3] 
                })
            
            else:
                registers.append({
                    "register": reg[0],
                    "hex_value": reg[1],
                    "dec_value": reg[2] 
                })
        registers = [reg for reg in registers if reg["register"] in GdbRuntime.SHOWN_REGISTERS]
        return registers