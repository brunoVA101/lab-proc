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
  mempos: string = '$sp';
  stepping: boolean = false;
  timer: number = 1000;
  private timersub: any;
  inst: string = 'Aguardando próxima instrução';
  cpsr: string = '00000000000000000000000000000000';
  positions: string = '';
  
  analysisInst(){
    var parsed = this.inst.replace(/,/g, '').split(' ');
    //parsed.forEach(word => {
    //  console.log(word)
    //})
    var firstarg = parsed[1];
    var secondarg = parsed[2];
    var thirdarg = parsed[3];
    var translation = '';
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
    
    switch(parsed[0].toLocaleUpperCase().slice(0, 3)){
      case "BL":
        translation += "Saltar para subrotina " + firstarg;
        break;
      case "B":
      case "BEQ":
      case "BMI":
      case "BPL":
        translation += "Saltar para " + firstarg;
        break;
      case "MOV":
        translation += "Armazenar em " + firstarg + " a constante " + secondarg;
        break;
      case "SUB":
        translation += "Armazenar em " + firstarg + " " + secondarg + " menos " + thirdarg;
        break;
      case "ADD":
        translation += "Armazenar em " + firstarg + " " + secondarg + " mais " + thirdarg;
        break;
      case "STR":
        translation += "A posição de memória " + secondarg +"+"+ thirdarg + " receberá o valor de " + firstarg;
        break;
      case "EOR":
        translation += "Armazenar em " + firstarg + " " + secondarg + " XOR " + thirdarg;
        break;
      case "BX":
        translation += "Retornar de subrotina: endereço " + firstarg;
        break;
      case "LDR":
        if(typeof parsed[3] !== 'undefined'){
          translation += "Carregar em " + firstarg + ", " + secondarg +"+ " + thirdarg
        }
        translation += "Carregar em " + firstarg + ", " + secondarg
        break;
      case "AND":
          translation += "Armazenar em " + firstarg + " " + secondarg + " E " + thirdarg;
          break;
      case "ORR":
        translation += "Armazenar em " + firstarg + " " + secondarg + " OU " + thirdarg;
        break;
      default:
        translation += "..."
        break;
    }
    if(typeof parsed[3] !== 'undefined' && typeof parsed[4] !== 'undefined' ){
      switch(parsed[3].toLocaleUpperCase()){
        case "LSL":
          translation += " com " + parsed[4].slice(1) + " shift(s) à esquerda.";
          break;
        case "LSR":
          translation += " com " + parsed[4].slice(1) + " shift(s) à direita.";
          break;
        case "ASR":
          translation += " com " + parsed[4].slice(1) + " shift(s) à direita(sinal estendido).";
          break;
        case "ROR":
          translation += " com " + parsed[4].slice(1) + " rotação(ões) à direita.";
          break;
        default:
          break;
      }
    }

    if(typeof parsed[4] !== 'undefined' && typeof parsed[5] !== 'undefined' ){
      switch(parsed[4].toLocaleUpperCase()){
        case "LSL":
          translation += " com " + parsed[5].slice(1) + " shift(s) à esquerda.";
          break;
        case "LSR":
          translation += " com " + parsed[5].slice(1) + " shift(s) à direita.";
          break;
        case "ASR":
          translation += " com " + parsed[5].slice(1) + " shift(s) à direita(sinal estendido).";
          break;
        case "ROR":
          translation += " com " + parsed[5].slice(1) + " rotação(ões) à direita.";
          break;
        default:
          break;
      }
    }
    
    switch(parsed[0].toLocaleUpperCase().slice(-2)){
      case "CS":
        translation += " com carry"
        break;
      case "EQ":
        translation += " se Z=1(igualdade)"
        break;
      case "NE":
        translation += " se Z=0(desigualdade)"
        break;
      case "PL":
        translation += " se N=0(resultado 0 ou +)"
        break;
      case "VS":
        translation += " se overflow"
        break;
      case "VC":
        translation += " se não overflow"
        break;
      case "MI":
        translation += " se N=1(resultado -)"
        break;
      case "PL":
        translation += " se N=0(resultado 0 ou +)"
        break;
      default:
        break;
    }
    return translation;
  }
  sendCompile() {
    this.apiService.sendCompile(this.code).subscribe({
      next: (response) => {
        this.registers = response as CompileResponse[];
      },
      complete: () =>{
        this.apiService.getInstruction(this.mempos).subscribe({
          next: (response) => {
            this.inst = response.current;
            this.cpsr = response.cpsr;
            this.positions = response.positions;
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
        this.apiService.getInstruction(this.mempos).subscribe({
          next: (response) => {
            this.inst = response.current;
            this.cpsr = response.cpsr;
            this.positions = response.positions;
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
