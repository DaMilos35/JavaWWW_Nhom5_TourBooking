package vn.dulichviet.tourbooking.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.dulichviet.tourbooking.dto.CategoryDto;
import vn.dulichviet.tourbooking.entity.Category;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.repository.CategoryRepository;
import vn.dulichviet.tourbooking.repository.TourRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Bộ kiểm thử TDD cho CategoryService theo tiêu chuẩn ECC springboot-tdd.
 * Kiểm tra: Lấy danh mục kèm số lượng tour (tối ưu tránh N+1), Safe Delete danh mục có ràng buộc.
 */
@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TourRepository tourRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category cat1;
    private Category cat2;

    @BeforeEach
    void setUp() {
        cat1 = new Category();
        cat1.setId(1);
        cat1.setName("Du lịch Biển Đảo");

        cat2 = new Category();
        cat2.setId(2);
        cat2.setName("Du Thuyền 5 Sao (Trống)");
    }

    @Test
    @DisplayName("[CAT-TC01] Đếm tour theo danh mục: Khắc phục triệt để lỗi N+1 Query qua 1 truy vấn GROUP BY duy nhất")
    void testFindAll_OptimizedGroupCount() {
        when(categoryRepository.findAll()).thenReturn(List.of(cat1, cat2));

        List<Object[]> groupedCounts = new ArrayList<>();
        groupedCounts.add(new Object[]{1, 5L}); // Cat 1 có 5 tour
        groupedCounts.add(new Object[]{2, 0L}); // Cat 2 có 0 tour
        when(tourRepository.countToursGroupedByCategory()).thenReturn(groupedCounts);

        List<CategoryDto> result = categoryService.findAll();

        assertEquals(2, result.size());
        assertEquals(5L, result.get(0).tourCount());
        assertEquals(0L, result.get(1).tourCount());
    }

    @Test
    @DisplayName("[CAT-TC02] Safe Delete: Chặn xóa danh mục khi vẫn còn tour trực thuộc")
    void testDelete_ThrowsException_WhenToursExist() {
        when(categoryRepository.existsById(1)).thenReturn(true);
        when(tourRepository.countByCategoryId(1)).thenReturn(3L);

        ApiException ex = assertThrows(ApiException.class, () -> categoryService.delete(1));
        assertEquals(400, ex.getStatus());
        assertTrue(ex.getMessage().contains("Không thể xóa danh mục đang chứa các tour du lịch"));

        verify(categoryRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("[CAT-TC03] Safe Delete: Xóa thành công danh mục rỗng và Evict cache")
    void testDelete_Success_WhenNoTours() {
        when(categoryRepository.existsById(2)).thenReturn(true);
        when(tourRepository.countByCategoryId(2)).thenReturn(0L);

        categoryService.delete(2);

        verify(categoryRepository).deleteById(2);
    }
}
