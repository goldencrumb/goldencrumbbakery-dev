// Connect to the UI elements
const productList = document.getElementById('product-list');
const cartBar = document.getElementById('cartBar');
const cartSummary = document.getElementById('cartSummary');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('whatsappCheckout');

// Retrieve the cart from localStorage, or start fresh if empty
let cart = JSON.parse(localStorage.getItem('goldenCrumbCart')) || {};

// Your encoded WhatsApp Number
const secureContact = "OTE3MzA1NTkwMzMz";
const WHATSAPP_NUMBER = atob(secureContact);

// 1. Render the products dynamically based on products.js
function renderProducts() {
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Handle images: if null, use a placeholder
        const imageSrc = product.image ? `images/${product.image}` : `https://via.placeholder.com/250x220?text=Image+Coming+Soon`;
        
        // Check if this product is already in the saved cart
        const currentQty = cart[product.id] ? cart[product.id].quantity : 0;

        // Build the HTML for the card exactly how you designed it
        card.innerHTML = `
            <img src="${imageSrc}" alt="${product.name}">
            <div class="card-content">
                <h3>${product.name}</h3>
                <p>${product.weight}</p>
                <div class="price">₹${product.price}</div>
                <div class="quantity-selector">
                    <button class="qty-btn minus" onclick="updateQty(${product.id}, -1)">-</button>
                    <span class="qty-count" id="qty-${product.id}">${currentQty}</span>
                    <button class="qty-btn plus" onclick="updateQty(${product.id}, 1)">+</button>
                </div>
            </div>
        `;
        productList.appendChild(card);
    });
    
    // Calculate total immediately in case there was saved data in localStorage
    calculateTotal(); 
}

// 2. Handle button clicks
function updateQty(productId, change) {
    const product = products.find(p => p.id === productId);

    // If item isn't in cart yet, add its basic info
    if (!cart[productId]) {
        cart[productId] = { name: product.name, price: product.price, quantity: 0 };
    }

    // Update the quantity
    cart[productId].quantity += change;

    // If it drops to 0 or below, remove it entirely
    if (cart[productId].quantity <= 0) {
        delete cart[productId];
        document.getElementById(`qty-${productId}`).textContent = 0;
    } else {
        document.getElementById(`qty-${productId}`).textContent = cart[productId].quantity;
    }

    // Save to local storage and update the sticky bar
    localStorage.setItem('goldenCrumbCart', JSON.stringify(cart));
    calculateTotal();
}

// 3. Update the UI and prep the WhatsApp link
function calculateTotal() {
    let totalItems = 0;
    let totalPrice = 0;
    let messageText = "Hi Golden Crumb! I would like to place an order:\n\n";

    // Loop through the cart and calculate
    for (const id in cart) {
        const item = cart[id];
        if (item.quantity > 0) {
            totalItems += item.quantity;
            totalPrice += (item.price * item.quantity);
            messageText += `• ${item.quantity}x ${item.name} (₹${item.price * item.quantity})\n`;
        }
    }

    messageText += `\nTotal Amount: ₹${totalPrice}\n\nPlease confirm my order and let me know the payment details!`;

    // Slide the sticky bar up or down based on items
    if (totalItems > 0) {
        cartSummary.textContent = `${totalItems} item${totalItems > 1 ? 's' : ''} selected`;
        cartTotal.textContent = `₹${totalPrice}`;
        
        // Attach the WhatsApp logic to the button click
        checkoutBtn.onclick = () => {
            // Open WhatsApp
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`, '_blank');
            
            // Clear the cart after successfully checking out
            localStorage.removeItem('goldenCrumbCart');
            cart = {};
            document.querySelectorAll('.qty-count').forEach(display => display.textContent = '0');
            calculateTotal();
        };
        
        cartBar.classList.add('active');
    } else {
        cartBar.classList.remove('active');
    }
}

// Kickstart the rendering when the script loads
renderProducts();