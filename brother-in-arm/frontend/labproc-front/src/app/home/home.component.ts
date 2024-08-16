import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from './api.service';
import { FormsModule } from '@angular/forms';
import { CompileResponse } from './compile-response';
import { RegistersComponent } from './registers/registers.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    RegistersComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  constructor(private apiService: ApiService) {}

  nextresponse: string = '';
  code: string = '';
  registers: CompileResponse[] = [
    { register: 'r1', dec_value: '10', hex_value: '0x00' },
    { register: 'r1', dec_value: '10', hex_value: '0x00' },
    { register: 'r1', dec_value: '10', hex_value: '0x00' },
    { register: 'r1', dec_value: '10', hex_value: '0x00' },
  ];

  fetchText(): void {
    this.apiService.getTextResponse().subscribe({
      next: (data) => {
        this.nextresponse = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  sendCompile() {
    this.apiService.sendCompile(this.code).subscribe({
      next: (response) => {
        this.registers = response as CompileResponse[];
      },
    });
  }

  sendNext() {
    this.apiService.sendNext().subscribe({
      next: (response) => {
        this.registers = response as CompileResponse[];
      },
    });
  }
}
