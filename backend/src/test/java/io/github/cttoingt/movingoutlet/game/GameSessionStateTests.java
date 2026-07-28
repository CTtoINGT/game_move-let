package io.github.cttoingt.movingoutlet.game;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import org.junit.jupiter.api.Test;

class GameSessionStateTests {

    @Test
    void showsTheFullRoundDurationBeforeStarting() {
        GameSessionState state = new GameSessionState();

        assertThat(state.snapshot().remainingMillis()).isEqualTo(60_000);
    }

    @Test
    void capturesOutletAndStartsCombo() {
        GameSessionState state = new GameSessionState();
        state.start();
        state.setOutletPositionForTest(450, 280);

        state.tick(16);

        GameSnapshot snapshot = state.snapshot();
        assertThat(snapshot.score()).isEqualTo(100);
        assertThat(snapshot.combo()).isEqualTo(1);
        assertThat(snapshot.event()).isEqualTo("CAPTURE");
    }

    @Test
    void keepsPlayerInsideTheField() {
        GameSessionState state = new GameSessionState();
        state.start();
        state.setOutletPositionForTest(GameSessionState.OUTLET_RADIUS, GameSessionState.OUTLET_RADIUS);
        state.updateHeldKeys(Set.of("arrowright", "arrowdown"));

        state.tick(10_000);

        GameSnapshot snapshot = state.snapshot();
        assertThat(snapshot.playerX()).isEqualTo(GameSessionState.FIELD_WIDTH - GameSessionState.PLAYER_RADIUS);
        assertThat(snapshot.playerY()).isEqualTo(GameSessionState.FIELD_HEIGHT - GameSessionState.PLAYER_RADIUS);
    }

    @Test
    void finishesAfterOneMinute() {
        GameSessionState state = new GameSessionState();
        state.start();

        state.tick(60_000);

        GameSnapshot snapshot = state.snapshot();
        assertThat(snapshot.status()).isEqualTo(GameStatus.FINISHED);
        assertThat(snapshot.remainingMillis()).isZero();
        assertThat(snapshot.event()).isEqualTo("TIME_UP");
    }
}
