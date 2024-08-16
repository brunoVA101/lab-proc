import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from './api.service';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatInputModule],
  templateUrl: './home.component.html',
  
})
export class HomeComponent {
  nextresponse: string | undefined;
  constructor(private apiService: ApiService){ }
  fetchText() : void {
    this.apiService.getTextResponse().subscribe(
      {
        next: (data) => {
        this.nextresponse = data;
        },
        error: (error) =>{
          console.log(error)
        },
        complete: () =>{
          console.log('complete')
        }
    }
    );
  }
}
