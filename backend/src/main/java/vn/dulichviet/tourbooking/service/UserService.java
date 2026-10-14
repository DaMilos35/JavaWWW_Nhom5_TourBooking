package vn.dulichviet.tourbooking.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.dulichviet.tourbooking.dto.UpdatePasswordRequest;
import vn.dulichviet.tourbooking.dto.UpdateProfileRequest;
import vn.dulichviet.tourbooking.dto.UserDto;
import vn.dulichviet.tourbooking.entity.User;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDto getById(Integer id) {
        return UserDto.from(findById(id));
    }

    @Transactional
    public UserDto updateProfile(Integer id, UpdateProfileRequest request) {
        User user = findById(id);
        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (request.address() != null) {
            user.setAddress(request.address());
        }
        if (request.email() != null && !request.email().isBlank()) {
            user.setEmail(request.email());
        }
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public MapMessage updatePassword(Integer id, UpdatePasswordRequest request) {
        User user = findById(id);
        if (request.oldPassword() == null || request.newPassword() == null || request.newPassword().length() < 6) {
            throw new ApiException(400, "Mật khẩu mới tối thiểu 6 ký tự.");
        }
        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new ApiException(400, "Mật khẩu hiện tại không chính xác.");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        return new MapMessage("Đổi mật khẩu thành công.");
    }

    User findById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy ngưởi dùng."));
    }

    public record MapMessage(String message) {
    }
}
