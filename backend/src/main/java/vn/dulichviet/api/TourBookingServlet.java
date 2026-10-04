package vn.dulichviet.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.mindrot.jbcrypt.BCrypt;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;
import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public final class TourBookingServlet extends HttpServlet {
    private static final ObjectMapper JSON = new ObjectMapper()
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    private static final Properties LOCAL_CONFIGURATION = loadLocalConfiguration();
    private SecretKey jwtKey;

    @Override
    public void init() throws ServletException {
        String secret = configuration("JWT_SECRET");
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            byte[] generatedSecret = new byte[32];
            new SecureRandom().nextBytes(generatedSecret);
            jwtKey = Keys.hmacShaKeyFor(generatedSecret);
            getServletContext().log(
                    "WARNING: JWT_SECRET is missing or too short. A temporary random JWT key was generated. "
                            + "Existing tokens will become invalid when Tomcat restarts; configure a stable "
                            + "JWT_SECRET for persistent sessions or multiple Tomcat instances.");
            return;
        }
        jwtKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) {
        setCorsHeaders(request, response);
        response.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handle(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handle(request, response);
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handle(request, response);
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handle(request, response);
    }

    private void handle(HttpServletRequest request, HttpServletResponse response) throws IOException {
        setCorsHeaders(request, response);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json");
        String path = request.getPathInfo();
        if (path == null || path.isBlank()) {
            path = "/";
        }
        if (path.length() > 1 && path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }

        try (Connection connection = connection()) {
            Object result = dispatch(request, connection, path);
            if (result == null) {
                response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            } else {
                write(response, HttpServletResponse.SC_OK, result);
            }
        } catch (ApiException e) {
            write(response, e.status, Map.of("message", e.getMessage()));
        } catch (JsonProcessingException e) {
            write(response, HttpServletResponse.SC_BAD_REQUEST, Map.of("message", "JSON không hợp lệ."));
        } catch (SQLException e) {
            getServletContext().log("TourBooking API database request failed.", e);
            write(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, databaseError(e));
        }
    }

    private Object dispatch(HttpServletRequest request, Connection connection, String path)
            throws SQLException, IOException {
        String method = request.getMethod();

        if ("POST".equals(method) && "/auth/login".equals(path)) {
            return login(connection, body(request));
        }
        if ("POST".equals(method) && "/auth/register".equals(path)) {
            return register(connection, body(request));
        }
        if ("GET".equals(method) && "/categories".equals(path)) {
            return categories(connection, true);
        }
        if ("GET".equals(method) && path.startsWith("/categories/")) {
            return categoryById(connection, id(lastPart(path)));
        }
        if ("GET".equals(method) && "/tours".equals(path)) {
            return tours(connection, "t.status='ACTIVE'", List.of());
        }
        if ("GET".equals(method) && "/tours/search".equals(path)) {
            String keyword = request.getParameter("keyword");
            if (keyword == null || keyword.isBlank()) {
                return tours(connection, "t.status='ACTIVE'", List.of());
            }
            String pattern = "%" + keyword.trim() + "%";
            return tours(connection, "t.status='ACTIVE' AND (t.tour_name LIKE ? OR t.description LIKE ? OR t.departure_location LIKE ?)",
                    List.of(pattern, pattern, pattern));
        }
        if ("GET".equals(method) && "/tours/filter".equals(path)) {
            List<Object> values = new ArrayList<>();
            StringBuilder where = new StringBuilder("t.status='ACTIVE'");
            addNumericFilter(request, "categoryId", "t.category_id", where, values, true);
            addNumericFilter(request, "minPrice", "t.price", where, values, false);
            addNumericFilter(request, "maxPrice", "t.price", where, values, false);
            return tours(connection, where.toString(), values);
        }
        if ("GET".equals(method) && path.startsWith("/tours/category/")) {
            return tours(connection, "t.status='ACTIVE' AND t.category_id=?",
                    List.of(id(lastPart(path))));
        }
        if ("GET".equals(method) && path.startsWith("/tours/")) {
            return tourById(connection, id(lastPart(path)));
        }

        Principal principal = authenticate(request, connection);
        if ("/users/me".equals(path) && "GET".equals(method)) {
            return userById(connection, principal.userId);
        }
        if ("/users/me".equals(path) && "PUT".equals(method)) {
            return updateProfile(connection, principal, body(request));
        }
        if ("/users/me/password".equals(path) && "PUT".equals(method)) {
            return updatePassword(connection, principal, body(request));
        }
        if ("/orders".equals(path) && "POST".equals(method)) {
            return createOrder(connection, principal, body(request));
        }
        if ("/orders/my".equals(path) && "GET".equals(method)) {
            return ordersForUser(connection, principal.userId);
        }
        if (path.startsWith("/orders/")) {
            String[] parts = path.split("/");
            int orderId = id(parts[2]);
            if (parts.length == 4 && "cancel".equals(parts[3]) && "PUT".equals(method)) {
                return cancelOrder(connection, principal, orderId);
            }
            if (parts.length == 3 && "GET".equals(method)) {
                Map<String, Object> order = orderById(connection, orderId);
                if (principal.role.equals("ADMIN") || number(order.get("userId")) == principal.userId) {
                    return order;
                }
                throw new ApiException(403, "Bạn không có quyền xem đơn hàng này.");
            }
        }

        if (path.startsWith("/admin/")) {
            requireAdmin(principal);
            return dispatchAdmin(request, connection, path, principal);
        }
        throw new ApiException(404, "Không tìm thấy API.");
    }

    private Object dispatchAdmin(HttpServletRequest request, Connection connection, String path, Principal principal)
            throws SQLException, IOException {
        String method = request.getMethod();
        String[] parts = path.split("/");
        JsonNode body;

        if ("/admin/dashboard".equals(path) && "GET".equals(method)) {
            return dashboard(connection);
        }
        if ("/admin/tours".equals(path)) {
            if ("GET".equals(method)) {
                return tours(connection, "1=1", List.of());
            }
            if ("POST".equals(method)) {
                return createTour(connection, body(request));
            }
        }
        if (parts.length == 4 && "tours".equals(parts[2])) {
            int tourId = id(parts[3]);
            if ("GET".equals(method)) {
                return tourById(connection, tourId);
            }
            if ("PUT".equals(method)) {
                return updateTour(connection, tourId, body(request));
            }
            if ("DELETE".equals(method)) {
                deleteTour(connection, tourId);
                return Map.of("message", "Đã xóa tour thành công.");
            }
        }
        if (parts.length == 5 && "tours".equals(parts[2]) && "toggle-status".equals(parts[4])
                && "PUT".equals(method)) {
            return toggleTourStatus(connection, id(parts[3]));
        }
        if ("/admin/categories".equals(path)) {
            if ("GET".equals(method)) {
                return categories(connection, false);
            }
            if ("POST".equals(method)) {
                return createCategory(connection, body(request));
            }
        }
        if (parts.length == 4 && "categories".equals(parts[2])) {
            int categoryId = id(parts[3]);
            if ("GET".equals(method)) {
                return categoryById(connection, categoryId);
            }
            if ("PUT".equals(method)) {
                return updateCategory(connection, categoryId, body(request));
            }
            if ("DELETE".equals(method)) {
                deleteCategory(connection, categoryId);
                return Map.of("message", "Đã xóa danh mục thành công.");
            }
        }
        if ("/admin/users".equals(path) && "GET".equals(method)) {
            return users(connection);
        }
        if (parts.length >= 4 && "users".equals(parts[2])) {
            int userId = id(parts[3]);
            if (parts.length == 5 && "orders".equals(parts[4]) && "GET".equals(method)) {
                return ordersForUser(connection, userId);
            }
            if (parts.length == 4 && "GET".equals(method)) {
                return userById(connection, userId);
            }
            if (parts.length == 4 && "PUT".equals(method)) {
                body = body(request);
                if (userId == principal.userId
                        && (("CUSTOMER".equals(text(body, "role", null)))
                        || (body.has("isActive") && !body.get("isActive").asBoolean()))) {
                    throw new ApiException(400, "Không thể tự hạ quyền hoặc khóa tài khoản đang đăng nhập.");
                }
                return updateUser(connection, userId, body);
            }
            if (parts.length == 4 && "DELETE".equals(method)) {
                if (userId == principal.userId) {
                    throw new ApiException(400, "Không thể xóa tài khoản đang đăng nhập.");
                }
                deleteUser(connection, userId);
                return Map.of("message", "Đã xóa người dùng thành công.");
            }
        }
        if ("/admin/orders".equals(path) && "GET".equals(method)) {
            return allOrders(connection);
        }
        if (parts.length == 4 && "orders".equals(parts[2])) {
            int orderId = id(parts[3]);
            if ("GET".equals(method)) {
                return orderById(connection, orderId);
            }
        }
        if (parts.length == 5 && "orders".equals(parts[2]) && "status".equals(parts[4])
                && "PUT".equals(method)) {
            String status = request.getParameter("status");
            if (status == null) {
                status = text(body(request), "status", null);
            }
            return updateOrderStatus(connection, id(parts[3]), status);
        }
        if (parts.length == 7 && "orders".equals(parts[2]) && "details".equals(parts[4])
                && "quantity".equals(parts[6]) && "PUT".equals(method)) {
            String value = request.getParameter("quantity");
            if (value == null) {
                value = text(body(request), "quantity", null);
            }
            int quantity = integer(value);
            return updateOrderQuantity(connection, id(parts[3]), id(parts[5]), quantity);
        }
        throw new ApiException(404, "Không tìm thấy API quản trị.");
    }

    private Map<String, Object> login(Connection connection, JsonNode body) throws SQLException {
        String username = text(body, "username", "");
        String password = text(body, "password", "");
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT user_id, password, is_active FROM Users WHERE username=?")) {
            statement.setString(1, username);
            try (ResultSet result = statement.executeQuery()) {
                if (!result.next() || !BCrypt.checkpw(password, result.getString("password"))) {
                    throw new ApiException(401, "Tên đăng nhập hoặc mật khẩu không chính xác.");
                }
                if (!result.getBoolean("is_active")) {
                    throw new ApiException(403, "Tài khoản đã bị khóa.");
                }
                int userId = result.getInt("user_id");
                Map<String, Object> user = userById(connection, userId);
                String token = Jwts.builder()
                        .subject(Integer.toString(userId))
                        .claim("role", user.get("role"))
                        .issuedAt(java.util.Date.from(Instant.now()))
                        .expiration(java.util.Date.from(Instant.now().plus(7, ChronoUnit.DAYS)))
                        .signWith(jwtKey)
                        .compact();
                Map<String, Object> response = new LinkedHashMap<>();
                response.put("token", token);
                response.put("type", "Bearer");
                response.put("userId", user.get("id"));
                response.put("username", user.get("username"));
                response.put("email", user.get("email"));
                response.put("role", user.get("role"));
                response.put("fullName", user.get("fullName"));
                response.put("phone", user.get("phone"));
                response.put("address", user.get("address"));
                return response;
            }
        }
    }

    private Map<String, Object> register(Connection connection, JsonNode body) throws SQLException {
        String username = text(body, "username", "").trim();
        String email = text(body, "email", "").trim();
        String password = text(body, "password", "");
        if (username.isBlank() || email.isBlank() || password.length() < 6) {
            throw new ApiException(400, "Vui lòng nhập tên đăng nhập, email và mật khẩu tối thiểu 6 ký tự.");
        }
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT COUNT(*) FROM Users WHERE LOWER(username)=LOWER(?) OR LOWER(email)=LOWER(?)")) {
            statement.setString(1, username);
            statement.setString(2, email);
            try (ResultSet result = statement.executeQuery()) {
                result.next();
                if (result.getInt(1) > 0) {
                    throw new ApiException(400, "Tên đăng nhập hoặc email đã tồn tại.");
                }
            }
        }
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO Users(username,password,email,full_name,role,phone,address,is_active) VALUES(?,?,?,?, 'CUSTOMER', ?, '', 1)")) {
            statement.setString(1, username);
            statement.setString(2, BCrypt.hashpw(password, BCrypt.gensalt(10)));
            statement.setString(3, email);
            statement.setString(4, text(body, "fullName", username));
            statement.setString(5, text(body, "phone", ""));
            statement.executeUpdate();
        }
        return Map.of("message", "Đăng ký tài khoản thành công.");
    }

    private List<Map<String, Object>> categories(Connection connection, boolean includeTourCount) throws SQLException {
        String sql = "SELECT c.category_id,c.category_name,c.description,c.image_url"
                + (includeTourCount ? ",(SELECT COUNT(*) FROM Tours t WHERE t.category_id=c.category_id) AS tour_count" : "")
                + " FROM Categories c ORDER BY c.category_id";
        try (PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet result = statement.executeQuery()) {
            List<Map<String, Object>> rows = new ArrayList<>();
            while (result.next()) {
                rows.add(categoryMap(result, includeTourCount));
            }
            return rows;
        }
    }

    private Map<String, Object> categoryById(Connection connection, int categoryId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT c.category_id,c.category_name,c.description,c.image_url FROM Categories c WHERE c.category_id=?")) {
            statement.setInt(1, categoryId);
            try (ResultSet result = statement.executeQuery()) {
                if (!result.next()) {
                    throw new ApiException(404, "Không tìm thấy danh mục.");
                }
                return categoryMap(result, false);
            }
        }
    }

    private Map<String, Object> categoryMap(ResultSet result, boolean includeTourCount) throws SQLException {
        int id = result.getInt("category_id");
        String name = result.getString("category_name");
        Map<String, Object> category = new LinkedHashMap<>();
        category.put("id", id);
        category.put("categoryId", id);
        category.put("name", name);
        category.put("categoryName", name);
        category.put("description", result.getString("description"));
        category.put("imageUrl", result.getString("image_url"));
        if (includeTourCount) {
            category.put("tourCount", result.getInt("tour_count"));
        }
        return category;
    }

    private List<Map<String, Object>> tours(Connection connection, String where, List<?> values) throws SQLException {
        String sql = "SELECT t.*,c.category_name FROM Tours t JOIN Categories c ON c.category_id=t.category_id WHERE "
                + where + " ORDER BY t.tour_id";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            bind(statement, values);
            try (ResultSet result = statement.executeQuery()) {
                List<Map<String, Object>> rows = new ArrayList<>();
                while (result.next()) {
                    rows.add(tourMap(result));
                }
                return rows;
            }
        }
    }

    private Map<String, Object> tourById(Connection connection, int tourId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT t.*,c.category_name FROM Tours t JOIN Categories c ON c.category_id=t.category_id WHERE t.tour_id=?")) {
            statement.setInt(1, tourId);
            try (ResultSet result = statement.executeQuery()) {
                if (!result.next()) {
                    throw new ApiException(404, "Không tìm thấy tour.");
                }
                return tourMap(result);
            }
        }
    }

    private Map<String, Object> tourMap(ResultSet result) throws SQLException {
        int id = result.getInt("tour_id");
        int categoryId = result.getInt("category_id");
        String categoryName = result.getString("category_name");
        Map<String, Object> category = new LinkedHashMap<>();
        category.put("id", categoryId);
        category.put("categoryId", categoryId);
        category.put("name", categoryName);
        category.put("categoryName", categoryName);
        Map<String, Object> tour = new LinkedHashMap<>();
        tour.put("id", id);
        tour.put("tourId", id);
        tour.put("categoryId", categoryId);
        tour.put("category", category);
        tour.put("name", result.getString("tour_name"));
        tour.put("tourName", result.getString("tour_name"));
        tour.put("description", result.getString("description"));
        tour.put("price", result.getBigDecimal("price"));
        tour.put("duration", result.getInt("duration"));
        tour.put("departureLocation", result.getString("departure_location"));
        tour.put("imageUrl", result.getString("image_url"));
        tour.put("availableSeats", result.getInt("available_seats"));
        tour.put("startDate", result.getString("start_date"));
        tour.put("endDate", result.getString("end_date"));
        tour.put("status", result.getString("status"));
        tour.put("rating", result.getBigDecimal("rating"));
        tour.put("createdAt", result.getTimestamp("created_at"));
        return tour;
    }

    private Map<String, Object> userById(Connection connection, int userId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT user_id,username,email,full_name,role,phone,address,is_active,created_at FROM Users WHERE user_id=?")) {
            statement.setInt(1, userId);
            try (ResultSet result = statement.executeQuery()) {
                if (!result.next()) {
                    throw new ApiException(404, "Không tìm thấy người dùng.");
                }
                return userMap(result);
            }
        }
    }

    private List<Map<String, Object>> users(Connection connection) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT user_id,username,email,full_name,role,phone,address,is_active,created_at FROM Users ORDER BY user_id");
             ResultSet result = statement.executeQuery()) {
            List<Map<String, Object>> rows = new ArrayList<>();
            while (result.next()) {
                rows.add(userMap(result));
            }
            return rows;
        }
    }

    private Map<String, Object> userMap(ResultSet result) throws SQLException {
        int id = result.getInt("user_id");
        Map<String, Object> user = new LinkedHashMap<>();
        user.put("id", id);
        user.put("userId", id);
        user.put("username", result.getString("username"));
        user.put("email", result.getString("email"));
        user.put("fullName", result.getString("full_name"));
        user.put("role", result.getString("role"));
        user.put("phone", result.getString("phone"));
        user.put("address", result.getString("address"));
        user.put("isActive", result.getBoolean("is_active"));
        user.put("createdAt", result.getTimestamp("created_at"));
        return user;
    }

    private Map<String, Object> updateProfile(Connection connection, Principal principal, JsonNode body)
            throws SQLException {
        String email = text(body, "email", null);
        if (email != null) {
            try (PreparedStatement statement = connection.prepareStatement(
                    "SELECT COUNT(*) FROM Users WHERE LOWER(email)=LOWER(?) AND user_id<>?")) {
                statement.setString(1, email);
                statement.setInt(2, principal.userId);
                try (ResultSet result = statement.executeQuery()) {
                    result.next();
                    if (result.getInt(1) > 0) {
                        throw new ApiException(400, "Email đã được sử dụng bởi tài khoản khác.");
                    }
                }
            }
        }
        try (PreparedStatement statement = connection.prepareStatement(
                "UPDATE Users SET full_name=COALESCE(NULLIF(?,''),full_name), email=COALESCE(?,email),"
                        + " phone=COALESCE(?,phone), address=COALESCE(?,address) WHERE user_id=?")) {
            statement.setString(1, text(body, "fullName", null));
            statement.setString(2, email);
            statement.setString(3, text(body, "phone", null));
            statement.setString(4, text(body, "address", null));
            statement.setInt(5, principal.userId);
            statement.executeUpdate();
        }
        return userById(connection, principal.userId);
    }

    private Map<String, Object> updatePassword(Connection connection, Principal principal, JsonNode body)
            throws SQLException {
        String oldPassword = text(body, "oldPassword", "");
        String newPassword = text(body, "newPassword", "");
        if (newPassword.length() < 6) {
            throw new ApiException(400, "Mật khẩu mới phải có ít nhất 6 ký tự.");
        }
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT password FROM Users WHERE user_id=?")) {
            statement.setInt(1, principal.userId);
            try (ResultSet result = statement.executeQuery()) {
                if (!result.next() || !BCrypt.checkpw(oldPassword, result.getString("password"))) {
                    throw new ApiException(400, "Mật khẩu hiện tại không chính xác.");
                }
            }
        }
        try (PreparedStatement statement = connection.prepareStatement(
                "UPDATE Users SET password=? WHERE user_id=?")) {
            statement.setString(1, BCrypt.hashpw(newPassword, BCrypt.gensalt(10)));
            statement.setInt(2, principal.userId);
            statement.executeUpdate();
        }
        return Map.of("message", "Đổi mật khẩu thành công.");
    }

    private Map<String, Object> createOrder(Connection connection, Principal principal, JsonNode body)
            throws SQLException {
        JsonNode items = body.path("items");
        if (!items.isArray() || items.isEmpty()) {
            throw new ApiException(400, "Đơn hàng phải có ít nhất một tour.");
        }
        String contactName = text(body, "contactName", "");
        String contactPhone = text(body, "contactPhone", "");
        String contactEmail = text(body, "contactEmail", "");
        if (contactName.isBlank() || contactPhone.isBlank() || contactEmail.isBlank()) {
            throw new ApiException(400, "Vui lòng nhập đầy đủ thông tin liên hệ.");
        }
        connection.setAutoCommit(false);
        try {
            List<OrderItem> orderItems = new ArrayList<>();
            Map<Integer, Integer> requestedQuantities = new LinkedHashMap<>();
            for (JsonNode item : items) {
                int tourId = id(text(item, "tourId", null));
                int quantity = integer(text(item, "quantity", "1"));
                if (quantity < 1) {
                    throw new ApiException(400, "Số lượng vé phải lớn hơn 0.");
                }
                requestedQuantities.merge(tourId, quantity, Integer::sum);
            }
            BigDecimal total = BigDecimal.ZERO;
            for (Map.Entry<Integer, Integer> requested : requestedQuantities.entrySet()) {
                int tourId = requested.getKey();
                int quantity = requested.getValue();
                try (PreparedStatement statement = connection.prepareStatement(
                        "SELECT price,available_seats,status,start_date,end_date FROM Tours WHERE tour_id=? FOR UPDATE")) {
                    statement.setInt(1, tourId);
                    try (ResultSet result = statement.executeQuery()) {
                        if (!result.next() || !"ACTIVE".equals(result.getString("status"))) {
                            throw new ApiException(400, "Một trong các tour không còn mở bán.");
                        }
                        Date departureDate = result.getDate("start_date");
                        if (departureDate == null) {
                            departureDate = result.getDate("end_date");
                        }
                        if (departureDate != null && departureDate.before(Date.valueOf(java.time.LocalDate.now()))) {
                            throw new ApiException(400, "Ngày khởi hành của tour đã qua; vui lòng cập nhật lịch trước khi đặt.");
                        }
                        int seats = result.getInt("available_seats");
                        if (seats < quantity) {
                            throw new ApiException(400, "Tour không đủ chỗ trống cho số lượng đã chọn.");
                        }
                        BigDecimal unitPrice = result.getBigDecimal("price");
                        orderItems.add(new OrderItem(tourId, quantity, unitPrice));
                        total = total.add(unitPrice.multiply(BigDecimal.valueOf(quantity)));
                    }
                }
            }
            int orderId;
            try (PreparedStatement statement = connection.prepareStatement(
                    "INSERT INTO Orders(user_id,total_amount,status,contact_name,contact_phone,contact_email,notes)"
                            + " VALUES(?,?,'PENDING',?,?,?,?)", Statement.RETURN_GENERATED_KEYS)) {
                statement.setInt(1, principal.userId);
                statement.setBigDecimal(2, total);
                statement.setString(3, contactName);
                statement.setString(4, contactPhone);
                statement.setString(5, contactEmail);
                statement.setString(6, text(body, "notes", ""));
                statement.executeUpdate();
                orderId = generatedId(statement);
            }
            for (OrderItem item : orderItems) {
                try (PreparedStatement detail = connection.prepareStatement(
                        "INSERT INTO OrderDetails(order_id,tour_id,quantity,unit_price) VALUES(?,?,?,?)")) {
                    detail.setInt(1, orderId);
                    detail.setInt(2, item.tourId);
                    detail.setInt(3, item.quantity);
                    detail.setBigDecimal(4, item.unitPrice);
                    detail.executeUpdate();
                }
                try (PreparedStatement updateTour = connection.prepareStatement(
                        "UPDATE Tours SET available_seats=available_seats-? WHERE tour_id=?")) {
                    updateTour.setInt(1, item.quantity);
                    updateTour.setInt(2, item.tourId);
                    updateTour.executeUpdate();
                }
            }
            connection.commit();
            return orderById(connection, orderId);
        } catch (SQLException | RuntimeException e) {
            rollback(connection, e);
            throw e;
        } finally {
            connection.setAutoCommit(true);
        }
    }

    private List<Map<String, Object>> ordersForUser(Connection connection, int userId) throws SQLException {
        return orderList(connection, "SELECT order_id FROM Orders WHERE user_id=? ORDER BY order_date DESC",
                List.of(userId));
    }

    private List<Map<String, Object>> allOrders(Connection connection) throws SQLException {
        return orderList(connection, "SELECT order_id FROM Orders ORDER BY order_date DESC", List.of());
    }

    private List<Map<String, Object>> orderList(Connection connection, String sql, List<?> values)
            throws SQLException {
        List<Integer> orderIds = new ArrayList<>();
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            bind(statement, values);
            try (ResultSet result = statement.executeQuery()) {
                while (result.next()) {
                    orderIds.add(result.getInt("order_id"));
                }
            }
        }
        List<Map<String, Object>> rows = new ArrayList<>(orderIds.size());
        for (int orderId : orderIds) {
            rows.add(orderById(connection, orderId));
        }
        return rows;
    }

    private Map<String, Object> orderById(Connection connection, int orderId) throws SQLException {
        String sql = "SELECT o.*,u.username,u.email AS user_email,u.full_name AS user_full_name"
                + " FROM Orders o JOIN Users u ON u.user_id=o.user_id WHERE o.order_id=?";
        Map<String, Object> order = new LinkedHashMap<>();
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, orderId);
            try (ResultSet result = statement.executeQuery()) {
                if (!result.next()) {
                    throw new ApiException(404, "Không tìm thấy đơn hàng.");
                }
                java.sql.Timestamp orderDate = result.getTimestamp("order_date");
                order.put("id", orderId);
                order.put("orderId", orderId);
                order.put("user", Map.of(
                        "id", result.getInt("user_id"),
                        "username", result.getString("username"),
                        "email", result.getString("user_email"),
                        "fullName", Objects.toString(result.getString("user_full_name"), "")));
                order.put("userId", result.getInt("user_id"));
                order.put("orderDate", orderDate);
                order.put("createdAt", orderDate);
                order.put("totalAmount", result.getBigDecimal("total_amount"));
                order.put("status", result.getString("status"));
                order.put("contactName", result.getString("contact_name"));
                order.put("fullName", result.getString("contact_name"));
                order.put("contactPhone", result.getString("contact_phone"));
                order.put("phone", result.getString("contact_phone"));
                order.put("contactEmail", result.getString("contact_email"));
                order.put("email", result.getString("contact_email"));
                order.put("notes", result.getString("notes"));
            }
        }
        List<Map<String, Object>> details = new ArrayList<>();
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT d.order_detail_id,d.tour_id,d.quantity,d.unit_price,t.tour_name,t.description,t.price,"
                        + "t.duration,t.departure_location,t.image_url,t.available_seats,t.start_date,t.end_date,"
                        + "t.status,t.rating,t.created_at,c.category_id,c.category_name"
                        + " FROM OrderDetails d JOIN Tours t ON t.tour_id=d.tour_id"
                        + " JOIN Categories c ON c.category_id=t.category_id WHERE d.order_id=?")) {
            statement.setInt(1, orderId);
            try (ResultSet result = statement.executeQuery()) {
                while (result.next()) {
                    Map<String, Object> detail = new LinkedHashMap<>();
                    int detailId = result.getInt("order_detail_id");
                    int tourId = result.getInt("tour_id");
                    int quantity = result.getInt("quantity");
                    detail.put("id", detailId);
                    detail.put("orderDetailId", detailId);
                    detail.put("tourId", tourId);
                    detail.put("tour", tourMap(result, tourId));
                    detail.put("quantity", quantity);
                    detail.put("unitPrice", result.getBigDecimal("unit_price"));
                    detail.put("price", result.getBigDecimal("unit_price"));
                    details.add(detail);
                }
            }
        }
        order.put("orderDetails", details);
        return order;
    }

    private Map<String, Object> tourMap(ResultSet result, int id) throws SQLException {
        int categoryId = result.getInt("category_id");
        String categoryName = result.getString("category_name");
        Map<String, Object> category = new LinkedHashMap<>();
        category.put("id", categoryId);
        category.put("categoryId", categoryId);
        category.put("name", categoryName);
        category.put("categoryName", categoryName);
        Map<String, Object> tour = new LinkedHashMap<>();
        tour.put("id", id);
        tour.put("tourId", id);
        tour.put("categoryId", categoryId);
        tour.put("category", category);
        tour.put("name", result.getString("tour_name"));
        tour.put("tourName", result.getString("tour_name"));
        tour.put("description", result.getString("description"));
        tour.put("price", result.getBigDecimal("price"));
        tour.put("duration", result.getInt("duration"));
        tour.put("departureLocation", result.getString("departure_location"));
        tour.put("imageUrl", result.getString("image_url"));
        tour.put("availableSeats", result.getInt("available_seats"));
        tour.put("startDate", result.getString("start_date"));
        tour.put("endDate", result.getString("end_date"));
        tour.put("status", result.getString("status"));
        tour.put("rating", result.getBigDecimal("rating"));
        tour.put("createdAt", result.getTimestamp("created_at"));
        return tour;
    }

    private Map<String, Object> cancelOrder(Connection connection, Principal principal, int orderId)
            throws SQLException {
        connection.setAutoCommit(false);
        try {
            String status;
            int ownerId;
            try (PreparedStatement statement = connection.prepareStatement(
                    "SELECT user_id,status FROM Orders WHERE order_id=? FOR UPDATE")) {
                statement.setInt(1, orderId);
                try (ResultSet result = statement.executeQuery()) {
                    if (!result.next()) {
                        throw new ApiException(404, "Không tìm thấy đơn hàng.");
                    }
                    ownerId = result.getInt("user_id");
                    status = result.getString("status");
                }
            }
            if (ownerId != principal.userId && !"ADMIN".equals(principal.role)) {
                throw new ApiException(403, "Bạn không có quyền hủy đơn hàng này.");
            }
            if (!"PENDING".equals(status)) {
                throw new ApiException(400, "Chỉ có thể hủy đơn hàng đang chờ xử lý.");
            }
            restoreSeats(connection, orderId);
            try (PreparedStatement statement = connection.prepareStatement(
                    "UPDATE Orders SET status='CANCELLED' WHERE order_id=?")) {
                statement.setInt(1, orderId);
                statement.executeUpdate();
            }
            connection.commit();
            return Map.of("message", "Đã hủy đơn hàng thành công.", "order", orderById(connection, orderId));
        } catch (SQLException | RuntimeException e) {
            rollback(connection, e);
            throw e;
        } finally {
            connection.setAutoCommit(true);
        }
    }

    private Map<String, Object> dashboard(Connection connection) throws SQLException {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalTours", scalar(connection, "SELECT COUNT(*) FROM Tours WHERE status='ACTIVE'"));
        result.put("totalOrders", scalar(connection, "SELECT COUNT(*) FROM Orders"));
        result.put("totalUsers", scalar(connection, "SELECT COUNT(*) FROM Users"));
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT COALESCE(SUM(total_amount),0) FROM Orders WHERE status IN ('COMPLETED','CONFIRMED')");
             ResultSet row = statement.executeQuery()) {
            row.next();
            result.put("totalRevenue", row.getBigDecimal(1));
        }
        result.put("recentOrders", orderList(connection,
                "SELECT order_id FROM Orders ORDER BY order_date DESC LIMIT 5", List.of()));
        return result;
    }

    private Map<String, Object> createTour(Connection connection, JsonNode body) throws SQLException {
        int categoryId = optionalInt(body, "categoryId", firstCategoryId(connection));
        categoryById(connection, categoryId);
        String name = firstNonBlank(text(body, "name", null), text(body, "tourName", null), "Tour mới");
        BigDecimal price = decimal(body, "price", BigDecimal.ZERO);
        if (price.signum() <= 0) {
            throw new ApiException(400, "Giá tour phải lớn hơn 0.");
        }
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO Tours(category_id,tour_name,description,price,duration,departure_location,image_url,"
                        + "available_seats,start_date,end_date,status,rating) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                Statement.RETURN_GENERATED_KEYS)) {
            bindTour(statement, categoryId, name, body, price, null);
            statement.executeUpdate();
            return tourById(connection, generatedId(statement));
        }
    }

    private Map<String, Object> updateTour(Connection connection, int tourId, JsonNode body) throws SQLException {
        Map<String, Object> existing = tourById(connection, tourId);
        int categoryId = optionalInt(body, "categoryId", number(existing.get("categoryId")));
        categoryById(connection, categoryId);
        String name = firstNonBlank(text(body, "name", null), text(body, "tourName", null),
                Objects.toString(existing.get("name"), ""));
        BigDecimal price = decimal(body, "price", (BigDecimal) existing.get("price"));
        if (price.signum() <= 0) {
            throw new ApiException(400, "Giá tour phải lớn hơn 0.");
        }
        try (PreparedStatement statement = connection.prepareStatement(
                "UPDATE Tours SET category_id=?,tour_name=?,description=?,price=?,duration=?,departure_location=?,"
                        + "image_url=?,available_seats=?,start_date=?,end_date=?,status=?,rating=? WHERE tour_id=?")) {
            bindTour(statement, categoryId, name, body, price, existing);
            statement.setInt(13, tourId);
            statement.executeUpdate();
        }
        return tourById(connection, tourId);
    }

    private void bindTour(PreparedStatement statement, int categoryId, String name, JsonNode body,
                          BigDecimal price, Map<String, Object> existing) throws SQLException {
        statement.setInt(1, categoryId);
        statement.setString(2, name);
        statement.setString(3, value(body, "description", existing, ""));
        statement.setBigDecimal(4, price);
        statement.setInt(5, optionalInt(body, "duration", existing == null ? 1 : number(existing.get("duration"))));
        statement.setString(6, value(body, "departureLocation", existing, ""));
        statement.setString(7, value(body, "imageUrl", existing, ""));
        statement.setInt(8, optionalInt(body, "availableSeats", existing == null ? 0 : number(existing.get("availableSeats"))));
        setDate(statement, 9, value(body, "startDate", existing, null));
        setDate(statement, 10, value(body, "endDate", existing, null));
        statement.setString(11, value(body, "status", existing, "ACTIVE"));
        statement.setBigDecimal(12, decimal(body, "rating",
                existing == null ? new BigDecimal("4.5") : (BigDecimal) existing.get("rating")));
    }

    private Map<String, Object> toggleTourStatus(Connection connection, int tourId) throws SQLException {
        Map<String, Object> tour = tourById(connection, tourId);
        String status = "ACTIVE".equals(tour.get("status")) ? "INACTIVE" : "ACTIVE";
        try (PreparedStatement statement = connection.prepareStatement(
                "UPDATE Tours SET status=? WHERE tour_id=?")) {
            statement.setString(1, status);
            statement.setInt(2, tourId);
            statement.executeUpdate();
        }
        return tourById(connection, tourId);
    }

    private void deleteTour(Connection connection, int tourId) throws SQLException {
        tourById(connection, tourId);
        if (count(connection, "SELECT COUNT(*) FROM OrderDetails WHERE tour_id=?", tourId) > 0) {
            throw new ApiException(400, "Không thể xóa tour đã có trong đơn hàng.");
        }
        execute(connection, "DELETE FROM Tours WHERE tour_id=?", tourId);
    }

    private Map<String, Object> createCategory(Connection connection, JsonNode body) throws SQLException {
        String name = firstNonBlank(text(body, "name", null), text(body, "categoryName", null));
        if (name == null) {
            throw new ApiException(400, "Tên danh mục không được để trống.");
        }
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO Categories(category_name,description,image_url) VALUES(?,?,?)",
                Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, name);
            statement.setString(2, text(body, "description", ""));
            statement.setString(3, text(body, "imageUrl", ""));
            statement.executeUpdate();
            return categoryById(connection, generatedId(statement));
        }
    }

    private Map<String, Object> updateCategory(Connection connection, int categoryId, JsonNode body)
            throws SQLException {
        Map<String, Object> existing = categoryById(connection, categoryId);
        String name = firstNonBlank(text(body, "name", null), text(body, "categoryName", null),
                Objects.toString(existing.get("name"), ""));
        try (PreparedStatement statement = connection.prepareStatement(
                "UPDATE Categories SET category_name=?,description=?,image_url=? WHERE category_id=?")) {
            statement.setString(1, name);
            statement.setString(2, value(body, "description", existing, ""));
            statement.setString(3, value(body, "imageUrl", existing, ""));
            statement.setInt(4, categoryId);
            statement.executeUpdate();
        }
        return categoryById(connection, categoryId);
    }

    private void deleteCategory(Connection connection, int categoryId) throws SQLException {
        categoryById(connection, categoryId);
        if (count(connection, "SELECT COUNT(*) FROM Tours WHERE category_id=?", categoryId) > 0) {
            throw new ApiException(400, "Không thể xóa danh mục đang có tour.");
        }
        execute(connection, "DELETE FROM Categories WHERE category_id=?", categoryId);
    }

    private Map<String, Object> updateUser(Connection connection, int userId, JsonNode body) throws SQLException {
        userById(connection, userId);
        String role = text(body, "role", null);
        if (role != null && !List.of("ADMIN", "CUSTOMER").contains(role)) {
            throw new ApiException(400, "Vai trò không hợp lệ.");
        }
        try (PreparedStatement statement = connection.prepareStatement(
                "UPDATE Users SET full_name=COALESCE(?,full_name),phone=COALESCE(?,phone),"
                        + "address=COALESCE(?,address),role=COALESCE(?,role),is_active=COALESCE(?,is_active)"
                        + " WHERE user_id=?")) {
            statement.setString(1, text(body, "fullName", null));
            statement.setString(2, text(body, "phone", null));
            statement.setString(3, text(body, "address", null));
            statement.setString(4, role);
            if (body.has("isActive") && !body.get("isActive").isNull()) {
                statement.setBoolean(5, body.get("isActive").asBoolean());
            } else {
                statement.setNull(5, Types.BIT);
            }
            statement.setInt(6, userId);
            statement.executeUpdate();
        }
        return userById(connection, userId);
    }

    private void deleteUser(Connection connection, int userId) throws SQLException {
        userById(connection, userId);
        if (count(connection, "SELECT COUNT(*) FROM Orders WHERE user_id=?", userId) > 0) {
            throw new ApiException(400, "Không thể xóa tài khoản đã có đơn hàng.");
        }
        execute(connection, "DELETE FROM Users WHERE user_id=?", userId);
    }

    private Map<String, Object> updateOrderStatus(Connection connection, int orderId, String status)
            throws SQLException {
        orderById(connection, orderId);
        if (status == null || !List.of("PENDING", "CONFIRMED", "CANCELLED", "COMPLETED").contains(status)) {
            throw new ApiException(400, "Trạng thái đơn hàng không hợp lệ.");
        }
        try (PreparedStatement statement = connection.prepareStatement(
                "UPDATE Orders SET status=? WHERE order_id=?")) {
            statement.setString(1, status);
            statement.setInt(2, orderId);
            statement.executeUpdate();
        }
        return orderById(connection, orderId);
    }

    private Map<String, Object> updateOrderQuantity(Connection connection, int orderId, int detailId, int quantity)
            throws SQLException {
        if (quantity < 1) {
            throw new ApiException(400, "Số lượng vé phải lớn hơn 0.");
        }
        connection.setAutoCommit(false);
        try {
            int tourId;
            int oldQuantity;
            try (PreparedStatement statement = connection.prepareStatement(
                    "SELECT tour_id,quantity FROM OrderDetails WHERE order_detail_id=? AND order_id=?")) {
                statement.setInt(1, detailId);
                statement.setInt(2, orderId);
                try (ResultSet result = statement.executeQuery()) {
                    if (!result.next()) {
                        throw new ApiException(404, "Không tìm thấy chi tiết đơn hàng.");
                    }
                    tourId = result.getInt("tour_id");
                    oldQuantity = result.getInt("quantity");
                }
            }
            int difference = quantity - oldQuantity;
            if (difference > 0) {
                try (PreparedStatement statement = connection.prepareStatement(
                        "UPDATE Tours SET available_seats=available_seats-? WHERE tour_id=? AND available_seats>=?")) {
                    statement.setInt(1, difference);
                    statement.setInt(2, tourId);
                    statement.setInt(3, difference);
                    if (statement.executeUpdate() == 0) {
                        throw new ApiException(400, "Tour không đủ chỗ trống cho số lượng mới.");
                    }
                }
            } else if (difference < 0) {
                try (PreparedStatement statement = connection.prepareStatement(
                        "UPDATE Tours SET available_seats=available_seats+? WHERE tour_id=?")) {
                    statement.setInt(1, -difference);
                    statement.setInt(2, tourId);
                    statement.executeUpdate();
                }
            }
            try (PreparedStatement statement = connection.prepareStatement(
                    "UPDATE OrderDetails SET quantity=? WHERE order_detail_id=?")) {
                statement.setInt(1, quantity);
                statement.setInt(2, detailId);
                statement.executeUpdate();
            }
            execute(connection, "UPDATE Orders SET total_amount=(SELECT SUM(quantity*unit_price)"
                    + " FROM OrderDetails WHERE order_id=?) WHERE order_id=?", orderId, orderId);
            connection.commit();
            return orderDetailById(connection, orderId, detailId);
        } catch (SQLException | RuntimeException e) {
            rollback(connection, e);
            throw e;
        } finally {
            connection.setAutoCommit(true);
        }
    }

    private void restoreSeats(Connection connection, int orderId) throws SQLException {
        List<OrderItem> items = new ArrayList<>();
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT tour_id,quantity FROM OrderDetails WHERE order_id=?")) {
            statement.setInt(1, orderId);
            try (ResultSet result = statement.executeQuery()) {
                while (result.next()) {
                    items.add(new OrderItem(result.getInt("tour_id"), result.getInt("quantity"), BigDecimal.ZERO));
                }
            }
        }
        for (OrderItem item : items) {
            execute(connection, "UPDATE Tours SET available_seats=available_seats+? WHERE tour_id=?",
                    item.quantity, item.tourId);
        }
    }

    private Map<String, Object> orderDetailById(Connection connection, int orderId, int detailId)
            throws SQLException {
        int tourId;
        int quantity;
        BigDecimal unitPrice;
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT order_detail_id,tour_id,quantity,unit_price FROM OrderDetails"
                        + " WHERE order_id=? AND order_detail_id=?")) {
            statement.setInt(1, orderId);
            statement.setInt(2, detailId);
            try (ResultSet result = statement.executeQuery()) {
                if (!result.next()) {
                    throw new ApiException(404, "Không tìm thấy chi tiết đơn hàng.");
                }
                tourId = result.getInt("tour_id");
                quantity = result.getInt("quantity");
                unitPrice = result.getBigDecimal("unit_price");
            }
        }
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("id", detailId);
        detail.put("orderDetailId", detailId);
        detail.put("tourId", tourId);
        detail.put("tour", tourById(connection, tourId));
        detail.put("quantity", quantity);
        detail.put("unitPrice", unitPrice);
        detail.put("price", unitPrice);
        return detail;
    }

    private Principal authenticate(HttpServletRequest request, Connection connection) throws SQLException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new ApiException(401, "Vui lòng đăng nhập để tiếp tục.");
        }
        try {
            Claims claims = Jwts.parser().verifyWith(jwtKey).build()
                    .parseSignedClaims(header.substring(7)).getPayload();
            int userId = Integer.parseInt(claims.getSubject());
            Map<String, Object> user = userById(connection, userId);
            if (!Boolean.TRUE.equals(user.get("isActive"))) {
                throw new ApiException(401, "Tài khoản đã bị khóa.");
            }
            return new Principal(userId, Objects.toString(user.get("role"), ""));
        } catch (ApiException e) {
            if (e.status == 404) {
                throw new ApiException(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
            }
            throw e;
        } catch (JwtException | IllegalArgumentException e) {
            throw new ApiException(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
        }
    }

    private void requireAdmin(Principal principal) {
        if (!"ADMIN".equals(principal.role)) {
            throw new ApiException(403, "Bạn không có quyền quản trị.");
        }
    }

    private Connection connection() throws SQLException {
        String url = configuration("DB_URL");
        if (url == null || url.isBlank()) {
            throw new SQLException("Chưa cấu hình DB_URL. Tạo file %USERPROFILE%\\.tourbooking.properties "
                    + "theo backend/tourbooking.properties.example rồi khởi động lại Tomcat.");
        }
        if (url.startsWith("jdbc:mariadb:")) {
            try {
                Class.forName("org.mariadb.jdbc.Driver");
            } catch (ClassNotFoundException e) {
                throw new SQLException(
                        "Tomcat đang chạy artifact thiếu MariaDB JDBC driver. "
                                + "Deploy WAR Maven backend/target/tourbooking-api.war hoặc thêm "
                                + "mariadb-java-client vào WEB-INF/lib của IntelliJ artifact.",
                        e);
            }
        }
        return DriverManager.getConnection(url, configuration("DB_USERNAME"), configuration("DB_PASSWORD"));
    }

    private void setCorsHeaders(HttpServletRequest request, HttpServletResponse response) {
        String configured = Objects.toString(configuration("CORS_ORIGIN"), "http://localhost:3000");
        String origin = request.getHeader("Origin");
        if (origin != null && Arrays.asList(configured.split(",")).stream().map(String::trim).anyMatch(origin::equals)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Vary", "Origin");
        }
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static String configuration(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            value = System.getProperty(name);
        }
        if (value == null || value.isBlank()) {
            value = LOCAL_CONFIGURATION.getProperty(name);
        }
        return value;
    }

    private static Properties loadLocalConfiguration() {
        Properties properties = new Properties();
        String userHome = System.getProperty("user.home");
        if (userHome == null || userHome.isBlank()) {
            return properties;
        }
        Path configPath = Path.of(userHome, ".tourbooking.properties");
        if (!Files.isRegularFile(configPath)) {
            return properties;
        }
        try (var reader = Files.newBufferedReader(configPath, StandardCharsets.UTF_8)) {
            reader.mark(1);
            if (reader.read() != '\uFEFF') {
                reader.reset();
            }
            properties.load(reader);
            return properties;
        } catch (IOException e) {
            throw new ExceptionInInitializerError(
                    "Cannot read local TourBooking configuration at " + configPath + ": " + e.getMessage());
        }
    }

    private static Map<String, Object> databaseError(SQLException exception) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("message", "Không kết nối hoặc truy vấn được MariaDB.");
        if (Boolean.parseBoolean(configuration("DB_DEBUG"))) {
            SQLException cause = exception;
            while (cause.getNextException() != null) {
                cause = cause.getNextException();
            }
            error.put("detail", cause.getMessage());
            error.put("sqlState", cause.getSQLState());
            error.put("vendorCode", cause.getErrorCode());
        }
        return error;
    }

    private JsonNode body(HttpServletRequest request) throws JsonProcessingException, IOException {
        JsonNode body = JSON.readTree(request.getInputStream());
        if (body == null || !body.isObject()) {
            throw new ApiException(400, "Nội dung yêu cầu phải là JSON object.");
        }
        return body;
    }

    private void write(HttpServletResponse response, int status, Object value) throws IOException {
        response.setStatus(status);
        JSON.writeValue(response.getOutputStream(), value);
    }

    private static void addNumericFilter(HttpServletRequest request, String parameter, String column,
                                         StringBuilder where, List<Object> values, boolean integerValue) {
        String value = request.getParameter(parameter);
        if (value == null || value.isBlank()) {
            return;
        }
        try {
            Object parsed = integerValue ? Integer.parseInt(value) : new BigDecimal(value);
            String operator = "categoryId".equals(parameter) ? "="
                    : "minPrice".equals(parameter) ? ">=" : "<=";
            where.append(" AND ").append(column).append(operator).append("?");
            values.add(parsed);
        } catch (NumberFormatException ignored) {
            // Preserve the existing filter behavior: invalid numeric filters are ignored.
        }
    }

    private static String text(JsonNode body, String field, String fallback) {
        if (body == null || !body.has(field) || body.get(field).isNull()) {
            return fallback;
        }
        return body.get(field).asText();
    }

    private static String value(JsonNode body, String field, Map<String, Object> existing, String fallback) {
        if (body != null && body.has(field) && !body.get(field).isNull()) {
            return body.get(field).asText();
        }
        if (existing != null && existing.containsKey(field)) {
            return Objects.toString(existing.get(field), fallback);
        }
        return fallback;
    }

    private static int optionalInt(JsonNode body, String field, int fallback) {
        String value = text(body, field, null);
        return value == null || value.isBlank() ? fallback : integer(value);
    }

    private static BigDecimal decimal(JsonNode body, String field, BigDecimal fallback) {
        String value = text(body, field, null);
        if (value == null || value.isBlank()) {
            return fallback;
        }
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException e) {
            throw new ApiException(400, "Giá trị " + field + " không hợp lệ.");
        }
    }

    private static int integer(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw new ApiException(400, "Giá trị số không hợp lệ.");
        }
    }

    private static int id(String value) {
        int id = integer(value);
        if (id < 1) {
            throw new ApiException(400, "ID phải là số nguyên dương.");
        }
        return id;
    }

    private static int number(Object value) {
        return ((Number) value).intValue();
    }

    private static String lastPart(String path) {
        return path.substring(path.lastIndexOf('/') + 1);
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private static void setDate(PreparedStatement statement, int index, String value) throws SQLException {
        if (value == null || value.isBlank()) {
            statement.setNull(index, Types.DATE);
        } else {
            try {
                statement.setDate(index, Date.valueOf(value));
            } catch (IllegalArgumentException e) {
                throw new ApiException(400, "Ngày tour phải theo định dạng yyyy-MM-dd.");
            }
        }
    }

    private static int firstCategoryId(Connection connection) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT category_id FROM Categories ORDER BY category_id LIMIT 1");
             ResultSet result = statement.executeQuery()) {
            if (!result.next()) {
                throw new ApiException(400, "Cần tạo ít nhất một danh mục trước khi thêm tour.");
            }
            return result.getInt(1);
        }
    }

    private static int generatedId(PreparedStatement statement) throws SQLException {
        try (ResultSet keys = statement.getGeneratedKeys()) {
            if (!keys.next()) {
                throw new SQLException("The database did not return a generated ID.");
            }
            return keys.getInt(1);
        }
    }

    private static long scalar(Connection connection, String sql) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet result = statement.executeQuery()) {
            result.next();
            return result.getLong(1);
        }
    }

    private static long count(Connection connection, String sql, int value) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, value);
            try (ResultSet result = statement.executeQuery()) {
                result.next();
                return result.getLong(1);
            }
        }
    }

    private static void execute(Connection connection, String sql, Object... values) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            bind(statement, Arrays.asList(values));
            statement.executeUpdate();
        }
    }

    private static void bind(PreparedStatement statement, List<?> values) throws SQLException {
        for (int i = 0; i < values.size(); i++) {
            statement.setObject(i + 1, values.get(i));
        }
    }

    private static void rollback(Connection connection, Exception failure) throws SQLException {
        try {
            connection.rollback();
        } catch (SQLException rollbackFailure) {
            failure.addSuppressed(rollbackFailure);
        }
    }

    private record Principal(int userId, String role) {}
    private record OrderItem(int tourId, int quantity, BigDecimal unitPrice) {}
    private static final class ApiException extends RuntimeException {
        private final int status;

        private ApiException(int status, String message) {
            super(message);
            this.status = status;
        }
    }
}
