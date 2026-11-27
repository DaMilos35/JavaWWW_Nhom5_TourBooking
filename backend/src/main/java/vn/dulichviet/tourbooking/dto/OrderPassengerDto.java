package vn.dulichviet.tourbooking.dto;

import vn.dulichviet.tourbooking.entity.OrderPassenger;

public record OrderPassengerDto(Integer id, String fullName, String gender, String ageGroup) {
    public static OrderPassengerDto from(OrderPassenger passenger) {
        return new OrderPassengerDto(passenger.getId(), passenger.getFullName(), passenger.getGender(), passenger.getAgeGroup());
    }
}
