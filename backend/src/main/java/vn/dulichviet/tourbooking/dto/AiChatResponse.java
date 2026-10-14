package vn.dulichviet.tourbooking.dto;

import java.util.List;

public record AiChatResponse(
        String reply,
        List<TourDto> suggestedTours) {
}
