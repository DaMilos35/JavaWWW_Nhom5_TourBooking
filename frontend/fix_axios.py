with open('src/api/axiosConfig.js', 'r', encoding='utf-8') as f:
    content = f.read()

import re
content = re.sub(r'getOrders: .*?\n.*?updateOrderDetail: .*?,', 
    '''getOrders: (page = 0, size = 10) => api.get(/admin/orders?page=0&size=100),
    getOrderById: (id) => api.get(/admin/orders/),
    updateOrderStatus: (id, status) => api.put(/admin/orders//status?status=),
    updateOrderDetail: (orderId, detailId, quantity) => api.put(/admin/orders//details//quantity?quantity=),''', content, flags=re.DOTALL)

with open('src/api/axiosConfig.js', 'w', encoding='utf-8') as f:
    f.write(content)
