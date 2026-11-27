-- Safe, idempotent migration for existing TourBooking databases.
USE tourbookingdb;

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS notes TEXT NULL,
    ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(40) NULL,
    ADD COLUMN IF NOT EXISTS voucher_discount DECIMAL(18,2) NOT NULL DEFAULT 0.00;

ALTER TABLE orders
    MODIFY COLUMN notes TEXT NULL;

ALTER TABLE orderdetails
    ADD COLUMN IF NOT EXISTS departure_date DATE NULL;

CREATE TABLE IF NOT EXISTS order_passengers (
    passenger_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(20) NULL,
    age_group VARCHAR(50) NULL,
    CONSTRAINT FK_OrderPassengers_Orders FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_order_passengers_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tour_reviews (
    review_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tour_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL,
    trip_type VARCHAR(50) NULL,
    comment VARCHAR(2000) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_TourReviews_Tours FOREIGN KEY (tour_id) REFERENCES tours(tour_id) ON DELETE CASCADE,
    CONSTRAINT FK_TourReviews_Users FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT UQ_TourReviews_Tour_User UNIQUE (tour_id, user_id),
    CONSTRAINT CK_TourReviews_Rating CHECK (rating BETWEEN 1 AND 5),
    INDEX idx_tour_reviews_tour_created (tour_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
