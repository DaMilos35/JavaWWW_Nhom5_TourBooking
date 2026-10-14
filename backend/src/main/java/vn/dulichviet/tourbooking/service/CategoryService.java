package vn.dulichviet.tourbooking.service;

import org.springframework.stereotype.Service;
import vn.dulichviet.tourbooking.dto.CategoryDto;
import vn.dulichviet.tourbooking.dto.CategoryRequest;
import vn.dulichviet.tourbooking.entity.Category;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.repository.CategoryRepository;
import vn.dulichviet.tourbooking.repository.TourRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final TourRepository tourRepository;

    public CategoryService(CategoryRepository categoryRepository, TourRepository tourRepository) {
        this.categoryRepository = categoryRepository;
        this.tourRepository = tourRepository;
    }

    public List<CategoryDto> findAll() {
        return categoryRepository.findAll().stream()
                .map(c -> CategoryDto.from(c, tourRepository.countByCategoryId(c.getId())))
                .collect(Collectors.toList());
    }

    public CategoryDto findById(Integer id) {
        return categoryRepository.findById(id)
                .map(c -> CategoryDto.from(c, tourRepository.countByCategoryId(c.getId())))
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy danh mục"));
    }

    public CategoryDto create(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.name());
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());
        Category saved = categoryRepository.save(category);
        return CategoryDto.from(saved, 0L);
    }

    public CategoryDto update(Integer id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy danh mục"));
        category.setName(request.name());
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());
        Category saved = categoryRepository.save(category);
        return CategoryDto.from(saved, tourRepository.countByCategoryId(id));
    }

    public void delete(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new ApiException(404, "Không tìm thấy danh mục");
        }
        if (tourRepository.countByCategoryId(id) > 0) {
            throw new ApiException(400, "Không thể xóa danh mục đang chứa các tour du lịch. Vui lòng xóa hoặc di chuyển các tour trước.");
        }
        categoryRepository.deleteById(id);
    }
}
