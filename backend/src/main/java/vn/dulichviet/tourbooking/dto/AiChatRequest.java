package vn.dulichviet.tourbooking.dto;

import java.util.List;

public record AiChatRequest(
        String message,
        String prompt,
        List<MessageItem> history) {
    public record MessageItem(String sender, String text) {
    }
}
