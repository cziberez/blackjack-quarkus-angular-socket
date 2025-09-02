import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BlackjackService} from './blackjack.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-blackjack',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './blackjack.html',
  styleUrls: ['./blackjack.scss']
})
export class BlackjackComponent implements OnInit {
  gameState$!: Observable<any>;
  playerCards: string[] = [];
  dealerCards: string[] = [];

  constructor(protected gameService: BlackjackService) {}

  ngOnInit() {
    this.gameService.connect();
    this.gameState$ = this.gameService.gameState$;

    this.gameState$.subscribe(game => {

      // Új játék kezdésekor reseteljük a kézlapokat
      if (game.playerHand.length === 2 && this.playerCards.length !== 2) {
        this.playerCards = [];
      }
      if (game.dealerHand.length === 2 && this.dealerCards.length !== 2) {
        this.dealerCards = [];
      }

      // Animate player cards
      this.gameService.animateCards(this.playerCards, game.playerHand, () => {
        game.playerScore = this.gameService.calculateHand(this.playerCards);
      });

      // Animate dealer cards
      this.gameService.animateCards(this.dealerCards, game.dealerHand, () => {
        game.dealerScore = this.gameService.calculateHand(this.dealerCards);
      });
    });
  }

  hit() {
    this.gameService.sendHit();
  }

  stand() {
    this.gameService.sendStand();
  }

  getValue(card: string): string {
    return card.split(' ')[0];
  }

  getSuit(card: string): string {
    return card.split(' ')[2];
  }

  getSuitSymbol(card: string): string {
    const suit = this.getSuit(card);
    switch (suit) {
      case 'Hearts': return '♥';
      case 'Diamonds': return '♦';
      case 'Clubs': return '♣';
      case 'Spades': return '♠';
      default: return '';
    }
  }

  getSuitClass(card: string): string {
    return this.getSuit(card).toLowerCase();
  }

  calculateHand(hand: string[]): number {
    return this.gameService.calculateHand(hand);
  }

  get playerScore(): number {
    return this.gameService.calculateHand(this.playerCards);
  }

  get dealerScore(): number {
    return this.gameService.calculateHand(this.dealerCards);
  }

  restart() {
    window.location.reload();
  }
}
