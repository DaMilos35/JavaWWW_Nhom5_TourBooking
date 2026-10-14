package vn.dulichviet.tourbooking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.dulichviet.tourbooking.dto.CategoryDto;
import vn.dulichviet.tourbooking.dto.CategoryRequest;
import vn.dulichviet.tourbooking.service.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /** Công khai: lấy danh sách toàn bộ danh mục */
    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAll() {
        return ResponseEntity.ok(categoryService.findAll());
    }

    /** Công khai: lấy 1 danh mục theo id */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(categoryService.findById(id));
    }

    // ---- Chỉ ADMIN ----

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<CategoryDto> create(@jakarta.validation.Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(201).body(categoryService.create(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> update(@PathVariable Integer id,
                                               @jakarta.validation.Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.update(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
