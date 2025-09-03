import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlackjackService } from './blackjack.service';
import { Observable } from 'rxjs';

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

  isAnimating = false;
  dealerAnimationFinished = false;

  constructor(protected gameService: BlackjackService) {}

  ngOnInit() {
    this.gameService.connect();
    this.gameState$ = this.gameService.gameState$;

    this.gameState$.subscribe(game => {
      // Reset hands when a new game starts
      if (game.playerHand.length === 2 && this.playerCards.length !== 2) {
        this.playerCards = [];
        this.dealerAnimationFinished = false;
      }
      if (game.dealerHand.length === 2 && this.dealerCards.length !== 2) {
        this.dealerCards = [];
      }

      // Animate player cards
      this.animateWithLock(() =>
        this.gameService.animateCards(this.playerCards, game.playerHand, () => {
          game.playerScore = this.gameService.calculateHand(this.playerCards);
        })
      );

      // Animate dealer cards
      this.animateWithLock(() =>
        this.gameService.animateCards(this.dealerCards, game.dealerHand, () => {
          game.dealerScore = this.gameService.calculateHand(this.dealerCards);
          if (game.gameOver && this.dealerCards.length === game.dealerHand.length) {
            setTimeout(() => {
              this.dealerAnimationFinished = true;
            }, 600);
          }
        })
      );
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

  get dealerScoreDisplay(): string {
    // Ha a játék nem ért véget → csak az első lap értéke jelenik meg
    if (!this.dealerAnimationFinished && this.dealerCards.length > 0) {
      return this.gameService.calculateHand([this.dealerCards[0]]).toString();
    }
    return this.dealerScore.toString();
  }

  restart() {
    window.location.reload();
  }

  private animateWithLock(animationFn: () => void) {
    this.isAnimating = true;
    animationFn();
    setTimeout(() => {
      this.isAnimating = false;
    }, 1200); // szinkronban az animációval
  }
}
