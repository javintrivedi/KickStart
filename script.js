function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ name, price });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${name} added to cart!`);
}

// Display cart items on cart.html
if (window.location.pathname.endsWith('cart.html')) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalP = document.getElementById('cart-total');
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
        cartTotalP.textContent = '';
    } else {
        let total = 0;
        cartItemsDiv.innerHTML = cart.map((item, idx) => {
            total += item.price;
            return `<div>
                ${item.name} - ₹${item.price}
                <button onclick="removeFromCart(${idx})" style="margin-left:1rem;background:#eee;color:#f72585;border:none;border-radius:1rem;padding:0.2rem 0.8rem;cursor:pointer;">Remove</button>
            </div>`;
        }).join('');
        cartTotalP.textContent = `Total: ₹${total}`;
    }
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    location.reload();
}

// Animated bubbles background with cursor interaction
const canvas = document.getElementById('bubble-bg');
const ctx = canvas.getContext('2d');
let bubbles = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function randomColor() {
    const colors = ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function createBubble() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 12 + Math.random() * 18,
        dx: (Math.random() - 0.5) * 0.7,
        dy: (Math.random() - 0.5) * 0.7,
        color: randomColor(),
        alpha: 0.35 + Math.random() * 0.25 // More visible!
    };
}

for (let i = 0; i < 30; i++) bubbles.push(createBubble());

canvas.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

function animateBubbles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let b of bubbles) {
        // Bubble movement
        b.x += b.dx;
        b.y += b.dy;

        // Bounce off edges
        if (b.x < b.r || b.x > canvas.width - b.r) b.dx *= -1;
        if (b.y < b.r || b.y > canvas.height - b.r) b.dy *= -1;

        // Cursor repulsion
        if (mouse.x && mouse.y) {
            let dist = Math.hypot(b.x - mouse.x, b.y - mouse.y);
            if (dist < 80) {
                let angle = Math.atan2(b.y - mouse.y, b.x - mouse.x);
                b.x += Math.cos(angle) * 2;
                b.y += Math.sin(angle) * 2;
            }
        }

        ctx.save();
        ctx.globalAlpha = b.alpha;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.restore();
    }
    requestAnimationFrame(animateBubbles);
}
animateBubbles();