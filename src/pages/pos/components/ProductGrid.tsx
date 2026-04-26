import type { Product } from "../../../renderer/types/product";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onAddItem: (product: Product) => void;
}

// Predefined color classes
const colorClasses = [
  'bg-blue-100 hover:bg-blue-200 text-blue-800',
  'bg-purple-100 hover:bg-purple-200 text-purple-800',
  'bg-pink-100 hover:bg-pink-200 text-pink-800',
  'bg-green-100 hover:bg-green-200 text-green-800',
  'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
  'bg-indigo-100 hover:bg-indigo-200 text-indigo-800',
  'bg-teal-100 hover:bg-teal-200 text-teal-800',
  'bg-orange-100 hover:bg-orange-200 text-orange-800',
  'bg-cyan-100 hover:bg-cyan-200 text-cyan-800',
  'bg-amber-100 hover:bg-amber-200 text-amber-800',
  'bg-lime-100 hover:bg-lime-200 text-lime-800',
  'bg-emerald-100 hover:bg-emerald-200 text-emerald-800',
  'bg-rose-100 hover:bg-rose-200 text-rose-800',
  'bg-sky-100 hover:bg-sky-200 text-sky-800',
  'bg-violet-100 hover:bg-violet-200 text-violet-800',
];

// Get color based on stock status (priority)
const getStockColorClass = (product: Product): string | null => {
  if (product.stock === 0) {
    return 'bg-red-100 hover:bg-red-200 text-red-800';
  }
  if (product.stock && product.stock < 10) {
    return 'bg-orange-100 hover:bg-orange-200 text-orange-800';
  }
  return null;
};

export default function ProductGrid({ products, loading, onAddItem }: ProductGridProps) {
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-4 gap-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className=" rounded h-24 animate-pulse bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-y-auto p-3 grid grid-cols-3 gap-2 scrollbar-hide">
      {(products || []).map((p, index) => {
        // First check stock-based color
        const stockColor = getStockColorClass(p);

        // If no stock issue, use consistent color based on product UUID or index
        let colorIndex: number;
        if (p.product_uuid) {
          // Generate a number from UUID string
          const hash = p.product_uuid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          colorIndex = Math.abs(hash) % colorClasses.length;
        } else {
          colorIndex = index % colorClasses.length;
        }

        const colorClass = stockColor || colorClasses[colorIndex];

        return (
          // In ProductGrid.tsx
<div
  key={p.product_uuid}
  className={`border-2 ${colorClass} p-2 rounded-xl cursor-pointer h-40 flex flex-col justify-end items-start transition-all duration-200 font-inter`}
  onClick={() => {
    console.log('Product clicked:', p);
    onAddItem(p);
  }}
>
            <div className="font-medium text-sm truncate w-full text-start">
              {p.name}
            </div>
            <div className="text-sm font-semibold">₹{p.price}</div>
            {p.stock !== undefined && p.stock < 10 && p.stock > 0 && (
              <div className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full mt-1">
                Only {p.stock} left
              </div>
            )}
            {p.stock === 0 && (
              <div className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded-full mt-1">
                Out of Stock
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}