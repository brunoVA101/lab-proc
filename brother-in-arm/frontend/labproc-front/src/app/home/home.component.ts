import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from './api.service';
import { FormsModule } from '@angular/forms';
import { CompileResponse } from './compile-response';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatInputModule, FormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  constructor(private apiService: ApiService) {}

  nextresponse: string = '';
  code: string = '';

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
        const typedResponse = response as CompileResponse;
        console.log(typedResponse);
      },
    });
  }
}
