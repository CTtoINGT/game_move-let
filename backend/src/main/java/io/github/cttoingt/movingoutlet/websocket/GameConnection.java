package io.github.cttoingt.movingoutlet.websocket;

import io.github.cttoingt.movingoutlet.game.GameSessionState;
import org.springframework.web.socket.WebSocketSession;

record GameConnection(WebSocketSession session, GameSessionState state) {
}
