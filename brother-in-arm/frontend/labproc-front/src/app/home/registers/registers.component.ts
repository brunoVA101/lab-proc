import { Component } from '@angular/core';
import { RegistersRowComponent } from './registers-row/registers-row.component';

@Component({
  selector: 'app-registers',
  standalone: true,
  imports: [RegistersRowComponent],
  templateUrl: './registers.component.html',
})
export class RegistersComponent {
  registerValues: string[] = [
    '(no value)',
    '(no value)',
    '(no value)',
    '(no value)',
    '(no value)',
    '(no value)',
    '(no value)',
  ];
}
