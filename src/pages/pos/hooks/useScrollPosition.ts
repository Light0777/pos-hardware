import { useScrollRestoration } from "../hooks/useScrollRestoration";

// In your component:
const productScrollRef = useScrollRestoration('pos_products');
const cartScrollRef = useScrollRestoration('pos_cart');
const paymentScrollRef = useScrollRestoration('pos_payment');

// Then use these refs on your scrollable divs
<div ref={productScrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
  <ProductGrid ... />
</div>