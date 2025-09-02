import {Injectable} from '@angular/core';
import {BehaviorSubject, timer} from 'rxjs';

interface GameState {
  playerHand: string[];
  dealerHand: string[];
  playerScore: number;
  dealerScore: number;
  gameOver: boolean;
  result?: string;
}

@Injectable({providedIn: 'root'})
export class BlackjackService {
  private socket!: WebSocket;
  private gameStateSubject = new BehaviorSubject<GameState>({
    playerHand: [],
    dealerHand: [],
    playerScore: 0,
    dealerScore: 0,
    gameOver: false,
    result: undefined
  });

  gameState$ = this.gameStateSubject.asObservable();

  connect() {
    this.socket = new WebSocket('ws://localhost:8080/game');

    this.socket.onmessage = (event) => {
      const data = event.data;

      // Szimpla szövegparsing (szobában minden játékos ugyanazt látja)
      if (data.startsWith("Player hand:") || data.startsWith("Game started!")) {
        const hand = this.parseHand(data);
        this.gameStateSubject.next({
          ...this.gameStateSubject.value,
          playerHand: hand,
          playerScore: this.calculateHand(hand)
        });
      } else if (data.startsWith("Dealer hand:")) {
        const hand = this.parseDealerHand(data);
        const result = this.parseResult(data);
        this.gameStateSubject.next({
          ...this.gameStateSubject.value,
          dealerHand: hand,
          dealerScore: this.calculateHand(hand),
          gameOver: data.includes("Result:") || data.includes("Game over!"),
          result
        });
      } else if (data.startsWith("Game over!")) {
        const result = data.replace("Game over! ", "");
        this.gameStateSubject.next({
          ...this.gameStateSubject.value,
          gameOver: true,
          result
        });
      }
    };
  }

  sendHit() {
    this.sendMessage('hit');
  }

  sendStand() {
    this.sendMessage('stand');
  }

  private sendMessage(msg: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(msg);
    }
  }

  private parseHand(data: string): string[] {
    const match = data.match(/\[(.*)]/);
    return match && match[1] ? match[1].split(',').map(s => s.trim()) : [];
  }

  private parseDealerHand(data: string): string[] {
    const match = data.match(/Dealer hand: \[(.*)]/);
    return match && match[1] ? match[1].split(',').map(s => s.trim()) : [];
  }

  private parseResult(data: string): string {
    const match = data.match(/Result: (.*)/);
    return match ? match[1].trim() : '';
  }

  calculateHand(hand: string[]): number {
    let sum = 0, aces = 0;
    hand.forEach(card => {
      const value = card.split(' ')[0];
      if (value === 'A') {
        aces++;
        sum += 11;
      } else if (['K', 'Q', 'J'].includes(value)) sum += 10;
      else sum += parseInt(value, 10);
    });
    while (sum > 21 && aces > 0) {
      sum -= 10;
      aces--;
    }
    if (sum === 21) {
      this.sendStand();
    }
    return sum;
  }

  animateCards(current: string[], target: string[], updateScore?: () => void) {
    const newCards = target.slice(current.length);
    newCards.forEach((card, i) => {
      timer(i * 1000).subscribe(() => {
        current.push(card);
        if (updateScore) {
          updateScore();
        }
      });
    });
  }
}
