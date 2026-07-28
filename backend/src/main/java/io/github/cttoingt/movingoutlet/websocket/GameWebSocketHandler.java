package io.github.cttoingt.movingoutlet.websocket;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Component
public class GameWebSocketHandler extends TextWebSocketHandler {
    private final GameConnectionRegistry registry;
    private final JsonMapper objectMapper;

    public GameWebSocketHandler(GameConnectionRegistry registry, JsonMapper objectMapper) {
        this.registry = registry;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        registry.register(session);
        sendSnapshot(registry.get(session));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        GameConnection connection = registry.get(session);
        if (connection == null) {
            return;
        }

        JsonNode payload = objectMapper.readTree(message.getPayload());
        String type = payload.path("type").asText();
        if ("start".equals(type) || "restart".equals(type)) {
            connection.state().start();
        } else if ("input".equals(type)) {
            Set<String> keys = new HashSet<>();
            payload.path("keys").forEach(key -> keys.add(key.asText()));
            connection.state().updateHeldKeys(keys);
        }
        sendSnapshot(connection);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        registry.remove(session);
    }

    void sendSnapshot(GameConnection connection) throws IOException {
        if (connection.session().isOpen()) {
            synchronized (connection.session()) {
                connection.session().sendMessage(new TextMessage(objectMapper.writeValueAsString(connection.state().snapshot())));
            }
        }
    }
}
