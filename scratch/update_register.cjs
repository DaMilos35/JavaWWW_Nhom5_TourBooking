const fs = require('fs');
const path = require('path');

const regPath = path.resolve(__dirname, '../src/pages/RegisterPage.jsx');
let content = fs.readFileSync(regPath, 'utf8');

const oldCatch = `    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi đăng ký');
    }`;

const newCatch = `    } catch (error) {
      const msg = error.response?.data?.message 
        || (typeof error.response?.data === 'string' && error.response.data.length < 150 ? error.response.data : null)
        || (error.code === 'ERR_NETWORK' || !error.response || error.response?.status >= 500 ? 'Không thể kết nối đến máy chủ Backend (Port 8080). Vui lòng kiểm tra lại backend!' : 'Có lỗi xảy ra khi đăng ký tài khoản.');
      toast.error(msg);
    }`;

content = content.replace(oldCatch.replace(/\n/g, '\r\n'), newCatch.replace(/\n/g, '\r\n'));
content = content.replace(oldCatch, newCatch);
fs.writeFileSync(regPath, content, 'utf8');
console.log('RegisterPage.jsx updated.');
