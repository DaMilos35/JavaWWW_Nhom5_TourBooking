const fs = require('fs');
const path = require('path');

// 1. Update src/pages/LoginPage.jsx
const loginPath = path.resolve(__dirname, '../src/pages/LoginPage.jsx');
let loginContent = fs.readFileSync(loginPath, 'utf8');

// Replace import
loginContent = loginContent.replace(
  "import React, { useState } from 'react';\r\nimport { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';",
  "import React, { useState, useEffect } from 'react';\r\nimport { useNavigate, useLocation, Link } from 'react-router-dom';"
);
loginContent = loginContent.replace(
  "import React, { useState } from 'react';\nimport { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';",
  "import React, { useState, useEffect } from 'react';\nimport { useNavigate, useLocation, Link } from 'react-router-dom';"
);

// Replace early Navigate
const oldNavRegex = /\r?\n\s*if\s*\(\s*user\s*\)\s*\{\r?\n\s*return\s*<Navigate\s+to="\/"\s+replace\s*\/>;\r?\n\s*\}/;
const newNavReplacement = `\n  // Chuyển hướng an toàn sau khi đã đăng nhập (tránh navigate cứng '/' đè lên '/admin')\n  useEffect(() => {\n    if (user) {\n      const redirectPath = location.state?.from?.pathname \n        || (user.role === 'ADMIN' ? '/admin' : '/');\n      navigate(redirectPath, { replace: true });\n    }\n  }, [user, navigate, location.state]);`;
loginContent = loginContent.replace(oldNavRegex, newNavReplacement);

// Replace login credentials
loginContent = loginContent.replace(
  "const result = await login(credentials);",
  `const result = await login({
        username: credentials.username.trim(),
        password: credentials.password,
        rememberMe,
      });`
);

fs.writeFileSync(loginPath, loginContent, 'utf8');
console.log('LoginPage.jsx updated successfully.');

// 2. Update src/components/common/PrivateRoute.jsx
const privateRoutePath = path.resolve(__dirname, '../src/components/common/PrivateRoute.jsx');
let prContent = fs.readFileSync(privateRoutePath, 'utf8');

const oldAdminRoute = `export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  return isAuthenticated && isAdmin() ? (
    children
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
};`;

const newAdminRoute = `export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return isAdmin() ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
};`;

prContent = prContent.replace(oldAdminRoute.replace(/\n/g, '\r\n'), newAdminRoute.replace(/\n/g, '\r\n'));
prContent = prContent.replace(oldAdminRoute, newAdminRoute);
fs.writeFileSync(privateRoutePath, prContent, 'utf8');
console.log('PrivateRoute.jsx updated successfully.');

// 3. Update src/context/AuthContext.jsx
const authContextPath = path.resolve(__dirname, '../src/context/AuthContext.jsx');
let acContent = fs.readFileSync(authContextPath, 'utf8');

// Ensure isAdmin checks role cleanly
acContent = acContent.replace(
  "const isAdmin = () => user?.role === 'ADMIN';",
  "const isAdmin = () => {\n    if (!user || !user.role) return false;\n    const r = user.role.replace(/^ROLE_/, '');\n    return r === 'ADMIN';\n  };"
);

// Better error messages for backend offline / proxy errors
const oldErrorBlock = `      let message = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.status === 401) {
        message = 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || !error.response) {
        message = 'Không thể kết nối đến máy chủ backend (Port 8080). Vui lòng kiểm tra lại backend Spring Boot.';
      }`;

const newErrorBlock = `      let message = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      const status = error.response?.status;
      const respData = error.response?.data;

      if (respData?.message) {
        message = respData.message;
      } else if (status === 401) {
        message = 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      } else if (status === 403) {
        message = 'Tài khoản của bạn đã bị khóa hoặc không có quyền truy cập.';
      } else if (
        status === 500 ||
        status === 502 || 
        status === 503 || 
        status === 504 || 
        error.code === 'ERR_NETWORK' || 
        error.code === 'ECONNABORTED' ||
        error.message?.includes('Network Error') || 
        error.message?.includes('timeout') ||
        !error.response
      ) {
        message = 'Không thể kết nối đến máy chủ Backend (Port 8080). Vui lòng đảm bảo Spring Boot Backend đã được khởi động!';
      }`;

acContent = acContent.replace(oldErrorBlock.replace(/\n/g, '\r\n'), newErrorBlock.replace(/\n/g, '\r\n'));
acContent = acContent.replace(oldErrorBlock, newErrorBlock);
fs.writeFileSync(authContextPath, acContent, 'utf8');
console.log('AuthContext.jsx updated successfully.');

// 4. Update src/pages/AuthPages.css to include RegisterPage classes and layout fixes
const cssPath = path.resolve(__dirname, '../src/pages/AuthPages.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const extraCss = `
/* Register Card & Form Layout Enhancements */
.register-card {
  max-width: 580px;
}

.form-row {
  display: flex;
  gap: 16px;
  width: 100%;
}

.form-group.half-width {
  flex: 1;
  min-width: 0;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #64748b;
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s ease;
}

.password-toggle:hover {
  color: #0f172a;
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.auth-brand h1 {
  margin-bottom: 0;
  font-size: 2.2rem;
}

.auth-features {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e2e8f0;
  font-size: 0.95rem;
  font-weight: 500;
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
`;

if (!cssContent.includes('.register-card')) {
  cssContent += extraCss;
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log('AuthPages.css updated with register layout styles.');
}
