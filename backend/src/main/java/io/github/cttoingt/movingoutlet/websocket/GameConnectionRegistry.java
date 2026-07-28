package io.github.cttoingt.movingoutlet.websocket;

import io.github.cttoingt.movingoutlet.game.GameSessionState;
import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

@Component
public class GameConnectionRegistry {
    private final ConcurrentHashMap<String, GameConnection> connections = new ConcurrentHashMap<>();

    public void register(WebSocketSession session) {
        connections.put(session.getId(), new GameConnection(session, new GameSessionState()));
    }

    public void remove(WebSocketSession session) {
        connections.remove(session.getId());
    }

    public GameConnection get(WebSocketSession session) {
        return connections.get(session.getId());
    }

    public Collection<GameConnection> all() {
        return connections.values();
    }
}
