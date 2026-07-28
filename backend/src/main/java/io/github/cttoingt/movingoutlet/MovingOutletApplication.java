package io.github.cttoingt.movingoutlet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MovingOutletApplication {

	public static void main(String[] args) {
		SpringApplication.run(MovingOutletApplication.class, args);
	}

}
