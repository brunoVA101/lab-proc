import { Component, Input } from '@angular/core';
import { RegistersRowComponent } from './registers-row/registers-row.component';
import { CompileResponse } from '../compile-response';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-registers',
  standalone: true,
  imports: [NgFor, RegistersRowComponent],
  templateUrl: './registers.component.html',
})
export class RegistersComponent {
  @Input() registerValues: CompileResponse[] = [];
}
