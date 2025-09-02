import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {BlackjackComponent} from './blackjack/blackjack.component';

@Component({
  selector: 'app-root',
  imports: [BlackjackComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
