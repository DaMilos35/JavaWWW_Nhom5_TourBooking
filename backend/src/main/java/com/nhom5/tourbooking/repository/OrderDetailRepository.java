package com.nhom5.tourbooking.repository;

import com.nhom5.tourbooking.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    List<OrderDetail> findByOrderOrderId(Integer orderId);
    boolean existsByTourTourId(Integer tourId);
}
