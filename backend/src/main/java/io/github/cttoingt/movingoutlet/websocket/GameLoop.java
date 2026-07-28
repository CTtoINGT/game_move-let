package io.github.cttoingt.movingoutlet.websocket;

import java.io.IOException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class GameLoop {
    private static final long TICK_MILLIS = 33;
    private final GameConnectionRegistry registry;
    private final GameWebSocketHandler handler;

    public GameLoop(GameConnectionRegistry registry, GameWebSocketHandler handler) {
        this.registry = registry;
        this.handler = handler;
    }

    @Scheduled(fixedRate = TICK_MILLIS)
    public void tick() {
        registry.all().forEach(connection -> {
            connection.state().tick(TICK_MILLIS);
            try {
                handler.sendSnapshot(connection);
            } catch (IOException ignored) {
                // The browser can close between isOpen() and sendMessage().
            }
        });
    }
}
