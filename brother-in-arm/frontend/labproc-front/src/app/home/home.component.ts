import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from './api.service';
import { FormsModule } from '@angular/forms';
import { CompileResponse } from './compile-response';
import { RegistersComponent } from './registers/registers.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    CodemirrorModule,
    RegistersComponent,
    CommonModule
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  constructor(private apiService: ApiService) {}

  nextresponse: string = '';
  code: string = '';
  registers: CompileResponse[] = [];
  labelarray: string[] = ['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10', 'r11', 'r12']

  inst: string = 'Aguardando próxima instrução';
  cpsr: string = '0x00000000';
  analysisInst(){
    var parsed = this.inst.replace(/,/g, '').split(' ');
    //parsed.forEach(word => {
    //  console.log(word)
    //})
    var firstarg = '';
    for(let i = 12; i >= 0; i--){
      const regex = new RegExp(`r${i}`, 'gi');
      if(regex.test(parsed[1])){
        firstarg = parsed[1].replace(regex, this.labelarray[i]);
      }
    }
    // var firstarg = this.labelarray[0]
    switch(parsed[0]){
      case "BL":
        return "Saltar para subrotina " + parsed[1]
      case "BEQ":
        return "Saltar para subrotina " + parsed[1] + " se flag zero for 1"
      case "MOV":
        return "Armazenar em " + firstarg + " a constante " + parsed[2]
      default:
        return "..."
    }
    return parsed[0] + "Hello world"
  }
  sendCompile() {
    this.apiService.sendCompile(this.code).subscribe({
      next: (response) => {
        this.registers = response as CompileResponse[];
      },
      complete: () =>{
        this.apiService.getInstruction().subscribe({
          next: (response) => {
            this.inst = response.current;
            this.cpsr = response.cpsr;
          }
        })
      }
    });
  }

  sendNext() {
    this.apiService.sendNext().subscribe({
      next: (response) => {
        this.registers = response as CompileResponse[];
      },
      complete: () =>{
        this.apiService.getInstruction().subscribe({
          next: (response) => {
            this.inst = response.current;
            this.cpsr = response.cpsr;
          }
        })
      }
    });
  }

  sendRunAll() {
    this.apiService.sendRunAll().subscribe({
      next: (response) => {
        this.registers = response as CompileResponse[];
      },
    });
  }
  trackByFn(index: any, item: any) {
    return index;  
  }
}
