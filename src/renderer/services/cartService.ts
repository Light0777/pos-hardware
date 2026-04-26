export function calculateCart(items: any[]) {
  let total = 0;
  let tax = 0;

  items.forEach((item) => {
    const base = item.price * item.quantity;
    const taxAmount = (base * item.gst_percent) / 100;

    total += base;
    tax += taxAmount;
  });

  return {
    total,
    tax,
    grand_total: total + tax,
  };
}