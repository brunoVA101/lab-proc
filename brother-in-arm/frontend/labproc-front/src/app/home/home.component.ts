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
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  constructor(private apiService: ApiService) {}

  nextresponse: string = '';
  code: string = '';
  registers: CompileResponse[] = [];

  inst: string = 'Aguardando próxima instrução';

  sendCompile() {
    this.apiService.sendCompile(this.code).subscribe({
      next: (response) => {
        this.registers = response as CompileResponse[];
      },
      complete: () =>{
        this.apiService.getInstruction().subscribe({
          next: (response) => {
            this.inst = response.current;
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
}
