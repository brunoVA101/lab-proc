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
import { interval, Subscription } from 'rxjs';
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

  stepping: boolean = false;
  timer: number = 1000;
  private timersub: any;
  inst: string = 'Aguardando próxima instrução';
  cpsr: string = '00000000000000000000000000000000';
  analysisInst(){
    var parsed = this.inst.replace(/,/g, '').split(' ');
    //parsed.forEach(word => {
    //  console.log(word)
    //})
    var firstarg = parsed[1];
    var secondarg = parsed[2];
    var thirdarg = parsed[3];
    for(let i = 12; i >= 0; i--){
      const regex = new RegExp(`r${i}`, 'gi');
      if(regex.test(parsed[1])){
        firstarg = parsed[1].replace(regex, this.labelarray[i]);
      }
      if(regex.test(parsed[2])){
        secondarg = parsed[2].replace(regex, this.labelarray[i]);
      }
      if(regex.test(parsed[3])){
        thirdarg = parsed[3].replace(regex, this.labelarray[i]);
      }
    }
    // var firstarg = this.labelarray[0]
    switch(parsed[0]){
      case "BL":
        return "Saltar para subrotina " + parsed[1]
      case "BEQ":
        return "Saltar para subrotina " + parsed[1] + " se resultado for zero"
      case "MOV":
        return "Armazenar em " + firstarg + " a constante " + parsed[2]
      case "SUB":
      case "SUBS":
        return "Armazenar em " + firstarg + " " + secondarg + " menos " + thirdarg;
      case "ADD":
      case "ADDS":
        return "Armazenar em " + firstarg + " " + secondarg + " mais " + thirdarg;
      case "STR":
        return "A posição de memória " + secondarg +"+"+ thirdarg + " receberá o valor de " + firstarg;
      case "EOR":
      case "EORS":
        return "Armazenar em " + firstarg + " " + secondarg + " XOR " + thirdarg;
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
  toggleTimer(){
    if(this.stepping == true){
      this.stepping = false;
      this.timersub.unsubscribe();
    }else{
      this.stepping = true;
      this.timersub = interval(this.timer).subscribe(
        x => { this.sendNext() }
      );
    }
  }
}
