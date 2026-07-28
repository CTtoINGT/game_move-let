package io.github.cttoingt.movingoutlet.game;

import java.util.HashSet;
import java.util.Random;
import java.util.Set;

/**
 * A single player's authoritative game state. The browser only sends held keys;
 * position, collision, timer, and score are calculated here on the server.
 */
public final class GameSessionState {
    static final int FIELD_WIDTH = 900;
    static final int FIELD_HEIGHT = 560;
    static final double PLAYER_RADIUS = 18;
    static final double OUTLET_RADIUS = 24;
    private static final long ROUND_DURATION_MS = 60_000;
    private static final long COMBO_WINDOW_MS = 3_000;
    private static final double PLAYER_SPEED_PER_SECOND = 350;
    private static final double BASE_OUTLET_SPEED_PER_SECOND = 145;
    private static final double OUTLET_SPEED_PER_COMBO = 18;
    private static final double MIN_RESPAWN_DISTANCE = 190;

    private final Random random;
    private final Set<String> heldKeys = new HashSet<>();
    private GameStatus status = GameStatus.IDLE;
    private double playerX = FIELD_WIDTH / 2.0;
    private double playerY = FIELD_HEIGHT / 2.0;
    private double outletX;
    private double outletY;
    private double outletVelocityX;
    private double outletVelocityY;
    private int score;
    private int combo;
    private long remainingMillis;
    private long comboRemainingMillis;
    private String event = "READY";

    public GameSessionState() {
        this(new Random());
    }

    GameSessionState(Random random) {
        this.random = random;
        placeOutletAwayFromPlayer();
        setOutletDirection();
    }

    public synchronized void start() {
        status = GameStatus.PLAYING;
        playerX = FIELD_WIDTH / 2.0;
        playerY = FIELD_HEIGHT / 2.0;
        score = 0;
        combo = 0;
        remainingMillis = ROUND_DURATION_MS;
        comboRemainingMillis = 0;
        heldKeys.clear();
        placeOutletAwayFromPlayer();
        setOutletDirection();
        event = "START";
    }

    public synchronized void updateHeldKeys(Set<String> keys) {
        heldKeys.clear();
        keys.stream()
                .map(String::toLowerCase)
                .filter(key -> Set.of("arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d").contains(key))
                .forEach(heldKeys::add);
    }

    public synchronized void tick(long elapsedMillis) {
        if (status != GameStatus.PLAYING) {
            return;
        }

        remainingMillis = Math.max(0, remainingMillis - elapsedMillis);
        comboRemainingMillis = Math.max(0, comboRemainingMillis - elapsedMillis);
        if (comboRemainingMillis == 0 && combo > 0) {
            combo = 0;
        }

        movePlayer(elapsedMillis);
        moveOutlet(elapsedMillis);
        if (isCaptured()) {
            captureOutlet();
        }
        if (remainingMillis == 0) {
            status = GameStatus.FINISHED;
            heldKeys.clear();
            event = "TIME_UP";
        }
    }

    public synchronized GameSnapshot snapshot() {
        return new GameSnapshot(
                status,
                playerX,
                playerY,
                outletX,
                outletY,
                score,
                combo,
                remainingMillis,
                comboRemainingMillis,
                event
        );
    }

    void setOutletPositionForTest(double x, double y) {
        outletX = x;
        outletY = y;
        outletVelocityX = 0;
        outletVelocityY = 0;
    }

    private void movePlayer(long elapsedMillis) {
        double horizontal = axis("arrowright", "d") - axis("arrowleft", "a");
        double vertical = axis("arrowdown", "s") - axis("arrowup", "w");
        double magnitude = Math.hypot(horizontal, vertical);
        if (magnitude == 0) {
            return;
        }

        double distance = PLAYER_SPEED_PER_SECOND * elapsedMillis / 1_000.0;
        playerX = clamp(playerX + horizontal / magnitude * distance, PLAYER_RADIUS, FIELD_WIDTH - PLAYER_RADIUS);
        playerY = clamp(playerY + vertical / magnitude * distance, PLAYER_RADIUS, FIELD_HEIGHT - PLAYER_RADIUS);
    }

    private double axis(String first, String second) {
        return heldKeys.contains(first) || heldKeys.contains(second) ? 1 : 0;
    }

    private void moveOutlet(long elapsedMillis) {
        double seconds = elapsedMillis / 1_000.0;
        outletX += outletVelocityX * seconds;
        outletY += outletVelocityY * seconds;
        if (outletX < OUTLET_RADIUS || outletX > FIELD_WIDTH - OUTLET_RADIUS) {
            outletVelocityX *= -1;
            outletX = clamp(outletX, OUTLET_RADIUS, FIELD_WIDTH - OUTLET_RADIUS);
        }
        if (outletY < OUTLET_RADIUS || outletY > FIELD_HEIGHT - OUTLET_RADIUS) {
            outletVelocityY *= -1;
            outletY = clamp(outletY, OUTLET_RADIUS, FIELD_HEIGHT - OUTLET_RADIUS);
        }
    }

    private boolean isCaptured() {
        return Math.hypot(playerX - outletX, playerY - outletY) <= PLAYER_RADIUS + OUTLET_RADIUS;
    }

    private void captureOutlet() {
        combo = comboRemainingMillis > 0 ? combo + 1 : 1;
        comboRemainingMillis = COMBO_WINDOW_MS;
        score += 100 * combo;
        event = combo >= 5 ? "JACKPOT" : "CAPTURE";
        placeOutletAwayFromPlayer();
        setOutletDirection();
    }

    private void placeOutletAwayFromPlayer() {
        for (int attempt = 0; attempt < 30; attempt++) {
            double candidateX = OUTLET_RADIUS + random.nextDouble() * (FIELD_WIDTH - OUTLET_RADIUS * 2);
            double candidateY = OUTLET_RADIUS + random.nextDouble() * (FIELD_HEIGHT - OUTLET_RADIUS * 2);
            if (Math.hypot(playerX - candidateX, playerY - candidateY) >= MIN_RESPAWN_DISTANCE) {
                outletX = candidateX;
                outletY = candidateY;
                return;
            }
        }
        outletX = OUTLET_RADIUS;
        outletY = OUTLET_RADIUS;
    }

    private void setOutletDirection() {
        double angle = random.nextDouble() * Math.PI * 2;
        double speed = BASE_OUTLET_SPEED_PER_SECOND + Math.min(combo, 10) * OUTLET_SPEED_PER_COMBO;
        outletVelocityX = Math.cos(angle) * speed;
        outletVelocityY = Math.sin(angle) * speed;
    }

    private static double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }
}
