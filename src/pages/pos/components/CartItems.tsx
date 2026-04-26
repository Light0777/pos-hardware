// src/pages/pos/components/CartItems.tsx
import { IonIcon } from '@ionic/react';
import { addOutline, removeOutline, trashOutline } from 'ionicons/icons';

interface CartItem {
  id: number;
  product_uuid: string;
  quantity: number;
  price: number;
  discount: number;
  tax_percent: number;
  product: {
    name: string;
    barcode: string;
  };
}

interface CartItemsProps {
  items: CartItem[];
  onIncrease: (item: CartItem) => void;  // ✅ Changed to accept item object
  onDecrease: (item: CartItem) => void;  // ✅ Changed to accept item object
  onRemove?: (item: CartItem) => void;
}

export default function CartItems({ items, onIncrease, onDecrease, onRemove }: CartItemsProps) {
  if (!items || items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-sm">No items in cart</p>
          <p className="text-xs mt-1">Click on products to add</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3">
      {items.map((item) => (
        <div
          key={item.product_uuid}
          className="bg-[#212121] rounded-xl p-3 transition-all hover:bg-[#2a2a2a]"
        >
          {/* Product Name */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="text-white font-medium text-sm truncate">
                {item.product?.name || 'Unknown Product'}
              </h3>
              {item.product?.barcode && (
                <p className="text-gray-500 text-xs">#{item.product.barcode}</p>
              )}
            </div>
            {onRemove && (
              <button
                onClick={() => onRemove(item)}
                className="text-red-500 hover:text-red-400 transition-colors p-1"
              >
                <IonIcon icon={trashOutline} className="text-lg" />
              </button>
            )}
          </div>

          {/* Price and Quantity Controls */}
          <div className="flex justify-between items-center">
            <div className="text-white font-semibold">
              ₹{item.price.toFixed(2)}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2 bg-[#333333] rounded-lg">
                <button
                  onClick={() => onDecrease(item)}  // ✅ Pass the whole item
                  className="w-7 h-7 flex items-center justify-center text-white hover:bg-[#444444] rounded-l-lg transition-colors"
                >
                  <IonIcon icon={removeOutline} className="text-sm" />
                </button>
                
                <span className="text-white text-sm font-medium min-w-[24px] text-center">
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => onIncrease(item)}  // ✅ Pass the whole item
                  className="w-7 h-7 flex items-center justify-center text-white hover:bg-[#444444] rounded-r-lg transition-colors"
                >
                  <IonIcon icon={addOutline} className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Subtotal */}
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
            <span className="text-gray-400 text-xs">Subtotal:</span>
            <span className="text-green-500 text-sm font-semibold">
              ₹{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>

          {/* Tax Info */}
          {item.tax_percent > 0 && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-500 text-xs">GST ({item.tax_percent}%):</span>
              <span className="text-gray-400 text-xs">
                ₹{((item.price * item.tax_percent / 100) * item.quantity).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}