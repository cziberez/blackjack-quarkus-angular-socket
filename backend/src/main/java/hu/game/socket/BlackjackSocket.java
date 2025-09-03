package hu.game.socket;

import hu.game.gamelogic.BlackjackGame;
import hu.game.gamelogic.Card;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/game")
@ApplicationScoped
public class BlackjackSocket {

    private final ConcurrentHashMap<Session, BlackjackGame> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session) {
        BlackjackGame game = new BlackjackGame();
        sessions.put(session, game);

        // Küldünk csak "Game started!" üzenetet
        session.getAsyncRemote().sendText("Game started!");

        // Dealeljük a kezdő lapokat
        game.startGame();
        session.getAsyncRemote().sendText("Player hand: " + game.getPlayerHand());
        List<Card> dealerHand = game.getDealerHand();
        session.getAsyncRemote().sendText("Dealer state: " + dealerHand);
        checkWinningHand(game, session);
    }

    @OnClose
    public void onClose(Session session) {
        sessions.remove(session);
    }

    @OnMessage
    public void onMessage(Session session, String message) {
        BlackjackGame game = sessions.get(session);
        if (game == null) {
            return;
        }

        switch (message.toLowerCase()) {
            case "hit":
                game.playerHit();
                session.getAsyncRemote().sendText("Player hand: " + game.getPlayerHand());
                if (game.isGameOver()) {
                    session.getAsyncRemote().sendText("Game over! " + game.getResult());
                } else {
                    checkWinningHand(game, session);
                }
                break;
            case "stand":
                game.playerStand();
                session.getAsyncRemote().sendText("Dealer hand: " + game.getDealerHand() + ". Result: " + game.getResult());
                break;
            default:
                session.getAsyncRemote().sendText("Unknown command! Use hit or stand.");
        }
    }

    private void checkWinningHand(BlackjackGame game, Session session) {
        int playerScore = game.calculateHand(game.getPlayerHand());
        if (playerScore == 21) {
            session.getAsyncRemote().sendText("Dealer hand: " + game.getDealerHand() + ". Result: " + game.getResult());
        }
        int dealerScore = game.calculateHand(game.getDealerHand());
        if (dealerScore >= 17) {
            if (playerScore > dealerScore && playerScore < 22) {
                session.getAsyncRemote().sendText("Dealer hand: " + game.getDealerHand() + ". Result: " + game.getResult());
            }
        }
    }
}
