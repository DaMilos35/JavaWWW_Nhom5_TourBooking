import os

navbar_css = '''
.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 999;
  height: 80px;
  display: flex;
  align-items: center;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.navbar-logo {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ff5722;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: all 0.3s;
}

.navbar-logo:hover {
  color: #e64a19;
}

.logo-icon {
  font-size: 1.5rem;
  transform: rotate(-45deg);
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 30px;
  margin: 0;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
}

.nav-link {
  color: #333;
  font-weight: 600;
  font-size: 1.05rem;
  text-decoration: none;
  transition: color 0.3s ease;
  padding: 10px 0;
  position: relative;
}

.nav-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 3px;
  background-color: #ff5722;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.nav-link:hover {
  color: #ff5722;
}

.nav-link:hover::after {
  width: 100%;
}

.admin-nav-link {
  color: #d32f2f !important;
  display: flex;
  align-items: center;
  gap: 5px;
}

.admin-nav-link::after {
  background-color: #d32f2f;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 25px;
}

.cart-icon {
  position: relative;
  font-size: 1.4rem;
  color: #555;
  transition: color 0.3s;
  display: flex;
  align-items: center;
}

.cart-icon:hover {
  color: #ff5722;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -10px;
  background: #f44336;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.auth-buttons {
  display: flex;
  gap: 15px;
}

.btn-nav {
  padding: 10px 24px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-login {
  color: #ff5722;
  background-color: transparent;
  border: 2px solid #ff5722;
}

.btn-login:hover {
  background-color: #fff3e0;
}

.btn-register {
  color: white;
  background-color: #ff5722;
  border: 2px solid #ff5722;
  box-shadow: 0 4px 6px rgba(255, 87, 34, 0.2);
}

.btn-register:hover {
  background-color: #f4511e;
  border-color: #f4511e;
  box-shadow: 0 6px 12px rgba(255, 87, 34, 0.3);
  transform: translateY(-1px);
}

.user-dropdown-container {
  position: relative;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff5722, #ff9800);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(255, 87, 34, 0.2);
  transition: transform 0.2s;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-dropdown-menu {
  position: absolute;
  top: 120%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  width: 220px;
  overflow: hidden;
  animation: slideDown 0.3s ease forwards;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-header {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  color: #555;
}

.dropdown-item {
  display: block;
  padding: 12px 15px;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f1f3f5;
  color: #ff5722;
}

.dropdown-divider {
  height: 1px;
  background: #eee;
  margin: 5px 0;
}

.menu-icon {
  display: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
}

@media screen and (max-width: 960px) {
  .nav-menu {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 80px;
    left: -100%;
    width: 100%;
    height: calc(100vh - 80px);
    background: white;
    transition: all 0.3s ease;
    gap: 0;
  }
  
  .nav-menu.active {
    left: 0;
  }
  
  .nav-item {
    width: 100%;
    text-align: center;
  }
  
  .nav-link {
    display: block;
    padding: 20px;
    width: 100%;
    font-size: 1.2rem;
  }
  
  .menu-icon {
    display: block;
  }
  
  .auth-buttons {
    display: none;
  }
}
'''

with open('src/components/layout/Navbar.css', 'w', encoding='utf-8') as f:
    f.write(navbar_css)

print("Created Navbar.css")
