package com.nhom5.tourbooking.service;

import com.nhom5.tourbooking.dto.OrderRequest;
import com.nhom5.tourbooking.entity.*;
import com.nhom5.tourbooking.exception.ResourceNotFoundException;
import com.nhom5.tourbooking.repository.OrderDetailRepository;
import com.nhom5.tourbooking.repository.OrderRepository;
import com.nhom5.tourbooking.repository.TourRepository;
import com.nhom5.tourbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private TourRepository tourRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Order createOrder(OrderRequest dto, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .contactName(dto.getContactName())
                .contactPhone(dto.getContactPhone())
                .contactEmail(dto.getContactEmail())
                .notes(dto.getNotes())
                .totalAmount(BigDecimal.ZERO)
                .orderDetails(new ArrayList<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderRequest.OrderItemRequest itemReq : dto.getItems()) {
            Tour tour = tourRepository.findById(itemReq.getTourId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tour not found: " + itemReq.getTourId()));

            if (tour.getAvailableSeats() < itemReq.getQuantity()) {
                throw new IllegalStateException("Not enough seats available for tour: " + tour.getTourName());
            }

            tour.setAvailableSeats(tour.getAvailableSeats() - itemReq.getQuantity());
            tourRepository.save(tour);

            OrderDetail detail = OrderDetail.builder()
                    .order(order)
                    .tour(tour)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(tour.getPrice())
                    .build();

            order.getOrderDetails().add(detail);
            
            BigDecimal itemTotal = tour.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        // Send confirmation email asynchronously (in reality would be async)
        emailService.sendOrderConfirmationEmail(dto.getContactEmail(), savedOrder);

        return savedOrder;
    }

    public List<Order> getOrdersByUser(Integer userId) {
        return orderRepository.findByUserUserIdOrderByOrderDateDesc(userId);
    }

    public Optional<Order> getOrderById(Integer id) {
        return orderRepository.findById(id);
    }

    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByOrderDateDesc(pageable);
    }

    @Transactional
    public Order updateOrderStatus(Integer id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
                
        // Handle seat restoration if cancelled
        if (status == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Tour tour = detail.getTour();
                tour.setAvailableSeats(tour.getAvailableSeats() + detail.getQuantity());
                tourRepository.save(tour);
            }
        }
        
        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Transactional
    public OrderDetail updateOrderDetailQuantity(Integer detailId, Integer quantity) {
        OrderDetail detail = orderDetailRepository.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Order detail not found"));

        Order order = detail.getOrder();
        Tour tour = detail.getTour();
        
        int diff = quantity - detail.getQuantity();
        if (diff > 0) {
            if (tour.getAvailableSeats() < diff) {
                throw new IllegalStateException("Not enough seats available");
            }
            tour.setAvailableSeats(tour.getAvailableSeats() - diff);
        } else if (diff < 0) {
            tour.setAvailableSeats(tour.getAvailableSeats() - diff); // diff is negative, so this adds
        }
        
        tourRepository.save(tour);
        
        detail.setQuantity(quantity);
        orderDetailRepository.save(detail);
        
        // Recalculate order total
        BigDecimal newTotal = BigDecimal.ZERO;
        for (OrderDetail d : order.getOrderDetails()) {
            newTotal = newTotal.add(d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity())));
        }
        order.setTotalAmount(newTotal);
        orderRepository.save(order);
        
        return detail;
    }
}
