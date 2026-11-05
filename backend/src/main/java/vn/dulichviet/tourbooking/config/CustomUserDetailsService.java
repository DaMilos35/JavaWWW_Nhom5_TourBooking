package vn.dulichviet.tourbooking.config;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import vn.dulichviet.tourbooking.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String clean = username != null ? username.trim() : "";
        return userRepository.findByUsernameOrEmailIgnoreCase(clean)
                .map(CustomUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("Tên đăng nhập hoặc mật khẩu không chính xác."));
    }
}
