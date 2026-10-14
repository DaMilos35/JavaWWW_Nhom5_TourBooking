package vn.dulichviet.tourbooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TourBookingApplication {
    public static void main(String[] args) {
        SpringApplication.run(TourBookingApplication.class, args);
    }
}
