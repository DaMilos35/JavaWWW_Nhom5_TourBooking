package vn.dulichviet.tourbooking.dto;

import vn.dulichviet.tourbooking.entity.Category;

public record CategoryDto(
        Integer id,
        String name,
        String description,
        String imageUrl,
        Long tourCount) {
    public static CategoryDto from(Category c) {
        return from(c, null);
    }

    public static CategoryDto from(Category c, Long tourCount) {
        return new CategoryDto(c.getId(), c.getName(), c.getDescription(), c.getImageUrl(), tourCount);
    }
}
