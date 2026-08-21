package com.nhom5.tourbooking.repository;

import com.nhom5.tourbooking.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserUserIdOrderByOrderDateDesc(Integer userId);
    Page<Order> findAllByOrderByOrderDateDesc(Pageable pageable);
    boolean existsByUserUserId(Integer userId);
    List<Order> findTop5ByOrderByOrderDateDesc();
}

