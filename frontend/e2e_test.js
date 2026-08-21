const axios = require('axios');

const API_URL = 'http://localhost:8080/api';
let token = '';

async function runTest() {
    try {
        console.log('[1] Logging in as admin...');
        const loginRes = await axios.post(API_URL + '/auth/login', {
            username: 'admin',
            password: 'password123'
        });
        token = loginRes.data.token;
        console.log('    -> Login Success! Token length:', token.length);

        const config = { headers: { Authorization: 'Bearer ' + token } };

        console.log('\n[2] Fetching Tours...');
        const toursRes = await axios.get(API_URL + '/tours');
        console.log('    -> Tours fetched:', toursRes.data.length);
        const tourId = toursRes.data[0].id;

        console.log('\n[3] Creating an Order (Checkout)...');
        const orderData = {
            contactName: 'E2E Tester',
            contactPhone: '0987654321',
            contactEmail: 'e2e@tester.com',
            notes: 'Test order from script',
            items: [
                { tourId: tourId, quantity: 2 }
            ]
        };
        const orderRes = await axios.post(API_URL + '/orders', orderData, config);
        console.log('    -> Order Created! ID:', orderRes.data.id);
        const orderId = orderRes.data.id;

        console.log('\n[4] Admin fetching orders...');
        const adminOrdersRes = await axios.get(API_URL + '/admin/orders?page=0&size=100', config);
        console.log('    -> Admin Orders fetched. Total elements:', adminOrdersRes.data.totalElements);

        console.log('\n[5] Admin updating order status to CONFIRMED...');
        const statusRes = await axios.put(API_URL + '/admin/orders/' + orderId + '/status?status=CONFIRMED', null, config);
        console.log('    -> Order Status updated to:', statusRes.data.status);

        console.log('\n[6] Admin updating a Tour...');
        const tourUpdateData = { ...toursRes.data[0], price: 9999999, categoryId: toursRes.data[0].category.id };
        const tourRes = await axios.put(API_URL + '/admin/tours/' + tourId, tourUpdateData, config);
        console.log('    -> Tour Price updated to:', tourRes.data.price);

        console.log('\n=== ALL E2E TESTS PASSED SUCCESSFULLY ===');
    } catch (err) {
        console.error('\n!!! E2E TEST FAILED !!!');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

runTest();
