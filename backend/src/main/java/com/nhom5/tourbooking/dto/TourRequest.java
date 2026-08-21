package com.nhom5.tourbooking.dto;

import com.nhom5.tourbooking.entity.TourStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TourRequest {
    @NotBlank(message = "Tour name is required")
    @JsonProperty("name")
    private String tourName;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @NotNull(message = "Duration is required")
    @Min(value = 1)
    private Integer duration;

    @NotBlank(message = "Departure location is required")
    private String departureLocation;

    private String imageUrl;

    @NotNull(message = "Available seats is required")
    @Min(value = 0)
    private Integer availableSeats;

    private LocalDate startDate;
    private LocalDate endDate;
    
    @NotNull(message = "Status is required")
    private TourStatus status;
    
    private BigDecimal rating;

    @NotNull(message = "Category ID is required")
    private Integer categoryId;
}
