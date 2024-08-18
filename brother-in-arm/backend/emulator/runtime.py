from pygdbmi.gdbcontroller import GdbController
import subprocess
import socket
import time
import os
import signal
import re
def wait_for_port(host, port, timeout=0.1):
    while True:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(timeout)
            try:
                sock.connect((host, port))
                break
            except (ConnectionRefusedError, socket.timeout):
                time.sleep(0.01)  # Wait for 1 second before retrying

def convertToDec(hex: str):
    try:
        unsigned_value = int(hex, 16)
        return str(unsigned_value)
    except:
        return 0
def parseInstruction(inst: str):
    numbermatch = re.search(r'\d', inst)
    instruction = inst[numbermatch.start():]
    lettermatch = re.search(r'[a-zA-Z]', instruction)
    if lettermatch:
        return instruction[lettermatch.start():]
    return "Aguardando próxima instrução"
    


class GdbRuntime:
    SHOWN_REGISTERS = [
        "r0",
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
    currentinst = None
    cpsr = None
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

        instruction = self.gdb.write('continue')
        self.currentinst = parseInstruction(instruction[-1]["payload"])

        return self.get_state()
    def go_next(self):

        instruction = self.gdb.write('step')
        self.currentinst = parseInstruction(instruction[0]["payload"])

        return self.get_state()
    def run_all(self):
        # Send the run command
        self.gdb.write('continue', raise_error_on_timeout=False, timeout_sec=2)
        os.kill(self.gdb.gdb_process.pid, signal.SIGINT)
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
                    "dec_value": convertToDec(reg[2]) 
                })
            
            else:
                registers.append({
                    "register": reg[0],
                    "hex_value": reg[1],
                    "dec_value": convertToDec(reg[1])  
                })
        registers = [reg for reg in registers if reg["register"] in GdbRuntime.SHOWN_REGISTERS]
        self.cpsr = registers[-1]["hex_value"]
        return registers
    def instruction(self, mempos: str):
        #print(self.gdb.write('x/i $pc')[0]["payload"])
        #print(self.gdb.write('info locals')[0]["payload"])
        #print(self.gdb.write('info args')[0]["payload"])
        print(mempos)
        positions = ''
        memdump = self.gdb.write('x/10x '+ mempos)
        for count, dict in enumerate(memdump):
            instline = dict["payload"].replace('\t', '  ').replace('(gdb) ', '')
            if count == 0:
                positions += instline + "\n"
            else:
                positions += instline.split(':')[1]+ "\n"
        
        cpsrbin = bin(int(self.cpsr, 16))[2:]
        return {"current" : self.currentinst, "cpsr": cpsrbin.zfill(32), "positions": positions}