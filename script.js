// ---------- Product data ----------
const products = [
  { id: 1,  name: 'Chicken Curry Cut',   cat: 'chicken', price: 220, unit: 'kg',   emoji: '🍗', desc: 'Skinless, bone-in pieces for curries.' },
  { id: 2,  name: 'Chicken Breast',      cat: 'chicken', price: 300, unit: 'kg',   emoji: '🐔', desc: 'Boneless and lean, great for grilling.' },
  { id: 3,  name: 'Chicken Wings',       cat: 'chicken', price: 260, unit: 'kg',   emoji: '🍗', desc: 'Cleaned wings, ready to fry or bake.' },
  { id: 4,  name: 'Mutton Curry Cut',    cat: 'mutton',  price: 750, unit: 'kg',   emoji: '🥩', desc: 'Tender goat meat with bone.' },
  { id: 5,  name: 'Mutton Boneless',     cat: 'mutton',  price: 950, unit: 'kg',   emoji: '🥩', desc: 'Boneless cubes for kebabs and biryani.' },
  { id: 6,  name: 'Mutton Keema',        cat: 'mutton',  price: 800, unit: 'kg',   emoji: '🥩', desc: 'Freshly minced on order.' },
  { id: 7,  name: 'Tiger Prawns',        cat: 'prawns',  price: 650, unit: 'kg',   emoji: '🦐', desc: 'Large prawns, cleaned and deveined.' },
  { id: 8,  name: 'Medium Prawns',       cat: 'prawns',  price: 450, unit: 'kg',   emoji: '🦐', desc: 'Peeled prawns for fry and gravy.' },
  { id: 9,  name: 'Rohu Fish',           cat: 'fish',    price: 280, unit: 'kg',   emoji: '🐟', desc: 'Freshwater fish, cut into steaks.' },
  { id: 10, name: 'Seer Fish (Surmai)',  cat: 'fish',    price: 900, unit: 'kg',   emoji: '🐟', desc: 'Firm slices, perfect for fry.' },
  { id: 11, name: 'Pomfret',             cat: 'fish',    price: 800, unit: 'kg',   emoji: '🐠', desc: 'Whole, cleaned and scaled.' },
  { id: 12, name: 'Crab',                cat: 'fish',    price: 550, unit: 'kg',   emoji: '🦀', desc: 'Live-caught, cleaned on request.' }
];

const MAX_KM = 20;
let cart = [];

// ---------- Elements ----------
const grid = document.getElementById('productGrid');
const filters = document.getElementById('filters');
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('overlay');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const toast = document.getElementById('toast');

// ---------- Render products ----------
function renderProducts(cat = 'all') {
  const list = cat === 'all' ? products : products.filter(p => p.cat === cat);
  grid.innerHTML = list.map(p => `
    <article class="card">
      <div class="pic" aria-hidden="true">${p.emoji}</div>
      <h3>${p.name}</h3>
      <p class="desc">${p.desc}</p>
      <div class="buy">
        <span class="price">₹${p.price} <small>/ ${p.unit}</small></span>
        <button class="add" data-id="${p.id}">Add</button>
      </div>
    </article>`).join('');
}

filters.addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  filters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  renderProducts(chip.dataset.cat);
});

grid.addEventListener('click', e => {
  const btn = e.target.closest('.add');
  if (btn) addToCart(Number(btn.dataset.id));
});

// ---------- Cart ----------
function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty += 1; else cart.push({ id, qty: 1 });
  updateCart();
  showToast(products.find(p => p.id === id).name + ' added to cart');
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCart();
}

function updateCart() {
  let total = 0, count = 0;
  cartItems.innerHTML = cart.length ? cart.map(i => {
    const p = products.find(x => x.id === i.id);
    total += p.price * i.qty;
    count += i.qty;
    return `<li>
      <div><strong>${p.name}</strong><br><small>₹${p.price} × ${i.qty} kg</small></div>
      <div class="qty">
        <button data-id="${p.id}" data-d="-1" aria-label="Remove one">−</button>
        <span>${i.qty}</span>
        <button data-id="${p.id}" data-d="1" aria-label="Add one">+</button>
      </div></li>`;
  }).join('') : '<li class="empty">Your cart is empty. Add something fresh.</li>';
  cartCount.textContent = count;
  cartTotal.textContent = '₹' + total;
}

cartItems.addEventListener('click', e => {
  const b = e.target.closest('button[data-id]');
  if (b) changeQty(Number(b.dataset.id), Number(b.dataset.d));
});

function toggleDrawer(open) {
  drawer.classList.toggle('open', open);
  overlay.classList.toggle('show', open);
}
document.getElementById('openCart').addEventListener('click', () => toggleDrawer(true));
document.getElementById('closeCart').addEventListener('click', () => toggleDrawer(false));
overlay.addEventListener('click', () => toggleDrawer(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleDrawer(false); });

document.getElementById('checkout').addEventListener('click', () => {
  if (!cart.length) return showToast('Add items to your cart first');
  cart = [];
  updateCart();
  toggleDrawer(false);
  showToast('Order placed! Arriving in about 30 minutes.');
});

// ---------- Delivery checker ----------
document.getElementById('distanceForm').addEventListener('submit', e => {
  e.preventDefault();
  const km = parseFloat(document.getElementById('km').value);
  const out = document.getElementById('distanceResult');
  if (isNaN(km) || km < 0) return;
  if (km <= MAX_KM) {
    out.textContent = `Yes! We deliver to ${km} km away in about 30 minutes.`;
    out.className = 'ok';
  } else {
    out.textContent = `Sorry, ${km} km is outside our 20 km delivery range.`;
    out.className = 'no';
  }
});

// ---------- Helpers ----------
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

document.getElementById('year').textContent = new Date().getFullYear();
renderProducts();
updateCart();
