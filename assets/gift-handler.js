// gift-handler.js
const GIFT_PRODUCT_HANDLE = '50498751070424'; // Replace with your actual gift handle

async function getCart() {
  const res = await fetch('/cart.js');
  return res.json();
}

async function addGiftToCart() {
  const giftProduct = await fetch(`/products/${GIFT_PRODUCT_HANDLE}.js`).then(res => res.json());
  const giftVariantId = giftProduct.variants[0]?.id;

  if (!giftVariantId) return;

  await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: giftVariantId, quantity: 1 }),
  });
}

async function removeGiftFromCart() {
  const cart = await getCart();
  const giftItem = cart.items.find(item => item.handle === GIFT_PRODUCT_HANDLE);
  if (!giftItem) return;

  await fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: giftItem.key, quantity: 0 }),
  });
}

async function handleGiftLogic() {
  const cart = await getCart();

  const hasMainProduct = cart.items.some(item =>
    item.handle !== GIFT_PRODUCT_HANDLE
  );

  const hasGift = cart.items.some(item =>
    item.handle === GIFT_PRODUCT_HANDLE
  );

  if (hasMainProduct && !hasGift) {
    await addGiftToCart();
    document.dispatchEvent(new CustomEvent('CartAddEvent')); // Trigger drawer update
  } else if (!hasMainProduct && hasGift) {
    await removeGiftFromCart();
    document.dispatchEvent(new CustomEvent('CartAddEvent'));
  }
}

export { handleGiftLogic };
