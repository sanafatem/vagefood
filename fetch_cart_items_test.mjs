import fetch from 'node-fetch';

async function fetchCartItems() {
    try {
        const response = await fetch('http://localhost:3019/cart');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error fetching cart items:', error);
    }
}

fetchCartItems();
