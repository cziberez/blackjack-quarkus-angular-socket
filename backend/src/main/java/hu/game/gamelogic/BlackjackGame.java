package hu.game.gamelogic;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class BlackjackGame {

    private final List<Card> deck;
    private final List<Card> playerHand;
    private final List<Card> dealerHand;
    private boolean gameOver;

    public BlackjackGame() {
        deck = new ArrayList<>();
        playerHand = new ArrayList<>();
        dealerHand = new ArrayList<>();
        gameOver = false;
        initDeck();
        shuffleDeck();
    }

    private void initDeck() {
        String[] suits = {"Hearts", "Diamonds", "Clubs", "Spades"};
        String[] values = {"2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"};
        for (String suit : suits) {
            for (String value : values) {
                deck.add(new Card(suit, value));
            }
        }
    }

    private void shuffleDeck() {
        Collections.shuffle(deck);
    }

    private Card drawCard() {
        return deck.remove(deck.size() - 1);
    }

    public void startGame() {
        // Csak itt adjuk a kezdő lapokat
        playerHand.add(drawCard());
        dealerHand.add(drawCard());
        playerHand.add(drawCard());
    }

    public List<Card> getPlayerHand() {
        return playerHand;
    }

    public List<Card> getDealerHand() {
        return dealerHand;
    }

    public boolean isGameOver() {
        return gameOver;
    }

    public void playerHit() {
        if (!gameOver) {
            playerHand.add(drawCard());
            if (calculateHand(playerHand) > 21) {
                gameOver = true;
            }
        }
    }

    public void playerStand() {
        if (!gameOver) {
            playDealer();
            gameOver = true;
        }
    }

    private void playDealer() {
        while (calculateHand(dealerHand) < 17) {
            dealerHand.add(drawCard());
        }
    }

    public int calculateHand(List<Card> hand) {
        int sum = 0;
        int aces = 0;
        for (Card c : hand) {
            switch (c.getValue()) {
                case "A":
                    aces++;
                    sum += 11;
                    break;
                case "K":
                case "Q":
                case "J":
                    sum += 10;
                    break;
                default:
                    sum += Integer.parseInt(c.getValue());
            }
        }
        while (sum > 21 && aces > 0) {
            sum -= 10;
            aces--;
        }
        return sum;
    }

    public String getResult() {
        int playerScore = calculateHand(playerHand);
        int dealerScore = calculateHand(dealerHand);
        StringBuilder result = new StringBuilder();
        if (playerScore > 21) {
            result.append("Player busts! Dealer wins.");
        }
        if (dealerScore > 21) {
            result.append(" Dealer busts! Player wins.");
        }
        if (result.isEmpty()) {
            if (playerScore > dealerScore) {
                result.append("Player wins!");
            } else if (dealerScore > playerScore) {
                result.append("Dealer wins!");
            } else {
                result.append("Tie!");
            }
        }
        return result.toString();
    }
}
