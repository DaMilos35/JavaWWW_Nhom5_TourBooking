package com.nhom5.tourbooking.service;

import com.nhom5.tourbooking.entity.Order;
import com.nhom5.tourbooking.entity.OrderDetail;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendRegistrationEmail(String toEmail, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Welcome to TourBooking - Registration Successful");

            String htmlContent = "<h3>Welcome " + username + "!</h3>"
                    + "<p>Thank you for registering with TourBooking.</p>"
                    + "<p>We hope you enjoy our services.</p>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public void sendOrderConfirmationEmail(String toEmail, Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("TourBooking - Order Confirmation #" + order.getOrderId());

            StringBuilder htmlContent = new StringBuilder();
            htmlContent.append("<h3>Order Confirmation</h3>");
            htmlContent.append("<p>Dear ").append(order.getContactName()).append(",</p>");
            htmlContent.append("<p>Thank you for your order. Your order ID is: <b>").append(order.getOrderId()).append("</b></p>");
            htmlContent.append("<table border='1' cellpadding='5' cellspacing='0'>");
            htmlContent.append("<tr><th>Tour Name</th><th>Quantity</th><th>Unit Price</th><th>Subtotal</th></tr>");
            
            for (OrderDetail detail : order.getOrderDetails()) {
                double subtotal = detail.getUnitPrice().doubleValue() * detail.getQuantity();
                htmlContent.append("<tr>")
                           .append("<td>").append(detail.getTour().getTourName()).append("</td>")
                           .append("<td>").append(detail.getQuantity()).append("</td>")
                           .append("<td>").append(detail.getUnitPrice()).append(" VND</td>")
                           .append("<td>").append(subtotal).append(" VND</td>")
                           .append("</tr>");
            }
            htmlContent.append("</table>");
            htmlContent.append("<h4>Total Amount: ").append(order.getTotalAmount()).append(" VND</h4>");
            htmlContent.append("<p>We will contact you shortly to confirm details.</p>");

            helper.setText(htmlContent.toString(), true);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}
