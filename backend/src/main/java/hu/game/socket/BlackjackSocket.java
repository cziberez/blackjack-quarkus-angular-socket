package hu.game.socket;

import hu.game.gamelogic.BlackjackGame;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/game")
@ApplicationScoped
public class BlackjackSocket {

    private final ConcurrentHashMap<Session, BlackjackGame> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session) {
        BlackjackGame game = new BlackjackGame();
        sessions.put(session, game);
        session.getAsyncRemote().sendText("Game started! Player hand: " + game.getPlayerHand());
    }

    @OnClose
    public void onClose(Session session) {
        sessions.remove(session);
    }

    @OnMessage
    public void onMessage(Session session, String message) throws IOException {
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
                    session.close();
                }
                break;
            case "stand":
                game.playerStand();
                session.getAsyncRemote().sendText("Dealer hand: " + game.getDealerHand() + ". Result: " + game.getResult());
                break;
            default:
                session.getAsyncRemote().sendText("Unknown command! Use hit, stand, or split.");
        }
    }
}
