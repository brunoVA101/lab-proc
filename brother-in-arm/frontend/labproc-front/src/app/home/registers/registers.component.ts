import { Component } from '@angular/core';
import { RegistersRowComponent } from './registers-row/registers-row.component';
import { CompileResponse } from '../compile-response';

@Component({
  selector: 'app-registers',
  standalone: true,
  imports: [RegistersRowComponent],
  templateUrl: './registers.component.html',
})
export class RegistersComponent {
  registerValues: CompileResponse[] = [];
}
