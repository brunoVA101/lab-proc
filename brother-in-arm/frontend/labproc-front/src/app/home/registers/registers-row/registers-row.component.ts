import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-registers-row',
  standalone: true,
  imports: [],
  templateUrl: './registers-row.component.html',
})
export class RegistersRowComponent {
  @Input() index: number = 0;
  @Input() value: string = '(no value)';
}
