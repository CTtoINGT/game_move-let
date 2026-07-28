package io.github.cttoingt.movingoutlet.game;

public record GameSnapshot(
        GameStatus status,
        double playerX,
        double playerY,
        double outletX,
        double outletY,
        int score,
        int combo,
        long remainingMillis,
        long comboRemainingMillis,
        String event
) {
}
