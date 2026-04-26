// app.js - Fixed version (no duplicates, single router)


// ----- PURCHASES PAGE COMPONENT (with CRUD) -----

// Purchases mock data
const PURCHASES_DATA = [
  {
    purchase_uuid: "78514e54-b4f1-4098-ac0e-ea7bac92a306",
    tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
    total: "600.00",
    supplier_uuid: "3a5f2359-bf7a-4174-931d-507ab782d9a9",
    created_at: "2026-04-15T06:09:33.000000Z",
    updated_at: "2026-04-15T06:09:33.000000Z",
    items: [
      {
        id: 4,
        purchase_uuid: "78514e54-b4f1-4098-ac0e-ea7bac92a306",
        product_uuid: "b7af5965-c9b2-44a6-a023-7b34da067118",
        quantity: 30,
        cost_price: "20.00",
        product: {
          name: "Salt 1kg",
          sku: "SALT001",
          price: "20.00",
          stock: 210
        }
      }
    ],
    supplier: {
      supplier_uuid: "3a5f2359-bf7a-4174-931d-507ab782d9a9",
      name: "Sri Lakshmi Suppliers",
      phone: "9123456780",
      email: "lakshmi.suppliers@yahoo.com"
    }
  },
  {
    purchase_uuid: "3cf4801b-13cd-4f97-95d2-304f7d8576b6",
    tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
    total: "5000.00",
    supplier_uuid: "8c2ebf6d-03ba-4d32-a128-dd62bd9d30da",
    created_at: "2026-04-15T05:54:37.000000Z",
    updated_at: "2026-04-15T05:54:37.000000Z",
    items: [
      {
        id: 3,
        purchase_uuid: "3cf4801b-13cd-4f97-95d2-304f7d8576b6",
        product_uuid: "9e27b110-1c2e-4d66-8d33-5a49fbe67f21",
        quantity: 100,
        cost_price: "50.00",
        product: {
          name: "Rice 1kg",
          sku: "RICE001",
          price: "50.00",
          stock: 190
        }
      }
    ],
    supplier: {
      supplier_uuid: "8c2ebf6d-03ba-4d32-a128-dd62bd9d30da",
      name: "ABC Traders",
      phone: "9876543210",
      email: "abctraders@gmail.com"
    }
  }
];

// Purchases state
let purchasesState = {
  purchases: [...PURCHASES_DATA],
  filteredPurchases: [...PURCHASES_DATA],
  searchTerm: '',
  dateFilter: 'all',
  editingPurchase: null,
  isFormOpen: false,
  selectedPurchase: null,
  isDetailOpen: false,
  formItems: []
};

// Purchase Form Modal
function renderPurchaseFormModal(purchase = null) {
  const isEditing = purchase !== null;
  const modalTitle = isEditing ? 'Edit Purchase Order' : 'New Purchase Order';

  // Get suppliers list for dropdown
  const suppliers = SUPPLIERS_DATA || [];

  // Get products list for items
  const products = PRODUCTS_DATA?.data || [];

  return `
    <div id="purchaseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) closePurchaseModal()">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">${modalTitle}</h2>
          <button onclick="closePurchaseModal()" class="p-1 hover:bg-gray-100 rounded-lg transition">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <form id="purchaseForm" onsubmit="handlePurchaseSubmit(event, ${isEditing})" class="p-6 space-y-5">
          ${isEditing ? `<input type="hidden" id="purchaseUuid" value="${purchase.purchase_uuid}">` : ''}
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <select id="purchaseSupplier" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select Supplier</option>
                ${suppliers.map(s => `<option value="${s.supplier_uuid}" ${isEditing && purchase.supplier_uuid === s.supplier_uuid ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
              <input type="date" id="purchaseDate" value="${isEditing ? purchase.created_at.split('T')[0] : new Date().toISOString().split('T')[0]}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Invoice Number (Optional)</label>
            <input type="text" id="purchaseInvoice" value="${isEditing && purchase.invoice_number ? purchase.invoice_number : ''}" placeholder="e.g., PO-2026-001" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <!-- Items Section -->
          <div class="border-t border-gray-200 pt-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-gray-800">Purchase Items</h3>
              <button type="button" onclick="addPurchaseItem()" class="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Add Item
              </button>
            </div>
            
            <div id="purchaseItemsContainer" class="space-y-3">
              ${isEditing ? purchase.items.map((item, idx) => renderPurchaseItemRow(item, idx)).join('') : renderPurchaseItemRow(null, 0)}
            </div>
          </div>
          
          <!-- Summary -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Total Amount:</span>
              <span class="text-2xl font-bold text-gray-800" id="purchaseTotal">₹0.00</span>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select id="purchasePaymentStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="pending" ${isEditing && purchase.payment_status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="partial" ${isEditing && purchase.payment_status === 'partial' ? 'selected' : ''}>Partially Paid</option>
              <option value="paid" ${isEditing && purchase.payment_status === 'paid' ? 'selected' : ''}>Paid</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea id="purchaseNotes" rows="2" placeholder="Additional notes..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">${isEditing && purchase.notes ? purchase.notes : ''}</textarea>
          </div>
          
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onclick="closePurchaseModal()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition">
              ${isEditing ? 'Update Purchase' : 'Create Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderPurchaseItemRow(item = null, index) {
  const products = PRODUCTS_DATA?.data || [];

  return `
    <div class="purchase-item-row flex items-center gap-3 p-3 bg-gray-50 rounded-lg" data-index="${index}">
      <div class="flex-1">
        <select onchange="updatePurchaseItemTotal()" class="item-product w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
          <option value="">Select Product</option>
          ${products.map(p => `<option value="${p.product_uuid}" data-price="${p.price}" ${item && item.product_uuid === p.product_uuid ? 'selected' : ''}>${p.name} (₹${p.price})</option>`).join('')}
        </select>
      </div>
      <div class="w-24">
        <input type="number" min="1" value="${item ? item.quantity : 1}" onchange="updatePurchaseItemTotal()" class="item-quantity w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center">
      </div>
      <div class="w-28">
        <input type="number" step="0.01" value="${item ? item.cost_price : ''}" onchange="updatePurchaseItemTotal()" class="item-price w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-right" placeholder="Price">
      </div>
      <div class="w-24 text-right font-medium">
        <span class="item-total">₹${item ? (item.quantity * parseFloat(item.cost_price)).toFixed(2) : '0.00'}</span>
      </div>
      <button type="button" onclick="removePurchaseItem(this)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    </div>
  `;
}

// Purchase Detail Modal
function renderPurchaseDetailModal(purchase) {
  const itemsTotal = purchase.items.reduce((sum, item) => sum + (item.quantity * parseFloat(item.cost_price)), 0);

  return `
    <div id="purchaseDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) closePurchaseDetailModal()">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Purchase Order Details</h2>
            <p class="text-sm text-gray-500 mt-0.5">${new Date(purchase.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="flex gap-2">
            <button onclick="window.print()" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              Print
            </button>
            <button onclick="closePurchaseDetailModal()" class="p-1 hover:bg-gray-100 rounded-lg transition">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Supplier & Order Info -->
          <div class="grid grid-cols-2 gap-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-700 mb-2">Supplier Information</h3>
              <p class="font-medium text-lg">${purchase.supplier.name}</p>
              <p class="text-sm text-gray-600">${purchase.supplier.phone}</p>
              <p class="text-sm text-gray-600">${purchase.supplier.email}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-700 mb-2">Order Information</h3>
              <p class="text-sm"><span class="text-gray-500">Invoice:</span> ${purchase.invoice_number || '—'}</p>
              <p class="text-sm"><span class="text-gray-500">Status:</span> 
                <span class="inline-flex ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${purchase.payment_status === 'paid' ? 'bg-green-100 text-green-700' : purchase.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}">
                  ${purchase.payment_status ? purchase.payment_status.replace('_', ' ') : 'Pending'}
                </span>
              </p>
            </div>
          </div>
          
          <!-- Items Table -->
          <div>
            <h3 class="font-semibold text-gray-800 mb-3">Purchased Items</h3>
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th class="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th class="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th class="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  ${purchase.items.map(item => `
                    <tr>
                      <td class="py-3 px-4">
                        <div class="font-medium">${item.product.name}</div>
                        <div class="text-xs text-gray-500">SKU: ${item.product.sku}</div>
                      </td>
                      <td class="py-3 px-4 text-center">${item.quantity}</td>
                      <td class="py-3 px-4 text-right">₹${item.cost_price}</td>
                      <td class="py-3 px-4 text-right font-medium">₹${(item.quantity * parseFloat(item.cost_price)).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
                <tfoot class="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colspan="3" class="py-3 px-4 text-right font-medium">Total:</td>
                    <td class="py-3 px-4 text-right font-bold text-lg">₹${purchase.total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onclick="openEditPurchase('${purchase.purchase_uuid}'); closePurchaseDetailModal()" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Edit Purchase
            </button>
            <button onclick="markAsReceived('${purchase.purchase_uuid}')" class="px-4 py-2 text-sm border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition">
              Mark as Received
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Purchases page render function
function renderPurchasesPage() {
  const { filteredPurchases } = purchasesState;

  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + parseFloat(p.total), 0);
  const totalItems = filteredPurchases.reduce((sum, p) => sum + p.items.length, 0);

  const tableRows = filteredPurchases.map(purchase => {
    const purchaseDate = new Date(purchase.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    return `
      <tr class="hover:bg-gray-50 cursor-pointer" onclick="viewPurchaseDetail('${purchase.purchase_uuid}')">
        <td class="px-4 py-3">
          <div class="font-medium text-gray-900">${purchase.supplier.name}</div>
          <div class="text-xs text-gray-500">${purchaseDate}</div>
        </td>
        <td class="px-4 py-3 text-sm text-gray-600">${purchase.invoice_number || '—'}</td>
        <td class="px-4 py-3 text-center">${purchase.items.length} items</td>
        <td class="px-4 py-3 text-right font-semibold">₹${purchase.total}</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${purchase.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
            ${purchase.payment_status ? purchase.payment_status.replace('_', ' ') : 'Pending'}
          </span>
        </td>
        <td class="px-4 py-3 text-right" onclick="event.stopPropagation()">
          <button onclick="openEditPurchase('${purchase.purchase_uuid}')" class="text-indigo-600 hover:text-indigo-800 mr-3 text-sm font-medium">Edit</button>
          <button onclick="deletePurchase('${purchase.purchase_uuid}')" class="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <main class="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Purchases</h1>
            <p class="text-sm text-gray-500 mt-1">Manage purchase orders and supplier payments</p>
          </div>
          <button onclick="openAddPurchase()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            New Purchase
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Total Purchases</div>
            <div class="text-2xl font-bold mt-1">₹${totalPurchases.toFixed(2)}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Orders</div>
            <div class="text-2xl font-bold mt-1">${filteredPurchases.length}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Items Purchased</div>
            <div class="text-2xl font-bold mt-1">${totalItems}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Pending Payment</div>
            <div class="text-2xl font-bold mt-1 text-yellow-600">₹${filteredPurchases.filter(p => p.payment_status !== 'paid').reduce((sum, p) => sum + parseFloat(p.total), 0).toFixed(2)}</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="flex gap-3">
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="purchaseSearch" placeholder="Search by supplier or invoice..." value="${purchasesState.searchTerm}" 
                onkeyup="handlePurchaseSearch(event)" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <select id="purchaseDateFilter" onchange="handlePurchaseDateFilter(event)" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="all" ${purchasesState.dateFilter === 'all' ? 'selected' : ''}>All Dates</option>
              <option value="today" ${purchasesState.dateFilter === 'today' ? 'selected' : ''}>Today</option>
              <option value="week" ${purchasesState.dateFilter === 'week' ? 'selected' : ''}>This Week</option>
              <option value="month" ${purchasesState.dateFilter === 'month' ? 'selected' : ''}>This Month</option>
            </select>
            <button onclick="clearPurchaseFilters()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Clear</button>
          </div>
        </div>

        <!-- Purchases Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${tableRows || `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No purchases found</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">Showing ${filteredPurchases.length} purchases</div>
          <div class="flex gap-2">
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg">1</button>
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
      
      ${purchasesState.isFormOpen ? renderPurchaseFormModal(purchasesState.editingPurchase) : ''}
      ${purchasesState.isDetailOpen && purchasesState.selectedPurchase ? renderPurchaseDetailModal(purchasesState.selectedPurchase) : ''}
    </main>
  `;
}

// Purchase CRUD functions
function openAddPurchase() {
  purchasesState.editingPurchase = null;
  purchasesState.isFormOpen = true;
  refreshPurchasesUI();
}

function openEditPurchase(uuid) {
  const purchase = purchasesState.purchases.find(p => p.purchase_uuid === uuid);
  if (purchase) {
    purchasesState.editingPurchase = purchase;
    purchasesState.isFormOpen = true;
    refreshPurchasesUI();
  }
}

function closePurchaseModal() {
  purchasesState.isFormOpen = false;
  purchasesState.editingPurchase = null;
  refreshPurchasesUI();
}

function handlePurchaseSubmit(event, isEditing) {
  event.preventDefault();

  const supplierUuid = document.getElementById('purchaseSupplier').value;
  const supplier = SUPPLIERS_DATA.find(s => s.supplier_uuid === supplierUuid);

  // Collect items
  const items = [];
  let total = 0;
  document.querySelectorAll('.purchase-item-row').forEach(row => {
    const productSelect = row.querySelector('.item-product');
    const quantity = parseInt(row.querySelector('.item-quantity').value) || 0;
    const costPrice = row.querySelector('.item-price').value;

    if (productSelect.value && quantity > 0 && costPrice) {
      const productUuid = productSelect.value;
      const product = PRODUCTS_DATA.data.find(p => p.product_uuid === productUuid);

      items.push({
        id: Date.now() + items.length,
        product_uuid: productUuid,
        quantity: quantity,
        cost_price: costPrice,
        product: {
          name: product?.name || 'Product',
          sku: product?.sku || ''
        }
      });

      total += quantity * parseFloat(costPrice);
    }
  });

  const formData = {
    supplier_uuid: supplierUuid,
    supplier: supplier,
    invoice_number: document.getElementById('purchaseInvoice').value,
    created_at: document.getElementById('purchaseDate').value + 'T00:00:00.000Z',
    payment_status: document.getElementById('purchasePaymentStatus').value,
    notes: document.getElementById('purchaseNotes').value,
    items: items,
    total: total.toFixed(2)
  };

  if (isEditing) {
    const uuid = document.getElementById('purchaseUuid').value;
    const index = purchasesState.purchases.findIndex(p => p.purchase_uuid === uuid);
    if (index !== -1) {
      purchasesState.purchases[index] = {
        ...purchasesState.purchases[index],
        ...formData,
        updated_at: new Date().toISOString()
      };
    }
  } else {
    const newPurchase = {
      purchase_uuid: crypto.randomUUID ? crypto.randomUUID() : 'pur-' + Date.now(),
      tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
      ...formData,
      updated_at: new Date().toISOString()
    };
    purchasesState.purchases.push(newPurchase);
  }

  applyPurchaseSearch();
  closePurchaseModal();
}

function deletePurchase(uuid) {
  if (confirm('Are you sure you want to delete this purchase order?')) {
    purchasesState.purchases = purchasesState.purchases.filter(p => p.purchase_uuid !== uuid);
    applyPurchaseSearch();
    refreshPurchasesUI();
  }
}

function viewPurchaseDetail(uuid) {
  const purchase = purchasesState.purchases.find(p => p.purchase_uuid === uuid);
  if (purchase) {
    purchasesState.selectedPurchase = purchase;
    purchasesState.isDetailOpen = true;
    refreshPurchasesUI();
  }
}

function closePurchaseDetailModal() {
  purchasesState.isDetailOpen = false;
  purchasesState.selectedPurchase = null;
  refreshPurchasesUI();
}

function addPurchaseItem() {
  const container = document.getElementById('purchaseItemsContainer');
  const index = container.children.length;
  const newRow = renderPurchaseItemRow(null, index);
  container.insertAdjacentHTML('beforeend', newRow);
}

function removePurchaseItem(button) {
  button.closest('.purchase-item-row').remove();
  updatePurchaseItemTotal();
}

function updatePurchaseItemTotal() {
  let total = 0;
  document.querySelectorAll('.purchase-item-row').forEach(row => {
    const quantity = parseInt(row.querySelector('.item-quantity')?.value) || 0;
    const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
    const itemTotal = quantity * price;
    const totalSpan = row.querySelector('.item-total');
    if (totalSpan) {
      totalSpan.textContent = `₹${itemTotal.toFixed(2)}`;
    }
    total += itemTotal;
  });

  const totalElement = document.getElementById('purchaseTotal');
  if (totalElement) {
    totalElement.textContent = `₹${total.toFixed(2)}`;
  }
}

function markAsReceived(uuid) {
  alert(`Purchase order ${uuid} marked as received. Stock updated.`);
}

function handlePurchaseSearch(event) {
  purchasesState.searchTerm = event.target.value;
  applyPurchaseSearch();
  refreshPurchasesUI();
}

function handlePurchaseDateFilter(event) {
  purchasesState.dateFilter = event.target.value;
  applyPurchaseSearch();
  refreshPurchasesUI();
}

function clearPurchaseFilters() {
  purchasesState.searchTerm = '';
  purchasesState.dateFilter = 'all';
  document.getElementById('purchaseSearch').value = '';
  document.getElementById('purchaseDateFilter').value = 'all';
  applyPurchaseSearch();
  refreshPurchasesUI();
}

function applyPurchaseSearch() {
  let filtered = [...purchasesState.purchases];

  // Search filter
  if (purchasesState.searchTerm) {
    const term = purchasesState.searchTerm.toLowerCase();
    filtered = filtered.filter(p =>
      p.supplier.name.toLowerCase().includes(term) ||
      (p.invoice_number && p.invoice_number.toLowerCase().includes(term))
    );
  }

  // Date filter
  if (purchasesState.dateFilter !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    filtered = filtered.filter(p => {
      const purchaseDate = new Date(p.created_at);
      if (purchasesState.dateFilter === 'today') {
        return purchaseDate >= today;
      } else if (purchasesState.dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return purchaseDate >= weekAgo;
      } else if (purchasesState.dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return purchaseDate >= monthAgo;
      }
      return true;
    });
  }

  purchasesState.filteredPurchases = filtered;
}

function refreshPurchasesUI() {
  const app = document.getElementById('app');
  const mainContent = app.querySelector('.flex-1.flex.flex-col.overflow-hidden');
  if (mainContent) {
    const topBarHtml = mainContent.querySelector('header').outerHTML;
    mainContent.innerHTML = topBarHtml + renderPurchasesPage();
  }
}

// Export for router
window.openAddPurchase = openAddPurchase;
window.openEditPurchase = openEditPurchase;
window.closePurchaseModal = closePurchaseModal;
window.handlePurchaseSubmit = handlePurchaseSubmit;
window.deletePurchase = deletePurchase;
window.viewPurchaseDetail = viewPurchaseDetail;
window.closePurchaseDetailModal = closePurchaseDetailModal;
window.addPurchaseItem = addPurchaseItem;
window.removePurchaseItem = removePurchaseItem;
window.updatePurchaseItemTotal = updatePurchaseItemTotal;
window.markAsReceived = markAsReceived;
window.handlePurchaseSearch = handlePurchaseSearch;
window.handlePurchaseDateFilter = handlePurchaseDateFilter;
window.clearPurchaseFilters = clearPurchaseFilters;

// ----- SUPPLIERS PAGE COMPONENT (with CRUD) -----

// Suppliers mock data
const SUPPLIERS_DATA = [
  {
    supplier_uuid: "c27ae62d-89e3-4765-b238-373ee52d7dd9",
    tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
    name: "Green Leaf Distributors",
    phone: "9988776655",
    email: "greenleaf@gmail.com",
    address: "Coimbatore, Tamil Nadu",
    created_at: "2026-04-15T05:37:35.000000Z",
    updated_at: "2026-04-15T05:37:35.000000Z"
  },
  {
    supplier_uuid: "3a5f2359-bf7a-4174-931d-507ab782d9a9",
    tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
    name: "Sri Lakshmi Suppliers",
    phone: "9123456780",
    email: "lakshmi.suppliers@yahoo.com",
    address: "Madurai, Tamil Nadu",
    created_at: "2026-04-15T05:37:06.000000Z",
    updated_at: "2026-04-15T05:37:06.000000Z"
  },
  {
    supplier_uuid: "8c2ebf6d-03ba-4d32-a128-dd62bd9d30da",
    tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
    name: "ABC Traders",
    phone: "9876543210",
    email: "abctraders@gmail.com",
    address: "Chennai, Tamil Nadu",
    created_at: "2026-04-15T05:36:45.000000Z",
    updated_at: "2026-04-15T05:36:45.000000Z"
  }
];

// Suppliers state
let suppliersState = {
  suppliers: [...SUPPLIERS_DATA],
  filteredSuppliers: [...SUPPLIERS_DATA],
  searchTerm: '',
  editingSupplier: null,
  isFormOpen: false,
  selectedSupplier: null,
  isDetailOpen: false
};

// Supplier Form Modal
function renderSupplierFormModal(supplier = null) {
  const isEditing = supplier !== null;
  const modalTitle = isEditing ? 'Edit Supplier' : 'Add New Supplier';

  return `
    <div id="supplierModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) closeSupplierModal()">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">${modalTitle}</h2>
          <button onclick="closeSupplierModal()" class="p-1 hover:bg-gray-100 rounded-lg transition">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <form id="supplierForm" onsubmit="handleSupplierSubmit(event, ${isEditing})" class="p-6 space-y-5">
          ${isEditing ? `<input type="hidden" id="supplierUuid" value="${supplier.supplier_uuid}">` : ''}
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
            <input type="text" id="supplierName" value="${isEditing ? supplier.name : ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input type="tel" id="supplierPhone" value="${isEditing ? supplier.phone : ''}" required pattern="[0-9]{10}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" id="supplierEmail" value="${isEditing && supplier.email ? supplier.email : ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
            <input type="text" id="supplierGst" value="${isEditing && supplier.gstin ? supplier.gstin : ''}" placeholder="e.g., 33ABCDE1234F1Z5" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea id="supplierAddress" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">${isEditing && supplier.address ? supplier.address : ''}</textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
            <select id="supplierPaymentTerms" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="immediate" ${isEditing && supplier.payment_terms === 'immediate' ? 'selected' : ''}>Immediate</option>
              <option value="15days" ${isEditing && supplier.payment_terms === '15days' ? 'selected' : ''}>Net 15 Days</option>
              <option value="30days" ${isEditing && supplier.payment_terms === '30days' ? 'selected' : ''}>Net 30 Days</option>
              <option value="45days" ${isEditing && supplier.payment_terms === '45days' ? 'selected' : ''}>Net 45 Days</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea id="supplierNotes" rows="2" placeholder="Additional notes about this supplier..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">${isEditing && supplier.notes ? supplier.notes : ''}</textarea>
          </div>
          
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onclick="closeSupplierModal()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition">
              ${isEditing ? 'Update Supplier' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// Supplier Detail Modal
function renderSupplierDetailModal(supplier) {
  // Get purchase history for this supplier
  const supplierPurchases = MOCK.recent_purchases.filter(p =>
    p.supplier.name === supplier.name
  );

  const totalPurchases = supplierPurchases.reduce((sum, p) => sum + parseFloat(p.total), 0);

  return `
    <div id="supplierDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) closeSupplierDetailModal()">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-800">${supplier.name}</h2>
            <p class="text-sm text-gray-500 mt-0.5">Supplier Details & Purchase History</p>
          </div>
          <button onclick="closeSupplierDetailModal()" class="p-1 hover:bg-gray-100 rounded-lg transition">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Supplier Info -->
          <div class="bg-gray-50 rounded-lg p-5">
            <h3 class="font-semibold text-gray-800 mb-3">Contact Information</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-500 uppercase">Phone</span>
                <p class="font-medium">${supplier.phone}</p>
              </div>
              <div>
                <span class="text-xs text-gray-500 uppercase">Email</span>
                <p class="font-medium">${supplier.email || '—'}</p>
              </div>
              <div class="col-span-2">
                <span class="text-xs text-gray-500 uppercase">Address</span>
                <p class="font-medium">${supplier.address || '—'}</p>
              </div>
              <div>
                <span class="text-xs text-gray-500 uppercase">GSTIN</span>
                <p class="font-medium">${supplier.gstin || '—'}</p>
              </div>
              <div>
                <span class="text-xs text-gray-500 uppercase">Payment Terms</span>
                <p class="font-medium">${supplier.payment_terms ? supplier.payment_terms.replace(/(\d+)/, 'Net $1') : 'Immediate'}</p>
              </div>
            </div>
          </div>
          
          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-indigo-50 rounded-lg p-4">
              <div class="text-indigo-600 text-sm font-medium">Total Purchases</div>
              <div class="text-2xl font-bold text-indigo-900">₹${totalPurchases.toFixed(2)}</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4">
              <div class="text-green-600 text-sm font-medium">Orders</div>
              <div class="text-2xl font-bold text-green-900">${supplierPurchases.length}</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-4">
              <div class="text-purple-600 text-sm font-medium">Last Order</div>
              <div class="text-lg font-semibold text-purple-900">
                ${supplierPurchases.length > 0 ? new Date(supplierPurchases[0].created_at).toLocaleDateString() : '—'}
              </div>
            </div>
          </div>
          
          <!-- Purchase History -->
          <div>
            <h3 class="font-semibold text-gray-800 mb-3">Recent Purchases</h3>
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th class="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  ${supplierPurchases.length > 0 ? supplierPurchases.map(p => `
                    <tr>
                      <td class="py-3 px-4">${new Date(p.created_at).toLocaleDateString()}</td>
                      <td class="py-3 px-4 text-right font-medium">₹${p.total}</td>
                      <td class="py-3 px-4 text-center">
                        <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Completed</span>
                      </td>
                    </tr>
                  `).join('') : `<tr><td colspan="3" class="py-6 text-center text-gray-500">No purchases yet</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onclick="openEditSupplier('${supplier.supplier_uuid}'); closeSupplierDetailModal()" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Edit Supplier
            </button>
            <button onclick="createPurchaseOrder('${supplier.supplier_uuid}')" class="px-4 py-2 text-sm border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
              New Purchase Order
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Suppliers page render function
function renderSuppliersPage() {
  const { filteredSuppliers } = suppliersState;

  const tableRows = filteredSuppliers.map(supplier => {
    const joinDate = new Date(supplier.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    // Get purchase count for this supplier
    const purchaseCount = MOCK.recent_purchases.filter(p =>
      p.supplier.name === supplier.name
    ).length;

    return `
      <tr class="hover:bg-gray-50 cursor-pointer" onclick="viewSupplierDetail('${supplier.supplier_uuid}')">
        <td class="px-4 py-3">
          <div class="font-medium text-gray-900">${supplier.name}</div>
          <div class="text-xs text-gray-500">${supplier.phone}</div>
        </td>
        <td class="px-4 py-3 text-sm text-gray-600">${supplier.email || '—'}</td>
        <td class="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">${supplier.address || '—'}</td>
        <td class="px-4 py-3 text-center">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            ${purchaseCount} orders
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-gray-500">${joinDate}</td>
        <td class="px-4 py-3 text-right" onclick="event.stopPropagation()">
          <button onclick="openEditSupplier('${supplier.supplier_uuid}')" class="text-indigo-600 hover:text-indigo-800 mr-3 text-sm font-medium">Edit</button>
          <button onclick="deleteSupplier('${supplier.supplier_uuid}')" class="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <main class="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Suppliers</h1>
            <p class="text-sm text-gray-500 mt-1">Manage your supplier network</p>
          </div>
          <button onclick="openAddSupplier()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Add Supplier
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Total Suppliers</div>
            <div class="text-2xl font-bold mt-1">${filteredSuppliers.length}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Active Suppliers</div>
            <div class="text-2xl font-bold mt-1 text-green-600">${filteredSuppliers.length}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Total Purchases</div>
            <div class="text-2xl font-bold mt-1">₹${MOCK.recent_purchases.reduce((sum, p) => sum + parseFloat(p.total), 0).toFixed(2)}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Pending Orders</div>
            <div class="text-2xl font-bold mt-1">0</div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="flex gap-3">
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="supplierSearch" placeholder="Search by name, phone or email..." value="${suppliersState.searchTerm}" 
                onkeyup="handleSupplierSearch(event)" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <button onclick="clearSupplierSearch()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Clear</button>
          </div>
        </div>

        <!-- Suppliers Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${tableRows || `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No suppliers found</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-800">Quick Actions</h3>
              <p class="text-sm text-gray-600 mt-0.5">Manage your supplier relationships efficiently</p>
            </div>
            <div class="flex gap-3">
              <button onclick="importSuppliers()" class="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                Import
              </button>
              <button onclick="exportSuppliers()" class="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Export
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">Showing ${filteredSuppliers.length} suppliers</div>
          <div class="flex gap-2">
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg">1</button>
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
      
      ${suppliersState.isFormOpen ? renderSupplierFormModal(suppliersState.editingSupplier) : ''}
      ${suppliersState.isDetailOpen && suppliersState.selectedSupplier ? renderSupplierDetailModal(suppliersState.selectedSupplier) : ''}
    </main>
  `;
}

// Supplier CRUD functions
function openAddSupplier() {
  suppliersState.editingSupplier = null;
  suppliersState.isFormOpen = true;
  refreshSuppliersUI();
}

function openEditSupplier(uuid) {
  const supplier = suppliersState.suppliers.find(s => s.supplier_uuid === uuid);
  if (supplier) {
    suppliersState.editingSupplier = supplier;
    suppliersState.isFormOpen = true;
    refreshSuppliersUI();
  }
}

function closeSupplierModal() {
  suppliersState.isFormOpen = false;
  suppliersState.editingSupplier = null;
  refreshSuppliersUI();
}

function handleSupplierSubmit(event, isEditing) {
  event.preventDefault();

  const formData = {
    name: document.getElementById('supplierName').value,
    phone: document.getElementById('supplierPhone').value,
    email: document.getElementById('supplierEmail').value || null,
    gstin: document.getElementById('supplierGst').value || null,
    address: document.getElementById('supplierAddress').value || null,
    payment_terms: document.getElementById('supplierPaymentTerms').value,
    notes: document.getElementById('supplierNotes').value || null
  };

  if (isEditing) {
    const uuid = document.getElementById('supplierUuid').value;
    const index = suppliersState.suppliers.findIndex(s => s.supplier_uuid === uuid);
    if (index !== -1) {
      suppliersState.suppliers[index] = {
        ...suppliersState.suppliers[index],
        ...formData,
        updated_at: new Date().toISOString()
      };
    }
  } else {
    const newSupplier = {
      supplier_uuid: crypto.randomUUID ? crypto.randomUUID() : 'sup-' + Date.now(),
      tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    suppliersState.suppliers.push(newSupplier);
  }

  applySupplierSearch();
  closeSupplierModal();
}

function deleteSupplier(uuid) {
  if (confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
    suppliersState.suppliers = suppliersState.suppliers.filter(s => s.supplier_uuid !== uuid);
    applySupplierSearch();
    refreshSuppliersUI();
  }
}

function viewSupplierDetail(uuid) {
  const supplier = suppliersState.suppliers.find(s => s.supplier_uuid === uuid);
  if (supplier) {
    suppliersState.selectedSupplier = supplier;
    suppliersState.isDetailOpen = true;
    refreshSuppliersUI();
  }
}

function closeSupplierDetailModal() {
  suppliersState.isDetailOpen = false;
  suppliersState.selectedSupplier = null;
  refreshSuppliersUI();
}

function createPurchaseOrder(uuid) {
  const supplier = suppliersState.suppliers.find(s => s.supplier_uuid === uuid);
  alert(`Create purchase order for ${supplier?.name || 'supplier'}`);
}

function handleSupplierSearch(event) {
  suppliersState.searchTerm = event.target.value;
  applySupplierSearch();
  refreshSuppliersUI();
}

function clearSupplierSearch() {
  suppliersState.searchTerm = '';
  document.getElementById('supplierSearch').value = '';
  applySupplierSearch();
  refreshSuppliersUI();
}

function applySupplierSearch() {
  const term = suppliersState.searchTerm.toLowerCase();
  if (!term) {
    suppliersState.filteredSuppliers = [...suppliersState.suppliers];
  } else {
    suppliersState.filteredSuppliers = suppliersState.suppliers.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.phone.includes(term) ||
      (s.email && s.email.toLowerCase().includes(term))
    );
  }
}

function importSuppliers() {
  alert('Import suppliers from CSV feature');
}

function exportSuppliers() {
  const csv = ['Name,Phone,Email,Address,GSTIN'];
  suppliersState.filteredSuppliers.forEach(s => {
    csv.push(`"${s.name}","${s.phone}","${s.email || ''}","${s.address || ''}","${s.gstin || ''}"`);
  });

  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `suppliers-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function refreshSuppliersUI() {
  const app = document.getElementById('app');
  const mainContent = app.querySelector('.flex-1.flex.flex-col.overflow-hidden');
  if (mainContent) {
    const topBarHtml = mainContent.querySelector('header').outerHTML;
    mainContent.innerHTML = topBarHtml + renderSuppliersPage();
  }
}

// Export for router
window.openAddSupplier = openAddSupplier;
window.openEditSupplier = openEditSupplier;
window.closeSupplierModal = closeSupplierModal;
window.handleSupplierSubmit = handleSupplierSubmit;
window.deleteSupplier = deleteSupplier;
window.viewSupplierDetail = viewSupplierDetail;
window.closeSupplierDetailModal = closeSupplierDetailModal;
window.createPurchaseOrder = createPurchaseOrder;
window.handleSupplierSearch = handleSupplierSearch;
window.clearSupplierSearch = clearSupplierSearch;
window.importSuppliers = importSuppliers;
window.exportSuppliers = exportSuppliers;

// ----- REPORTS PAGE COMPONENT (with comprehensive analytics) -----

// Reports state
let reportsState = {
  dateRange: 'month',
  customStartDate: null,
  customEndDate: null,
  activeTab: 'overview' // overview, sales, inventory, customers
};

// Reports page render function
function renderReportsPage() {
  const { dateRange, activeTab } = reportsState;

  // Calculate metrics from all data sources
  const totalSales = SALES_DATA.reduce((sum, s) => sum + parseFloat(s.grand_total), 0);
  const totalOrders = SALES_DATA.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const totalProducts = PRODUCTS_DATA.data.length;
  const totalStock = STOCK_DATA.reduce((sum, item) => sum + item.stock, 0);
  const inventoryValue = STOCK_DATA.reduce((sum, item) => sum + (item.stock * parseFloat(item.price)), 0);
  const lowStockCount = STOCK_DATA.filter(item => item.stock < 50).length;

  const totalCustomers = CUSTOMERS_DATA.length;
  const totalCredit = CUSTOMERS_DATA.reduce((sum, c) => sum + parseFloat(c.credit_balance), 0);

  const totalPurchases = MOCK.recent_purchases.reduce((sum, p) => sum + parseFloat(p.total), 0);
  const profit = MOCK.profit.profit;
  const profitMargin = totalSales > 0 ? ((totalSales - parseFloat(MOCK.profit.cost)) / totalSales * 100).toFixed(2) : 0;

  // Top selling products (from dashboard mock)
  const topProducts = MOCK.top_products.slice(0, 5);

  // Recent sales for table
  const recentSales = SALES_DATA.slice(0, 5);

  // Sales by day chart data
  const salesByDay = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [1250, 980, 1450, 2100, 1850, 2450, 1675]
  };

  return `
    <main class="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Header with Date Range -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
            <p class="text-sm text-gray-500 mt-1">Comprehensive business insights and performance metrics</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex bg-white border border-gray-200 rounded-lg p-1">
              <button onclick="setReportDateRange('today')" class="px-4 py-1.5 text-sm rounded-md transition ${dateRange === 'today' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}">Today</button>
              <button onclick="setReportDateRange('week')" class="px-4 py-1.5 text-sm rounded-md transition ${dateRange === 'week' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}">Week</button>
              <button onclick="setReportDateRange('month')" class="px-4 py-1.5 text-sm rounded-md transition ${dateRange === 'month' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}">Month</button>
              <button onclick="setReportDateRange('year')" class="px-4 py-1.5 text-sm rounded-md transition ${dateRange === 'year' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}">Year</button>
            </div>
            <button onclick="exportReport()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Export Report
            </button>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="border-b border-gray-200">
          <nav class="flex gap-6">
            <button onclick="switchReportTab('overview')" class="pb-3 px-1 text-sm font-medium border-b-2 transition ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}">Overview</button>
            <button onclick="switchReportTab('sales')" class="pb-3 px-1 text-sm font-medium border-b-2 transition ${activeTab === 'sales' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}">Sales Analytics</button>
            <button onclick="switchReportTab('inventory')" class="pb-3 px-1 text-sm font-medium border-b-2 transition ${activeTab === 'inventory' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}">Inventory</button>
            <button onclick="switchReportTab('customers')" class="pb-3 px-1 text-sm font-medium border-b-2 transition ${activeTab === 'customers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}">Customers</button>
          </nav>
        </div>

        ${activeTab === 'overview' ? renderOverviewTab() : ''}
        ${activeTab === 'sales' ? renderSalesAnalyticsTab() : ''}
        ${activeTab === 'inventory' ? renderInventoryTab() : ''}
        ${activeTab === 'customers' ? renderCustomersTab() : ''}
      </div>
    </main>
  `;
}

// Overview Tab
function renderOverviewTab() {
  const totalSales = SALES_DATA.reduce((sum, s) => sum + parseFloat(s.grand_total), 0);
  const totalOrders = SALES_DATA.length;
  const totalProducts = PRODUCTS_DATA.data.length;
  const totalStock = STOCK_DATA.reduce((sum, item) => sum + item.stock, 0);
  const totalCustomers = CUSTOMERS_DATA.length;
  const inventoryValue = STOCK_DATA.reduce((sum, item) => sum + (item.stock * parseFloat(item.price)), 0);
  const profit = MOCK.profit.profit;

  const topProducts = MOCK.top_products.slice(0, 5);
  const recentSales = SALES_DATA.slice(0, 5);

  return `
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-gray-500 text-sm font-medium">Total Revenue</div>
              <div class="text-3xl font-bold mt-1 text-green-600">₹${totalSales.toFixed(2)}</div>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div class="text-xs text-gray-400 mt-3">+12.5% from last month</div>
        </div>
        
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-gray-500 text-sm font-medium">Total Orders</div>
              <div class="text-3xl font-bold mt-1">${totalOrders}</div>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            </div>
          </div>
          <div class="text-xs text-gray-400 mt-3">Avg. ₹${(totalSales / totalOrders).toFixed(2)} per order</div>
        </div>
        
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-gray-500 text-sm font-medium">Inventory Value</div>
              <div class="text-3xl font-bold mt-1">₹${inventoryValue.toFixed(2)}</div>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
          </div>
          <div class="text-xs text-gray-400 mt-3">${totalStock} units in stock</div>
        </div>
        
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-gray-500 text-sm font-medium">Net Profit</div>
              <div class="text-3xl font-bold mt-1 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}">₹${profit}</div>
            </div>
            <div class="w-12 h-12 ${profit >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            </div>
          </div>
          <div class="text-xs text-gray-400 mt-3">Margin: ${((totalSales - parseFloat(MOCK.profit.cost)) / totalSales * 100).toFixed(2)}%</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">Sales Trend</h3>
          <canvas id="reportSalesChart" height="200"></canvas>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">Top Products</h3>
          <div class="space-y-3">
            ${topProducts.map((p, i) => `
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-medium text-gray-500 w-6">#${i + 1}</span>
                  <span class="text-sm font-medium">${p.name}</span>
                </div>
                <span class="text-sm font-semibold">${p.total_qty} sold</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Summary Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-xl shadow-sm text-white">
          <div class="text-indigo-100 text-sm font-medium">Products</div>
          <div class="text-4xl font-bold mt-2">${totalProducts}</div>
          <div class="text-indigo-100 text-sm mt-2">Active products</div>
        </div>
        <div class="bg-gradient-to-br from-green-500 to-teal-600 p-5 rounded-xl shadow-sm text-white">
          <div class="text-green-100 text-sm font-medium">Customers</div>
          <div class="text-4xl font-bold mt-2">${totalCustomers}</div>
          <div class="text-green-100 text-sm mt-2">Registered customers</div>
        </div>
        <div class="bg-gradient-to-br from-orange-500 to-red-600 p-5 rounded-xl shadow-sm text-white">
          <div class="text-orange-100 text-sm font-medium">Low Stock Items</div>
          <div class="text-4xl font-bold mt-2">${STOCK_DATA.filter(item => item.stock < 50).length}</div>
          <div class="text-orange-100 text-sm mt-2">Need attention</div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="font-semibold text-gray-800">Recent Sales Transactions</h3>
          <button onclick="switchReportTab('sales')" class="text-sm text-indigo-600 hover:text-indigo-800">View All →</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th class="px-5 py-3 text-left">Invoice</th>
                <th class="px-5 py-3 text-right">Total</th>
                <th class="px-5 py-3 text-right">Tax</th>
                <th class="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${recentSales.map(s => `
                <tr>
                  <td class="px-5 py-3 font-medium">${s.invoice_number}</td>
                  <td class="px-5 py-3 text-right">₹${parseFloat(s.total).toFixed(2)}</td>
                  <td class="px-5 py-3 text-right">₹${parseFloat(s.tax).toFixed(2)}</td>
                  <td class="px-5 py-3 text-center">
                    <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">${s.status}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Sales Analytics Tab
function renderSalesAnalyticsTab() {
  const totalSales = SALES_DATA.reduce((sum, s) => sum + parseFloat(s.grand_total), 0);
  const totalOrders = SALES_DATA.length;
  const totalTax = SALES_DATA.reduce((sum, s) => sum + parseFloat(s.tax), 0);

  return `
    <div class="space-y-6">
      <!-- Sales KPI -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm">Total Sales</div>
          <div class="text-2xl font-bold mt-1">₹${totalSales.toFixed(2)}</div>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm">Total Orders</div>
          <div class="text-2xl font-bold mt-1">${totalOrders}</div>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm">Average Order</div>
          <div class="text-2xl font-bold mt-1">₹${(totalSales / totalOrders).toFixed(2)}</div>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm">Total Tax</div>
          <div class="text-2xl font-bold mt-1">₹${totalTax.toFixed(2)}</div>
        </div>
      </div>

      <!-- Sales Chart -->
      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">Daily Sales</h3>
        <canvas id="dailySalesChart" height="150"></canvas>
      </div>

      <!-- All Sales Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h3 class="font-semibold text-gray-800">All Sales Transactions</h3>
        </div>
        <div class="overflow-x-auto max-h-96 overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0">
              <tr>
                <th class="px-5 py-3 text-left">Date</th>
                <th class="px-5 py-3 text-left">Invoice</th>
                <th class="px-5 py-3 text-right">Subtotal</th>
                <th class="px-5 py-3 text-right">Tax</th>
                <th class="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${SALES_DATA.map(s => `
                <tr>
                  <td class="px-5 py-3 text-gray-600">${new Date(s.created_at).toLocaleDateString()}</td>
                  <td class="px-5 py-3 font-medium">${s.invoice_number}</td>
                  <td class="px-5 py-3 text-right">₹${s.total}</td>
                  <td class="px-5 py-3 text-right">₹${s.tax}</td>
                  <td class="px-5 py-3 text-right font-semibold">₹${s.grand_total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Inventory Tab
function renderInventoryTab() {
  const totalValue = STOCK_DATA.reduce((sum, item) => sum + (item.stock * parseFloat(item.price)), 0);
  const lowStock = STOCK_DATA.filter(item => item.stock < 50);
  const outOfStock = STOCK_DATA.filter(item => item.stock === 0);

  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm">Total Inventory Value</div>
          <div class="text-2xl font-bold mt-1">₹${totalValue.toFixed(2)}</div>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm">Low Stock Items</div>
          <div class="text-2xl font-bold mt-1 text-yellow-600">${lowStock.length}</div>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm">Out of Stock</div>
          <div class="text-2xl font-bold mt-1 text-red-600">${outOfStock.length}</div>
        </div>
      </div>

      <!-- Stock Distribution Chart -->
      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">Stock Value by Product</h3>
        <canvas id="stockChart" height="150"></canvas>
      </div>

      <!-- Inventory Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h3 class="font-semibold text-gray-800">Current Inventory</h3>
        </div>
        <div class="overflow-x-auto max-h-96 overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0">
              <tr>
                <th class="px-5 py-3 text-left">Product</th>
                <th class="px-5 py-3 text-right">Price</th>
                <th class="px-5 py-3 text-center">Stock</th>
                <th class="px-5 py-3 text-right">Value</th>
                <th class="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${STOCK_DATA.map(item => {
    const status = item.stock === 0 ? 'Out of Stock' : item.stock < 50 ? 'Low Stock' : 'In Stock';
    const statusColor = item.stock === 0 ? 'bg-red-100 text-red-700' : item.stock < 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
    return `
                  <tr>
                    <td class="px-5 py-3 font-medium">${item.name}</td>
                    <td class="px-5 py-3 text-right">₹${item.price}</td>
                    <td class="px-5 py-3 text-center">${item.stock}</td>
                    <td class="px-5 py-3 text-right">₹${(item.stock * parseFloat(item.price)).toFixed(2)}</td>
                    <td class="px-5 py-3 text-center">
                      <span class="text-xs px-2 py-1 rounded-full ${statusColor}">${status}</span>
                    </td>
                  </tr>
                `;
  }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Customers Tab
function renderCustomersTab() {
  const totalCustomers = CUSTOMERS_DATA.length;
  const totalCredit = CUSTOMERS_DATA.reduce((sum, c) => sum + parseFloat(c.credit_balance), 0);

  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm">Total Customers</div>
          <div class="text-2xl font-bold mt-1">${totalCustomers}</div>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm">Total Credit Balance</div>
          <div class="text-2xl font-bold mt-1">₹${totalCredit.toFixed(2)}</div>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="text-gray-500 text-sm">Avg. per Customer</div>
          <div class="text-2xl font-bold mt-1">₹${(totalCredit / totalCustomers).toFixed(2)}</div>
        </div>
      </div>

      <!-- Customers Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h3 class="font-semibold text-gray-800">Customer List</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th class="px-5 py-3 text-left">Name</th>
                <th class="px-5 py-3 text-left">Mobile</th>
                <th class="px-5 py-3 text-left">GSTIN</th>
                <th class="px-5 py-3 text-right">Credit Balance</th>
                <th class="px-5 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${CUSTOMERS_DATA.map(c => `
                <tr>
                  <td class="px-5 py-3 font-medium">${c.name}</td>
                  <td class="px-5 py-3">${c.mobile}</td>
                  <td class="px-5 py-3">${c.gstin || '—'}</td>
                  <td class="px-5 py-3 text-right ${parseFloat(c.credit_balance) >= 0 ? 'text-green-600' : 'text-red-600'}">
                    ₹${c.credit_balance}
                  </td>
                  <td class="px-5 py-3 text-gray-500">${new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Report functions
function setReportDateRange(range) {
  reportsState.dateRange = range;
  refreshReportsUI();
  setTimeout(() => initReportCharts(), 100);
}

function switchReportTab(tab) {
  reportsState.activeTab = tab;
  refreshReportsUI();
  setTimeout(() => initReportCharts(), 100);
}

function exportReport() {
  alert('Report exported successfully!');
}

function initReportCharts() {
  // Sales trend chart (Overview tab)
  const salesCtx = document.getElementById('reportSalesChart')?.getContext('2d');
  if (salesCtx) {
    new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: MOCK.salesTrend.map(d => d.date.slice(5)),
        datasets: [{
          label: 'Sales (₹)',
          data: MOCK.salesTrend.map(d => parseFloat(d.total)),
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }

  // Daily sales chart (Sales tab)
  const dailyCtx = document.getElementById('dailySalesChart')?.getContext('2d');
  if (dailyCtx) {
    new Chart(dailyCtx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Sales (₹)',
          data: [1250, 980, 1450, 2100, 1850, 2450, 1675],
          backgroundColor: '#4f46e5'
        }]
      },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }

  // Stock chart (Inventory tab)
  const stockCtx = document.getElementById('stockChart')?.getContext('2d');
  if (stockCtx) {
    const topStock = STOCK_DATA.slice(0, 6);
    new Chart(stockCtx, {
      type: 'doughnut',
      data: {
        labels: topStock.map(s => s.name),
        datasets: [{
          data: topStock.map(s => s.stock * parseFloat(s.price)),
          backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
        }]
      },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }
}

function refreshReportsUI() {
  const app = document.getElementById('app');
  const mainContent = app.querySelector('.flex-1.flex.flex-col.overflow-hidden');
  if (mainContent) {
    const topBarHtml = mainContent.querySelector('header').outerHTML;
    mainContent.innerHTML = topBarHtml + renderReportsPage();
    setTimeout(() => initReportCharts(), 100);
  }
}

// Export for router
window.setReportDateRange = setReportDateRange;
window.switchReportTab = switchReportTab;
window.exportReport = exportReport;

// ----- PRODUCTS PAGE COMPONENT (with CRUD) -----


// ----- STOCK PAGE COMPONENT (with CRUD for stock adjustments) -----

// Stock mock data
const STOCK_DATA = [
  { name: "Rice 1kg", stock: 96, price: "50.00" },
  { name: "Wheat Flour 1kg", stock: 150, price: "45.00" },
  { name: "Sunflower Oil 1L", stock: 89, price: "140.00" },
  { name: "Tea Powder 250g", stock: 74, price: "85.00" },
  { name: "Milk 500ml", stock: 119, price: "30.00" },
  { name: "Biscuit Pack", stock: 250, price: "25.00" },
  { name: "Toor Dal 1kg", stock: 110, price: "130.00" },
  { name: "Rice 1kg", stock: 91, price: "50.00" },
  { name: "Rice 1kg", stock: 190, price: "50.00" },
  { name: "Salt 1kg", stock: 210, price: "20.00" },
  { name: "Coffee Powder 200g", stock: 60, price: "120.00" },
  { name: "Sugar 1kg", stock: 200, price: "42.00" }
];

// Stock state
let stockState = {
  items: [...STOCK_DATA],
  filteredItems: [...STOCK_DATA],
  searchTerm: '',
  stockFilter: 'all',
  selectedItem: null,
  isAdjustModalOpen: false,
  adjustmentType: 'add' // 'add' or 'remove'
};

// Stock Adjustment Modal
function renderStockAdjustModal() {
  const item = stockState.selectedItem;
  if (!item) return '';

  return `
    <div id="stockAdjustModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) closeStockAdjustModal()">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md" onclick="event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">Adjust Stock</h2>
          <button onclick="closeStockAdjustModal()" class="p-1 hover:bg-gray-100 rounded-lg transition">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm text-gray-500">Product</div>
            <div class="font-semibold text-lg">${item.name}</div>
            <div class="text-sm text-gray-600 mt-1">Current Stock: <span class="font-medium">${item.stock} units</span></div>
            <div class="text-sm text-gray-600">Price: <span class="font-medium">₹${item.price}</span></div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Adjustment Type</label>
            <div class="flex gap-3">
              <button onclick="setAdjustmentType('add')" class="flex-1 py-2 px-4 rounded-lg border transition ${stockState.adjustmentType === 'add' ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 hover:bg-gray-50'}">
                Add Stock
              </button>
              <button onclick="setAdjustmentType('remove')" class="flex-1 py-2 px-4 rounded-lg border transition ${stockState.adjustmentType === 'remove' ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 hover:bg-gray-50'}">
                Remove Stock
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input type="number" id="adjustQuantity" min="1" value="1" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
            <select id="adjustReason" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="purchase">Purchase / Restock</option>
              <option value="sale">Sale / Order</option>
              <option value="return">Customer Return</option>
              <option value="damage">Damaged / Expired</option>
              <option value="adjustment">Manual Adjustment</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea id="adjustNotes" rows="2" placeholder="Additional notes..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>
          
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div class="text-sm text-yellow-800">
              <span class="font-medium">New Stock:</span> 
              <span id="previewStock">${item.stock}</span> units
            </div>
          </div>
          
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onclick="closeStockAdjustModal()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button onclick="applyStockAdjustment()" class="px-4 py-2 text-sm ${stockState.adjustmentType === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg shadow-sm transition">
              ${stockState.adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Bulk Stock Update Modal
function renderBulkUpdateModal() {
  return `
    <div id="bulkUpdateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) closeBulkUpdateModal()">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl" onclick="event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">Bulk Stock Update</h2>
          <button onclick="closeBulkUpdateModal()" class="p-1 hover:bg-gray-100 rounded-lg transition">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div class="p-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p class="text-sm text-blue-800">Upload a CSV file with columns: Product Name, New Stock Quantity</p>
          </div>
          
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            <p class="text-gray-600 mb-2">Drag and drop your CSV file here, or</p>
            <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Browse Files</button>
            <p class="text-xs text-gray-500 mt-2">Supported format: .csv (Max 5MB)</p>
          </div>
          
          <div class="flex justify-end gap-3 mt-6">
            <button onclick="closeBulkUpdateModal()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition" disabled>Upload & Update</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Stock page render function
function renderStockPage() {
  const { filteredItems } = stockState;

  // Calculate stats
  const totalItems = filteredItems.length;
  const totalStock = filteredItems.reduce((sum, item) => sum + item.stock, 0);
  const totalValue = filteredItems.reduce((sum, item) => sum + (item.stock * parseFloat(item.price)), 0);
  const lowStockItems = filteredItems.filter(item => item.stock < 50).length;

  // Group by product name for unique items
  const uniqueProducts = [...new Set(filteredItems.map(item => item.name))];
  const uniqueCount = uniqueProducts.length;

  const tableRows = filteredItems.map((item, index) => {
    const stockStatus = item.stock === 0 ? 'bg-red-100 text-red-700 border-red-200'
      : item.stock < 50 ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
        : 'bg-green-100 text-green-700 border-green-200';

    const stockValue = (item.stock * parseFloat(item.price)).toFixed(2);

    return `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3">
          <div class="font-medium text-gray-900">${item.name}</div>
        </td>
        <td class="px-4 py-3 text-right font-medium">₹${item.price}</td>
        <td class="px-4 py-3 text-center">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus}">
            ${item.stock}
          </span>
        </td>
        <td class="px-4 py-3 text-right text-sm text-gray-600">₹${stockValue}</td>
        <td class="px-4 py-3 text-right">
          <button onclick="openStockAdjust('${item.name}', ${index})" class="text-indigo-600 hover:text-indigo-800 mr-3 text-sm font-medium">
            Adjust
          </button>
          <button onclick="quickAddStock('${item.name}', ${index})" class="text-green-600 hover:text-green-800 text-sm font-medium">
            +1
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <main class="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Stock Management</h1>
            <p class="text-sm text-gray-500 mt-1">Manage and track your inventory levels</p>
          </div>
          <div class="flex gap-3">
            <button onclick="openBulkUpdate()" class="px-4 py-2 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              Bulk Update
            </button>
            <button onclick="exportStockReport()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Export
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Unique Products</div>
            <div class="text-2xl font-bold mt-1">${uniqueCount}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Total Items</div>
            <div class="text-2xl font-bold mt-1">${totalItems}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Total Stock</div>
            <div class="text-2xl font-bold mt-1">${totalStock}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Inventory Value</div>
            <div class="text-2xl font-bold mt-1 text-green-600">₹${totalValue.toFixed(2)}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Low Stock Alert</div>
            <div class="text-2xl font-bold mt-1 ${lowStockItems > 0 ? 'text-yellow-600' : ''}">${lowStockItems}</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="flex gap-3">
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="stockSearch" placeholder="Search by product name..." value="${stockState.searchTerm}" 
                onkeyup="handleStockSearch(event)" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <select id="stockFilter" onchange="handleStockFilter(event)" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="all" ${stockState.stockFilter === 'all' ? 'selected' : ''}>All Stock</option>
              <option value="low" ${stockState.stockFilter === 'low' ? 'selected' : ''}>Low Stock (< 50)</option>
              <option value="out" ${stockState.stockFilter === 'out' ? 'selected' : ''}>Out of Stock</option>
              <option value="available" ${stockState.stockFilter === 'available' ? 'selected' : ''}>In Stock</option>
            </select>
            <button onclick="clearStockFilters()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Clear</button>
          </div>
        </div>

        <!-- Stock Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${tableRows || `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No stock items found</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Low Stock Alert Section -->
        ${lowStockItems > 0 ? `
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <h3 class="font-semibold text-yellow-800">Low Stock Alert</h3>
          </div>
          <div class="space-y-2">
            ${filteredItems.filter(item => item.stock < 50).slice(0, 5).map(item => `
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-700">${item.name}</span>
                <span class="font-medium text-yellow-700">${item.stock} units left</span>
              </div>
            `).join('')}
            ${lowStockItems > 5 ? `<p class="text-xs text-gray-500 mt-2">+${lowStockItems - 5} more items</p>` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Pagination -->
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">Showing ${filteredItems.length} items</div>
          <div class="flex gap-2">
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg">1</button>
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
      
      ${stockState.isAdjustModalOpen ? renderStockAdjustModal() : ''}
    </main>
  `;
}

// Stock CRUD functions
function openStockAdjust(productName, index) {
  stockState.selectedItem = stockState.filteredItems[index];
  stockState.isAdjustModalOpen = true;
  refreshStockUI();

  // Add quantity change preview
  setTimeout(() => {
    const qtyInput = document.getElementById('adjustQuantity');
    if (qtyInput) {
      qtyInput.addEventListener('input', updateStockPreview);
      qtyInput.addEventListener('change', updateStockPreview);
    }
  }, 100);
}

function closeStockAdjustModal() {
  stockState.isAdjustModalOpen = false;
  stockState.selectedItem = null;
  stockState.adjustmentType = 'add';
  refreshStockUI();
}

function setAdjustmentType(type) {
  stockState.adjustmentType = type;
  refreshStockUI();
  setTimeout(() => {
    const qtyInput = document.getElementById('adjustQuantity');
    if (qtyInput) {
      qtyInput.addEventListener('input', updateStockPreview);
    }
    updateStockPreview();
  }, 100);
}

function updateStockPreview() {
  const qty = parseInt(document.getElementById('adjustQuantity')?.value) || 1;
  const previewSpan = document.getElementById('previewStock');
  if (previewSpan && stockState.selectedItem) {
    const newStock = stockState.adjustmentType === 'add'
      ? stockState.selectedItem.stock + qty
      : Math.max(0, stockState.selectedItem.stock - qty);
    previewSpan.textContent = newStock;
  }
}

function applyStockAdjustment() {
  const qty = parseInt(document.getElementById('adjustQuantity')?.value) || 0;
  const reason = document.getElementById('adjustReason')?.value || 'adjustment';
  const notes = document.getElementById('adjustNotes')?.value || '';

  if (qty <= 0) {
    alert('Please enter a valid quantity');
    return;
  }

  if (stockState.selectedItem) {
    const item = stockState.selectedItem;
    const oldStock = item.stock;

    if (stockState.adjustmentType === 'add') {
      item.stock += qty;
    } else {
      item.stock = Math.max(0, item.stock - qty);
    }

    // Log the adjustment (can be sent to backend)
    console.log('Stock adjusted:', {
      product: item.name,
      oldStock,
      newStock: item.stock,
      adjustment: stockState.adjustmentType === 'add' ? `+${qty}` : `-${qty}`,
      reason,
      notes,
      timestamp: new Date().toISOString()
    });

    applyStockSearch();
    closeStockAdjustModal();
  }
}

function quickAddStock(productName, index) {
  const item = stockState.filteredItems[index];
  if (item) {
    item.stock += 1;
    applyStockSearch();
    refreshStockUI();
  }
}

function openBulkUpdate() {
  alert('Bulk update feature would open CSV upload dialog');
  // For full implementation, you can uncomment and use renderBulkUpdateModal()
}

function exportStockReport() {
  const csv = ['Product Name,Stock,Price,Value'];
  stockState.filteredItems.forEach(item => {
    csv.push(`${item.name},${item.stock},${item.price},${(item.stock * parseFloat(item.price)).toFixed(2)}`);
  });

  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stock-report-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleStockSearch(event) {
  stockState.searchTerm = event.target.value;
  applyStockSearch();
  refreshStockUI();
}

function handleStockFilter(event) {
  stockState.stockFilter = event.target.value;
  applyStockSearch();
  refreshStockUI();
}

function clearStockFilters() {
  stockState.searchTerm = '';
  stockState.stockFilter = 'all';
  document.getElementById('stockSearch').value = '';
  document.getElementById('stockFilter').value = 'all';
  applyStockSearch();
  refreshStockUI();
}

function applyStockSearch() {
  let filtered = [...stockState.items];

  // Search filter
  if (stockState.searchTerm) {
    const term = stockState.searchTerm.toLowerCase();
    filtered = filtered.filter(item => item.name.toLowerCase().includes(term));
  }

  // Stock level filter
  if (stockState.stockFilter === 'low') {
    filtered = filtered.filter(item => item.stock < 50 && item.stock > 0);
  } else if (stockState.stockFilter === 'out') {
    filtered = filtered.filter(item => item.stock === 0);
  } else if (stockState.stockFilter === 'available') {
    filtered = filtered.filter(item => item.stock > 0);
  }

  stockState.filteredItems = filtered;
}

function refreshStockUI() {
  const app = document.getElementById('app');
  const mainContent = app.querySelector('.flex-1.flex.flex-col.overflow-hidden');
  if (mainContent) {
    const topBarHtml = mainContent.querySelector('header').outerHTML;
    mainContent.innerHTML = topBarHtml + renderStockPage();
  }
}

// Export for router
window.openStockAdjust = openStockAdjust;
window.closeStockAdjustModal = closeStockAdjustModal;
window.setAdjustmentType = setAdjustmentType;
window.applyStockAdjustment = applyStockAdjustment;
window.quickAddStock = quickAddStock;
window.openBulkUpdate = openBulkUpdate;
window.exportStockReport = exportStockReport;
window.handleStockSearch = handleStockSearch;
window.handleStockFilter = handleStockFilter;
window.clearStockFilters = clearStockFilters;

// Products mock data
const PRODUCTS_DATA = {
  success: true,
  message: null,
  data: [
    { product_uuid: "6ce13345-8f44-4acf-aba3-7d87614a0fee", name: "Biscuit Pack", barcode: "103456789", sku: "BISCUIT001", price: "25.00", gst_percent: "12.00", stock: 250 },
    { product_uuid: "8974fef5-3cd6-42df-a321-4c51ac9195fe", name: "Toor Dal 1kg", barcode: "923456789", sku: "DAL001", price: "130.00", gst_percent: "5.00", stock: 110 },
    { product_uuid: "cc0259af-7852-4114-b263-f5c330f92854", name: "Coffee Powder 200g", barcode: "823456789", sku: "COFFEE001", price: "120.00", gst_percent: "5.00", stock: 60 },
    { product_uuid: "3561a55b-061f-4392-ad13-01468f450359", name: "Tea Powder 250g", barcode: "723456789", sku: "TEA001", price: "85.00", gst_percent: "5.00", stock: 74 },
    { product_uuid: "4bd6cfdb-fc69-4856-81d1-886995ed59be", name: "Milk 500ml", barcode: "623456789", sku: "MILK001", price: "30.00", gst_percent: "5.00", stock: 119 },
    { product_uuid: "1c60ed2e-f3c4-4550-bea7-800a726fe44c", name: "Sunflower Oil 1L", barcode: "523456789", sku: "OIL001", price: "140.00", gst_percent: "5.00", stock: 89 },
    { product_uuid: "b7af5965-c9b2-44a6-a023-7b34da067118", name: "Salt 1kg", barcode: "423456789", sku: "SALT001", price: "20.00", gst_percent: "5.00", stock: 210 },
    { product_uuid: "fa8cedaa-28fd-4479-8a86-afa0130931fc", name: "Sugar 1kg", barcode: "323456789", sku: "SUGAR001", price: "42.00", gst_percent: "5.00", stock: 200 },
    { product_uuid: "108eab4c-7529-4284-8984-28b3d5a59f1b", name: "Wheat Flour 1kg", barcode: "223456789", sku: "WHEAT001", price: "45.00", gst_percent: "5.00", stock: 150 },
    { product_uuid: "9e27b110-1c2e-4d66-8d33-5a49fbe67f21", name: "Rice 1kg", barcode: "123456789", sku: "RICE001", price: "50.00", gst_percent: "5.00", stock: 190 }
  ]
};

// Products state management
let productsState = {
  products: [...PRODUCTS_DATA.data],
  filteredProducts: [...PRODUCTS_DATA.data],
  searchTerm: '',
  editingProduct: null,
  isFormOpen: false
};

// Product form modal HTML
function renderProductFormModal(product = null) {
  const isEditing = product !== null;
  const modalTitle = isEditing ? 'Edit Product' : 'Add New Product';

  return `
    <div id="productModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) closeProductModal()">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">${modalTitle}</h2>
          <button onclick="closeProductModal()" class="p-1 hover:bg-gray-100 rounded-lg transition">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <form id="productForm" onsubmit="handleProductSubmit(event, ${isEditing})" class="p-6 space-y-5">
          ${isEditing ? `<input type="hidden" id="productUuid" value="${product.product_uuid}">` : ''}
          
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input type="text" id="productName" value="${isEditing ? product.name : ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input type="text" id="productSku" value="${isEditing ? product.sku : ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
              <input type="text" id="productBarcode" value="${isEditing ? product.barcode : ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input type="number" step="0.01" min="0" id="productPrice" value="${isEditing ? product.price : ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">GST (%) *</label>
              <select id="productGst" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="0" ${isEditing && product.gst_percent === '0.00' ? 'selected' : ''}>0%</option>
                <option value="5" ${isEditing && product.gst_percent === '5.00' ? 'selected' : ''}>5%</option>
                <option value="12" ${isEditing && product.gst_percent === '12.00' ? 'selected' : ''}>12%</option>
                <option value="18" ${isEditing && product.gst_percent === '18.00' ? 'selected' : ''}>18%</option>
                <option value="28" ${isEditing && product.gst_percent === '28.00' ? 'selected' : ''}>28%</option>
              </select>
            </div>
            
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
              <input type="number" min="0" id="productStock" value="${isEditing ? product.stock : ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
          
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onclick="closeProductModal()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition">
              ${isEditing ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// Products page render function
function renderProductsPage() {
  const { filteredProducts } = productsState;

  // Calculate stats
  const totalProducts = filteredProducts.length;
  const totalStock = filteredProducts.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = filteredProducts.filter(p => p.stock < 50).length;
  const avgPrice = filteredProducts.length > 0
    ? (filteredProducts.reduce((sum, p) => sum + parseFloat(p.price), 0) / filteredProducts.length).toFixed(2)
    : '0.00';

  const tableRows = filteredProducts.map(product => {
    const stockStatus = product.stock === 0 ? 'bg-red-100 text-red-700'
      : product.stock < 50 ? 'bg-yellow-100 text-yellow-700'
        : 'bg-green-100 text-green-700';

    return `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3">
          <div class="font-medium text-gray-900">${product.name}</div>
          <div class="text-xs text-gray-500">SKU: ${product.sku}</div>
        </td>
        <td class="px-4 py-3 text-sm text-gray-600">${product.barcode || '—'}</td>
        <td class="px-4 py-3 text-sm font-medium">₹${parseFloat(product.price).toFixed(2)}</td>
        <td class="px-4 py-3 text-sm">${product.gst_percent}%</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stockStatus}">
            ${product.stock} units
          </span>
        </td>
        <td class="px-4 py-3 text-right">
          <button onclick="openEditProduct('${product.product_uuid}')" class="text-indigo-600 hover:text-indigo-800 mr-3 text-sm font-medium">Edit</button>
          <button onclick="deleteProduct('${product.product_uuid}')" class="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <main class="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Header with Add Button -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Products</h1>
            <p class="text-sm text-gray-500 mt-1">Manage your product inventory</p>
          </div>
          <button onclick="openAddProduct()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Add Product
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Total Products</div>
            <div class="text-2xl font-bold mt-1">${totalProducts}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Total Stock</div>
            <div class="text-2xl font-bold mt-1">${totalStock}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Low Stock Items</div>
            <div class="text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-yellow-600' : ''}">${lowStockCount}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Avg. Price</div>
            <div class="text-2xl font-bold mt-1">₹${avgPrice}</div>
          </div>
        </div>

        <!-- Search and Filter Bar -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="flex gap-3">
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="productSearch" placeholder="Search products by name, SKU or barcode..." value="${productsState.searchTerm}" 
                onkeyup="handleProductSearch(event)" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <button onclick="clearProductSearch()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Clear</button>
          </div>
        </div>

        <!-- Products Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${tableRows || `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No products found</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination (placeholder) -->
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">Showing ${filteredProducts.length} products</div>
          <div class="flex gap-2">
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg">1</button>
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
      
      ${productsState.isFormOpen ? renderProductFormModal(productsState.editingProduct) : ''}
    </main>
  `;
}

// CRUD Operations
function openAddProduct() {
  productsState.editingProduct = null;
  productsState.isFormOpen = true;
  refreshProductsUI();
}

function openEditProduct(uuid) {
  const product = productsState.products.find(p => p.product_uuid === uuid);
  if (product) {
    productsState.editingProduct = product;
    productsState.isFormOpen = true;
    refreshProductsUI();
  }
}

function closeProductModal() {
  productsState.isFormOpen = false;
  productsState.editingProduct = null;
  refreshProductsUI();
}

function handleProductSubmit(event, isEditing) {
  event.preventDefault();

  const formData = {
    name: document.getElementById('productName').value,
    sku: document.getElementById('productSku').value,
    barcode: document.getElementById('productBarcode').value,
    price: parseFloat(document.getElementById('productPrice').value).toFixed(2),
    gst_percent: document.getElementById('productGst').value + '.00',
    stock: parseInt(document.getElementById('productStock').value)
  };

  if (isEditing) {
    const uuid = document.getElementById('productUuid').value;
    const index = productsState.products.findIndex(p => p.product_uuid === uuid);
    if (index !== -1) {
      productsState.products[index] = {
        ...productsState.products[index],
        ...formData,
        updated_at: new Date().toISOString()
      };
    }
  } else {
    const newProduct = {
      product_uuid: crypto.randomUUID ? crypto.randomUUID() : 'uuid-' + Date.now(),
      tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    productsState.products.push(newProduct);
  }

  // Apply current search filter
  applyProductSearch();
  closeProductModal();

  // Show success message (you can replace with toast)
  console.log(isEditing ? 'Product updated' : 'Product added');
}

function deleteProduct(uuid) {
  if (confirm('Are you sure you want to delete this product?')) {
    productsState.products = productsState.products.filter(p => p.product_uuid !== uuid);
    applyProductSearch();
    refreshProductsUI();
  }
}

function handleProductSearch(event) {
  productsState.searchTerm = event.target.value;
  applyProductSearch();
  refreshProductsUI();
}

function clearProductSearch() {
  productsState.searchTerm = '';
  document.getElementById('productSearch').value = '';
  applyProductSearch();
  refreshProductsUI();
}

function applyProductSearch() {
  const term = productsState.searchTerm.toLowerCase();
  if (!term) {
    productsState.filteredProducts = [...productsState.products];
  } else {
    productsState.filteredProducts = productsState.products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      (p.barcode && p.barcode.includes(term))
    );
  }
}

function refreshProductsUI() {
  const app = document.getElementById('app');
  const mainContent = app.querySelector('.flex-1.flex.flex-col.overflow-hidden');
  if (mainContent) {
    const topBarHtml = mainContent.querySelector('header').outerHTML;
    mainContent.innerHTML = topBarHtml + renderProductsPage();
  }
}

// Export for router
window.openAddProduct = openAddProduct;
window.openEditProduct = openEditProduct;
window.closeProductModal = closeProductModal;
window.handleProductSubmit = handleProductSubmit;
window.deleteProduct = deleteProduct;
window.handleProductSearch = handleProductSearch;
window.clearProductSearch = clearProductSearch;
// ----- MOCK DATA -----
const MOCK = {
  overview: {
    today_sales: "267.75", month_sales: "1475.25", total_sales: "1475.25", total_orders: 14
  },
  recent_sales: [
    { invoice_number: "INV-00014", total: "255.00", grand_total: "267.75", status: "completed" },
    { invoice_number: "INV-00013", total: "250.00", grand_total: "262.50", status: "completed" },
    { invoice_number: "INV-00012", total: "50.00", grand_total: "52.50", status: "completed" },
    { invoice_number: "INV-00011", total: "100.00", grand_total: "105.00", status: "completed" },
    { invoice_number: "INV-00010", total: "50.00", grand_total: "52.50", status: "completed" }
  ],
  top_products: [
    { name: "Rice 1kg", total_qty: "10" }, { name: "Rice 1kg", total_qty: "9" }, { name: "Rice 1kg", total_qty: "4" },
    { name: "Tea Powder 250g", total_qty: "1" }, { name: "Milk 500ml", total_qty: "1" }
  ],
  recent_purchases: [
    { total: "600.00", supplier: { name: "Sri Lakshmi Suppliers" }, created_at: "2026-04-15T06:09:33.000000Z" },
    { total: "5000.00", supplier: { name: "ABC Traders" }, created_at: "2026-04-15T05:54:37.000000Z" }
  ],
  stockUpdates: [
    { name: "Rice 1kg", stock: 96, price: "50.00" }, { name: "Wheat Flour 1kg", stock: 150, price: "45.00" },
    { name: "Sunflower Oil 1L", stock: 89, price: "140.00" }, { name: "Tea Powder 250g", stock: 74, price: "85.00" },
    { name: "Milk 500ml", stock: 119, price: "30.00" }, { name: "Biscuit Pack", stock: 250, price: "25.00" }
  ],
  profit: { revenue: "1405.00", cost: "5600.00", profit: -4195 },
  salesTrend: [{ date: "2026-04-13", total: "1207.50" }, { date: "2026-04-15", total: "267.75" }]
};

const PROFILE_DATA = {
  success: true,
  data: {
    user: {
      user_uuid: "75e65f5d-47a0-4765-a0cd-2f734c5cb7ed",
      tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
      name: "Admin",
      email: "admin@myshop.com",
      role: "owner",
      created_at: "2026-04-11T23:12:30.000000Z",
      updated_at: "2026-04-11T23:12:30.000000Z"
    },
    tenant: {
      plan: "pro",
      price: "499.00",
      is_active: 1,
      expiry_date: "2026-04-19 17:43:02"
    }
  }
};

// ----- SHARED NAVIGATION CONFIG -----
// ----- SHARED NAVIGATION CONFIG -----
const NAV_ITEMS = [
  {
    group: 'Core', items: [
      { name: 'Dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
      { name: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
    ]
  },
  {
    group: 'Commerce', items: [
      { name: 'Products', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
      { name: 'Sales', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
      { name: 'Customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }
    ]
  },
  {
    group: 'Inventory', items: [
      { name: 'Stock', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
      { name: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { name: 'Suppliers', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
      { name: 'Purchases', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { name: 'Purchase History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', page: 'purchase-history' }  // Add explicit page key
    ]
  },
  {
    group: 'Admin', items: [
      { name: 'Staff', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { name: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
    ]
  }
];

// ----- REUSABLE COMPONENTS -----
function renderSidebar(activePage = 'Dashboard') {
  const navHtml = NAV_ITEMS.map(group => `
    <div>
      <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">${group.group}</h3>
      <div class="space-y-1">
        ${group.items.map(item => {
    // Use explicit page if defined, otherwise convert name to lowercase
    const pageKey = item.page || item.name.toLowerCase();
    return `
            <a href="#" data-page="${pageKey}" class="nav-link flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg ${item.name === activePage ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'} transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"/></svg>
              ${item.name}
            </a>
          `;
  }).join('')}
      </div>
    </div>
  `).join('');

  const userName = PROFILE_DATA.data.user.name;
  const userRole = PROFILE_DATA.data.user.role;
  const userInitial = userName.charAt(0);

  return `
    <aside class="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-sm z-10">
      <div class="h-16 flex items-center px-5 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
          <span class="font-semibold text-xl tracking-tight text-gray-800">Stockify</span>
        </div>
      </div>
      <nav class="flex-1 overflow-y-auto py-5 px-3 space-y-6">${navHtml}</nav>
      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">${userInitial}</div>
          <div class="text-sm font-medium">${userName} <span class="block text-xs text-gray-500 capitalize">${userRole}</span></div>
        </div>
      </div>
    </aside>
  `;
}

// Update the navigation condition to be simpler (check if page exists in pageMap)
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetPage = link.dataset.page;
    if (pageMap[targetPage]) {
      renderApp(targetPage);
    }
  });
});

function renderTopBar(breadcrumbs = ['Home', 'Dashboard']) {
  const breadcrumbHtml = breadcrumbs.map((crumb, i) => {
    const isLast = i === breadcrumbs.length - 1;
    return isLast ? `<li class="text-gray-900 font-medium">${crumb}</li>` : `<li><a href="#" class="text-gray-500 hover:text-indigo-600">${crumb}</a></li><li class="text-gray-400">/</li>`;
  }).join('');
  return `
    <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-xs">
      <nav class="flex" aria-label="Breadcrumb"><ol class="flex items-center space-x-2 text-sm">${breadcrumbHtml}</ol></nav>
      <div class="flex items-center gap-4">
        <button class="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div class="w-8 h-8 rounded-full bg-gray-200"></div>
      </div>
    </header>
  `;
}

// Dashboard components
function renderStatCards(overview) {
  const cards = [
    { label: "Today's sales", value: `Rs.${overview.today_sales}`, extra: '<span class="text-xs text-green-600 mt-2 flex items-center gap-1">▲ +8.2%</span>' },
    { label: "Month sales", value: `Rs.${overview.month_sales}`, extra: '<span class="text-xs text-gray-400 mt-2">Apr 2026</span>' },
    { label: "Total sales (all time)", value: `Rs.${overview.total_sales}`, extra: '' },
    { label: "Total orders", value: overview.total_orders, extra: '<span class="text-xs text-indigo-600 mt-2">14 completed</span>' }
  ];
  return cards.map(c => `
    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 dashboard-card">
      <div class="text-gray-500 text-sm font-medium">${c.label}</div>
      <div class="text-3xl font-bold mt-1">${c.value}</div>
      ${c.extra}
    </div>
  `).join('');
}

function renderProfitCard(profit) {
  return `
    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 dashboard-card">
      <div class="text-gray-500 text-sm font-medium mb-2">Profit snapshot</div>
      <div class="flex items-end justify-between">
        <div><div class="text-2xl font-bold text-gray-800">Rs.${profit.profit}</div><div class="text-xs text-gray-400 mt-1">Revenue Rs.${profit.revenue} · Cost Rs.${profit.cost}</div></div>
        <div class="bg-red-50 text-red-600 text-sm font-medium px-3 py-1 rounded-full">-74.9%</div>
      </div>
    </div>
  `;
}

function renderChartContainer() {
  return `
    <div class="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-2"><span class="text-sm font-medium text-gray-500">Sales trend (last days)</span><span class="text-xs text-indigo-500">daily total</span></div>
      <canvas id="salesChart" height="100" class="w-full"></canvas>
    </div>
  `;
}

function renderTopProductsTable(products) {
  const rows = products.map(p => `<tr><td class="px-4 py-3 font-medium">${p.name}</td><td class="px-4 py-3 text-right">${p.total_qty}</td><td class="px-4 py-3 text-right">Rs.50.00</td></tr>`).join('');
  return `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 font-semibold text-gray-700 flex justify-between"><span>🔥 Most selling products</span><span class="text-xs text-gray-400">by quantity</span></div>
      <div class="p-2"><table class="w-full text-sm"><thead class="text-gray-500 text-xs uppercase bg-gray-50"><tr><th class="px-4 py-3 text-left">Product</th><th class="px-4 py-3 text-right">Qty sold</th><th class="px-4 py-3 text-right">Price</th></tr></thead><tbody class="divide-y divide-gray-100">${rows}</tbody></table></div>
    </div>
  `;
}

function renderStockTable(stockItems, limit = 6) {
  const rows = stockItems.slice(0, limit).map(s => `<tr><td class="px-4 py-2">${s.name}</td><td class="px-4 py-2 text-right">${s.stock}</td><td class="px-4 py-2 text-right">Rs.${s.price}</td></tr>`).join('');
  return `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 font-semibold text-gray-700">📦 Recent stock levels</div>
      <div class="p-2 max-h-64 overflow-y-auto"><table class="w-full text-sm"><thead class="text-gray-500 text-xs bg-gray-50"><tr><th class="px-4 py-2 text-left">Item</th><th class="px-4 py-2 text-right">Stock</th><th class="px-4 py-2 text-right">Price</th></tr></thead><tbody class="divide-y">${rows}</tbody></table><div class="text-center text-xs text-gray-400 mt-2">+${stockItems.length - limit} more items</div></div>
    </div>
  `;
}

function renderRecentSales(sales) {
  const rows = sales.map(s => `<tr><td class="px-5 py-3 font-medium">${s.invoice_number}</td><td class="px-5 py-3 text-right">Rs.${s.total}</td><td class="px-5 py-3 text-right font-medium">Rs.${s.grand_total}</td><td class="px-5 py-3 text-center"><span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">${s.status}</span></td></tr>`).join('');
  return `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 font-semibold text-gray-700">🧾 Recent sales</div>
      <div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-gray-500 text-xs"><tr><th class="px-5 py-3 text-left">Invoice</th><th class="px-5 py-3 text-right">Total</th><th class="px-5 py-3 text-right">Grand total</th><th class="px-5 py-3 text-center">Status</th></tr></thead><tbody class="divide-y">${rows}</tbody></table></div>
    </div>
  `;
}

function renderRecentPurchases(purchases) {
  const rows = purchases.map(p => {
    const date = new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    return `<tr><td class="px-5 py-3 font-medium">${p.supplier.name}</td><td class="px-5 py-3 text-right">Rs.${p.total}</td><td class="px-5 py-3 text-right text-gray-500">${date}</td></tr>`;
  }).join('');
  return `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 font-semibold text-gray-700">📋 Recent purchases</div>
      <div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-gray-500 text-xs"><tr><th class="px-5 py-3 text-left">Supplier</th><th class="px-5 py-3 text-right">Total</th><th class="px-5 py-3 text-right">Date</th></tr></thead><tbody class="divide-y">${rows}</tbody></table></div>
      <div class="p-4 text-xs text-gray-400 border-t">Showing ${purchases.length} recent purchases</div>
    </div>
  `;
}

function renderDashboardPage() {
  return `
    <main class="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div class="mb-6 flex items-center justify-between"><h1 class="text-2xl font-bold text-gray-800">Dashboard overview</h1><div class="text-sm text-gray-500">Last updated: Apr 15, 2026</div></div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">${renderStatCards(MOCK.overview)}</div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">${renderProfitCard(MOCK.profit)}${renderChartContainer()}</div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">${renderTopProductsTable(MOCK.top_products)}${renderStockTable(MOCK.stockUpdates, 6)}</div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">${renderRecentSales(MOCK.recent_sales)}${renderRecentPurchases(MOCK.recent_purchases)}</div>
    </main>
  `;
}

function initSalesChart(salesData) {
  const canvas = document.getElementById('salesChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: salesData.map(d => d.date.slice(5)),
      datasets: [{
        label: 'Sales (Rs.)', data: salesData.map(d => parseFloat(d.total)),
        borderColor: '#4f46e5', backgroundColor: 'rgba(79, 70, 229, 0.05)',
        tension: 0.2, fill: true, pointBackgroundColor: '#4f46e5', pointRadius: 4
      }]
    },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }
  });
}

// Profile page
function renderProfilePage() {
  const { user, tenant } = PROFILE_DATA.data;
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const expiryDate = new Date(tenant.expiry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const planBadge = tenant.plan === 'pro' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-500';

  return `
    <main class="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-800">Profile Settings</h1>
          <div class="text-sm text-gray-500">Member since ${joinDate}</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-100">
            <h2 class="font-semibold text-gray-800 text-lg">Personal Information</h2>
            <p class="text-sm text-gray-500 mt-0.5">Update your account details</p>
          </div>
          <div class="p-6">
            <div class="flex items-start gap-6">
              <div class="flex-shrink-0">
                <div class="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-semibold shadow-md">
                  ${user.name.charAt(0)}
                </div>
              </div>
              <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Full Name</label><div class="flex items-center gap-2"><span class="text-gray-800 font-medium">${user.name}</span><button class="text-indigo-600 text-sm hover:underline">Edit</button></div></div>
                <div><label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email Address</label><div class="flex items-center gap-2"><span class="text-gray-800">${user.email}</span><button class="text-indigo-600 text-sm hover:underline">Change</button></div></div>
                <div><label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Role</label><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">${user.role}</span></div>
                <div><label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">User UUID</label><span class="text-gray-500 text-sm font-mono">${user.user_uuid.substring(0, 18)}…</span></div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <div><h2 class="font-semibold text-gray-800 text-lg">Subscription Plan</h2><p class="text-sm text-gray-500">Your current plan and billing details</p></div>
            <button class="text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">Upgrade Plan</button>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-1"><span class="text-xs font-medium text-gray-500 uppercase">Current Plan</span><div class="flex items-center gap-2"><span class="text-2xl font-bold capitalize">${tenant.plan}</span><span class="${planBadge} text-white text-xs px-2 py-0.5 rounded-full">Active</span></div></div>
              <div class="space-y-1"><span class="text-xs font-medium text-gray-500 uppercase">Monthly Price</span><div class="text-2xl font-bold text-gray-800">₹${tenant.price}</div></div>
              <div class="space-y-1"><span class="text-xs font-medium text-gray-500 uppercase">Next Billing / Expiry</span><div class="text-lg font-semibold text-gray-800">${expiryDate}</div><span class="text-xs ${tenant.is_active ? 'text-green-600' : 'text-red-500'}">● ${tenant.is_active ? 'Active subscription' : 'Inactive'}</span></div>
            </div>
          </div>
          <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 text-sm text-gray-600 flex justify-between items-center">
            <span>Tenant UUID: <code class="text-xs bg-gray-200 px-2 py-0.5 rounded">${user.tenant_uuid}</code></span>
            <a href="#" class="text-indigo-600 font-medium hover:underline">Billing history →</a>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-100"><h2 class="font-semibold text-gray-800 text-lg">Security</h2><p class="text-sm text-gray-500">Manage your password and session</p></div>
          <div class="p-6 space-y-4">
            <div class="flex items-center justify-between"><div><div class="font-medium text-gray-800">Password</div><div class="text-sm text-gray-500">Last changed never · use a strong password</div></div><button class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Change password</button></div>
            <div class="flex items-center justify-between pt-2"><div><div class="font-medium text-gray-800">Two-factor authentication</div><div class="text-sm text-gray-500">Add an extra layer of security</div></div><button class="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100">Enable 2FA</button></div>
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button class="px-5 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
          <button class="px-5 py-2.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition">Save changes</button>
        </div>
      </div>
    </main>
  `;
}

// ----- SALES PAGE COMPONENT (with detail view) -----

// Sales mock data
const SALES_DATA = [
  { sale_uuid: "36053baf-83e6-48a9-a50c-dcff27a283d3", invoice_number: "INV-00014", total: "255.00", tax: "12.75", grand_total: "267.75", status: "completed", created_at: "2026-04-15T04:58:31.000000Z" },
  { sale_uuid: "386f4d96-d02f-4817-9add-372f22d11fac", invoice_number: "INV-00013", total: "250.00", tax: "12.50", grand_total: "262.50", status: "completed", created_at: "2026-04-13T15:19:16.000000Z" },
  { sale_uuid: "bf625744-fc45-44d2-b45d-ab550d59d9dc", invoice_number: "INV-00012", total: "50.00", tax: "2.50", grand_total: "52.50", status: "completed", created_at: "2026-04-13T14:59:49.000000Z" },
  { sale_uuid: "0fccb920-70ac-449c-ba4d-df6298554299", invoice_number: "INV-00011", total: "100.00", tax: "5.00", grand_total: "105.00", status: "completed", created_at: "2026-04-13T10:07:45.000000Z" },
  { sale_uuid: "849aac72-d875-419a-92c0-9c3caa975e21", invoice_number: "INV-00010", total: "50.00", tax: "2.50", grand_total: "52.50", status: "completed", created_at: "2026-04-13T10:06:45.000000Z" },
  { sale_uuid: "5c67445c-c7b4-4aa3-a681-81bad844a581", invoice_number: "INV-00009", total: "50.00", tax: "2.50", grand_total: "52.50", status: "completed", created_at: "2026-04-13T10:05:01.000000Z" },
  { sale_uuid: "a8be606e-c543-41b5-bbfc-6fbd31ef8b5c", invoice_number: "INV-00008", total: "50.00", tax: "2.50", grand_total: "52.50", status: "completed", created_at: "2026-04-13T10:02:16.000000Z" },
  { sale_uuid: "816ba6f2-17d9-44b1-bf28-c9d7e0c521c6", invoice_number: "INV-00007", total: "100.00", tax: "5.00", grand_total: "105.00", status: "completed", created_at: "2026-04-13T10:01:36.000000Z" },
  { sale_uuid: "ed18291d-5d90-4024-a805-f1bbcb48a55c", invoice_number: "INV-00006", total: "50.00", tax: "2.50", grand_total: "52.50", status: "completed", created_at: "2026-04-13T09:54:34.000000Z" },
  { sale_uuid: "b12aad2b-4b8b-47fd-8600-74494640ee2b", invoice_number: "INV-00005", total: "50.00", tax: "2.50", grand_total: "52.50", status: "completed", created_at: "2026-04-13T09:37:45.000000Z" },
  { sale_uuid: "da00dc3a-e746-493a-ad99-e09d9550c8bf", invoice_number: "INV-00004", total: "100.00", tax: "5.00", grand_total: "105.00", status: "completed", created_at: "2026-04-13T09:33:18.000000Z" },
  { sale_uuid: "ad3c81d2-fc55-4b77-9fad-32d50ee099fd", invoice_number: "INV-00003", total: "100.00", tax: "5.00", grand_total: "105.00", status: "completed", created_at: "2026-04-13T09:19:46.000000Z" },
  { sale_uuid: "93958ae0-283f-4297-8721-dd83bab109fe", invoice_number: "INV-00002", total: "100.00", tax: "5.00", grand_total: "105.00", status: "completed", created_at: "2026-04-13T09:08:10.000000Z" },
  { sale_uuid: "d5de0f62-814d-4f82-8dbc-2ee1932e8ab7", invoice_number: "INV-00001", total: "100.00", tax: "5.00", grand_total: "105.00", status: "completed", created_at: "2026-04-13T09:02:01.000000Z" }
];

const SALE_DETAIL_DATA = {
  shop: null,
  invoice_number: "INV-00014",
  date: "2026-04-15T04:58:31.000000Z",
  customer: null,
  items: [
    { name: "Tea Powder 250g", qty: 1, price: 85, total: 85, tax_percent: 5, tax_amount: 4.25 },
    { name: "Sunflower Oil 1L", qty: 1, price: 140, total: 140, tax_percent: 5, tax_amount: 7 },
    { name: "Milk 500ml", qty: 1, price: 30, total: 30, tax_percent: 5, tax_amount: 1.5 }
  ],
  summary: { total: 255, tax: 12.75, cgst: 6.375, sgst: 6.375, grand_total: "267.75" },
  payments: [{ method: "cash", amount: "267.75" }]
};

// Sales state
let salesState = {
  sales: [...SALES_DATA],
  filteredSales: [...SALES_DATA],
  searchTerm: '',
  dateFilter: 'all',
  selectedSale: null,
  isDetailOpen: false
};

// Invoice Detail Modal
function renderInvoiceModal(saleDetail) {
  const saleDate = new Date(saleDetail.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const itemsHtml = saleDetail.items.map((item, idx) => `
    <tr class="border-b border-gray-100">
      <td class="py-3 px-4">${idx + 1}</td>
      <td class="py-3 px-4 font-medium">${item.name}</td>
      <td class="py-3 px-4 text-center">${item.qty}</td>
      <td class="py-3 px-4 text-right">₹${item.price.toFixed(2)}</td>
      <td class="py-3 px-4 text-right">${item.tax_percent}%</td>
      <td class="py-3 px-4 text-right">₹${item.tax_amount.toFixed(2)}</td>
      <td class="py-3 px-4 text-right font-medium">₹${item.total.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div id="invoiceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) closeInvoiceModal()">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <!-- Invoice Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-800">Invoice ${saleDetail.invoice_number}</h2>
              <p class="text-sm text-gray-500 mt-0.5">${saleDate}</p>
            </div>
            <div class="flex gap-3">
              <button onclick="window.print()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Print
              </button>
              <button onclick="closeInvoiceModal()" class="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Invoice Content -->
        <div class="p-6">
          <!-- Shop & Customer Info -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shop Details</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="font-semibold text-gray-800">Stockify Store</p>
                <p class="text-sm text-gray-600">123 Main Street, Chennai</p>
                <p class="text-sm text-gray-600">GST: 33ABCDE1234F1Z5</p>
              </div>
            </div>
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-gray-600">Walk-in Customer</p>
                <p class="text-sm text-gray-500 mt-1">No customer details</p>
              </div>
            </div>
          </div>
          
          <!-- Items Table -->
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Items</h3>
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th class="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th class="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th class="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">GST</th>
                    <th class="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Tax Amt</th>
                    <th class="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
              </table>
            </div>
          </div>
          
          <!-- Summary & Payment -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                ${saleDetail.payments.map(p => `
                  <div class="flex justify-between">
                    <span class="text-gray-700 capitalize">${p.method}</span>
                    <span class="font-medium">₹${parseFloat(p.amount).toFixed(2)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Summary</h3>
              <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Subtotal</span>
                  <span>₹${saleDetail.summary.total.toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">CGST (2.5%)</span>
                  <span>₹${saleDetail.summary.cgst.toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">SGST (2.5%)</span>
                  <span>₹${saleDetail.summary.sgst.toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-sm border-t border-gray-200 pt-2">
                  <span class="text-gray-600">Total Tax</span>
                  <span>₹${saleDetail.summary.tax.toFixed(2)}</span>
                </div>
                <div class="flex justify-between font-bold text-base border-t border-gray-300 pt-2">
                  <span>Grand Total</span>
                  <span>₹${saleDetail.summary.grand_total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Sales page render function
function renderSalesPage() {
  const { filteredSales } = salesState;

  // Calculate stats
  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, s) => sum + parseFloat(s.grand_total), 0);
  const totalTax = filteredSales.reduce((sum, s) => sum + parseFloat(s.tax), 0);
  const avgOrderValue = totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : '0.00';

  // Get unique dates for filter
  const dates = [...new Set(salesState.sales.map(s => s.created_at.split('T')[0]))];

  const tableRows = filteredSales.map(sale => {
    const saleDate = new Date(sale.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
    const saleTime = new Date(sale.created_at).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });

    return `
      <tr class="hover:bg-gray-50 cursor-pointer" onclick="viewInvoiceDetail('${sale.sale_uuid}')">
        <td class="px-4 py-3">
          <div class="font-medium text-gray-900">${sale.invoice_number}</div>
          <div class="text-xs text-gray-500">${saleDate} ${saleTime}</div>
        </td>
        <td class="px-4 py-3 text-right font-medium">₹${parseFloat(sale.total).toFixed(2)}</td>
        <td class="px-4 py-3 text-right text-sm text-gray-600">₹${parseFloat(sale.tax).toFixed(2)}</td>
        <td class="px-4 py-3 text-right font-semibold text-gray-900">₹${parseFloat(sale.grand_total).toFixed(2)}</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            ${sale.status}
          </span>
        </td>
        <td class="px-4 py-3 text-right">
          <button onclick="event.stopPropagation(); viewInvoiceDetail('${sale.sale_uuid}')" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <main class="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Sales</h1>
            <p class="text-sm text-gray-500 mt-1">View and manage your sales transactions</p>
          </div>
          <button onclick="createNewSale()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            New Sale
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Total Sales</div>
            <div class="text-2xl font-bold mt-1">${totalSales}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Total Revenue</div>
            <div class="text-2xl font-bold mt-1 text-green-600">₹${totalRevenue.toFixed(2)}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Total Tax</div>
            <div class="text-2xl font-bold mt-1">₹${totalTax.toFixed(2)}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Avg. Order Value</div>
            <div class="text-2xl font-bold mt-1">₹${avgOrderValue}</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="flex gap-3">
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="saleSearch" placeholder="Search by invoice number..." value="${salesState.searchTerm}" 
                onkeyup="handleSaleSearch(event)" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <select id="dateFilter" onchange="handleDateFilter(event)" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="all" ${salesState.dateFilter === 'all' ? 'selected' : ''}>All Dates</option>
              <option value="today" ${salesState.dateFilter === 'today' ? 'selected' : ''}>Today</option>
              <option value="week" ${salesState.dateFilter === 'week' ? 'selected' : ''}>This Week</option>
              <option value="month" ${salesState.dateFilter === 'month' ? 'selected' : ''}>This Month</option>
            </select>
            <button onclick="clearSaleFilters()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Clear</button>
          </div>
        </div>

        <!-- Sales Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Grand Total</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${tableRows || `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No sales found</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">Showing ${filteredSales.length} transactions</div>
          <div class="flex gap-2">
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg">1</button>
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
      
      ${salesState.isDetailOpen ? renderInvoiceModal(salesState.selectedSale || SALE_DETAIL_DATA) : ''}
    </main>
  `;
}

// Sales CRUD and filter functions
function viewInvoiceDetail(uuid) {
  // In real app, fetch detail by UUID. Using mock for demo
  salesState.selectedSale = SALE_DETAIL_DATA;
  salesState.selectedSale.invoice_number = salesState.sales.find(s => s.sale_uuid === uuid)?.invoice_number || 'INV-00014';
  salesState.isDetailOpen = true;
  refreshSalesUI();
}

function closeInvoiceModal() {
  salesState.isDetailOpen = false;
  salesState.selectedSale = null;
  refreshSalesUI();
}

function createNewSale() {
  alert('New sale form would open here (POS interface)');
}

function handleSaleSearch(event) {
  salesState.searchTerm = event.target.value;
  applySaleFilters();
  refreshSalesUI();
}

function handleDateFilter(event) {
  salesState.dateFilter = event.target.value;
  applySaleFilters();
  refreshSalesUI();
}

function clearSaleFilters() {
  salesState.searchTerm = '';
  salesState.dateFilter = 'all';
  document.getElementById('saleSearch').value = '';
  document.getElementById('dateFilter').value = 'all';
  applySaleFilters();
  refreshSalesUI();
}

function applySaleFilters() {
  let filtered = [...salesState.sales];

  // Search filter
  if (salesState.searchTerm) {
    const term = salesState.searchTerm.toLowerCase();
    filtered = filtered.filter(s => s.invoice_number.toLowerCase().includes(term));
  }

  // Date filter
  if (salesState.dateFilter !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    filtered = filtered.filter(s => {
      const saleDate = new Date(s.created_at);
      if (salesState.dateFilter === 'today') {
        return saleDate >= today;
      } else if (salesState.dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return saleDate >= weekAgo;
      } else if (salesState.dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return saleDate >= monthAgo;
      }
      return true;
    });
  }

  salesState.filteredSales = filtered;
}

function refreshSalesUI() {
  const app = document.getElementById('app');
  const mainContent = app.querySelector('.flex-1.flex.flex-col.overflow-hidden');
  if (mainContent) {
    const topBarHtml = mainContent.querySelector('header').outerHTML;
    mainContent.innerHTML = topBarHtml + renderSalesPage();
  }
}

// ----- CUSTOMERS PAGE COMPONENT (with CRUD and Ledger) -----

// Customers mock data
const CUSTOMERS_DATA = [
  {
    customer_uuid: "911811c0-6443-464c-9bc2-a3a9909ab2fb",
    tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
    name: "Raj",
    mobile: "9876543216",
    address: null,
    gstin: null,
    credit_balance: "81.25",
    created_at: "2026-04-13T14:58:39.000000Z",
    updated_at: "2026-04-13T15:19:16.000000Z"
  }
];

const LEDGER_DATA = [
  {
    id: 2,
    tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
    customer_uuid: "911811c0-6443-464c-9bc2-a3a9909ab2fb",
    type: "payment",
    amount: "50.00",
    reference_uuid: null,
    note: "Customer payment",
    created_at: "2026-04-13T15:10:51.000000Z",
    updated_at: "2026-04-13T15:10:51.000000Z",
    balance: -50
  }
];

// Customers state
let customersState = {
  customers: [...CUSTOMERS_DATA],
  filteredCustomers: [...CUSTOMERS_DATA],
  searchTerm: '',
  editingCustomer: null,
  isFormOpen: false,
  selectedCustomer: null,
  isLedgerOpen: false,
  ledgerData: [...LEDGER_DATA]
};

// Customer Form Modal
function renderCustomerFormModal(customer = null) {
  const isEditing = customer !== null;
  const modalTitle = isEditing ? 'Edit Customer' : 'Add New Customer';

  return `
    <div id="customerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) closeCustomerModal()">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">${modalTitle}</h2>
          <button onclick="closeCustomerModal()" class="p-1 hover:bg-gray-100 rounded-lg transition">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <form id="customerForm" onsubmit="handleCustomerSubmit(event, ${isEditing})" class="p-6 space-y-5">
          ${isEditing ? `<input type="hidden" id="customerUuid" value="${customer.customer_uuid}">` : ''}
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input type="text" id="customerName" value="${isEditing ? customer.name : ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
            <input type="tel" id="customerMobile" value="${isEditing ? customer.mobile : ''}" required pattern="[0-9]{10}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
            <input type="email" id="customerEmail" value="${isEditing && customer.email ? customer.email : ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">GSTIN (Optional)</label>
            <input type="text" id="customerGstin" value="${isEditing && customer.gstin ? customer.gstin : ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea id="customerAddress" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">${isEditing && customer.address ? customer.address : ''}</textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Opening Balance (₹)</label>
            <input type="number" step="0.01" id="customerBalance" value="${isEditing ? customer.credit_balance : '0.00'}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onclick="closeCustomerModal()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition">
              ${isEditing ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// Ledger Modal
function renderLedgerModal(customer) {
  const customerLedger = customersState.ledgerData.filter(l => l.customer_uuid === customer.customer_uuid);

  const ledgerRows = customerLedger.map(entry => {
    const entryDate = new Date(entry.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
    const isCredit = entry.type === 'payment';

    return `
      <tr class="border-b border-gray-100">
        <td class="py-3 px-4 text-sm">${entryDate}</td>
        <td class="py-3 px-4">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isCredit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
            ${entry.type}
          </span>
        </td>
        <td class="py-3 px-4 text-sm">${entry.note || '—'}</td>
        <td class="py-3 px-4 text-right ${isCredit ? 'text-green-600' : 'text-red-600'} font-medium">
          ${isCredit ? '+' : '-'}₹${parseFloat(entry.amount).toFixed(2)}
        </td>
        <td class="py-3 px-4 text-right font-medium">
          ₹${Math.abs(entry.balance).toFixed(2)} ${entry.balance < 0 ? 'Dr' : 'Cr'}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div id="ledgerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) closeLedgerModal()">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-800">Customer Ledger</h2>
              <p class="text-sm text-gray-600 mt-0.5">${customer.name} · ${customer.mobile}</p>
            </div>
            <div class="flex gap-3">
              <button onclick="addPayment('${customer.customer_uuid}')" class="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                Add Payment
              </button>
              <button onclick="closeLedgerModal()" class="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="p-6">
          <!-- Customer Summary -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <span class="text-xs text-gray-500 uppercase">Current Balance</span>
                <div class="text-2xl font-bold ${parseFloat(customer.credit_balance) >= 0 ? 'text-green-600' : 'text-red-600'}">
                  ₹${parseFloat(customer.credit_balance).toFixed(2)}
                </div>
              </div>
              <div>
                <span class="text-xs text-gray-500 uppercase">Total Purchases</span>
                <div class="text-xl font-semibold">₹0.00</div>
              </div>
              <div>
                <span class="text-xs text-gray-500 uppercase">Total Payments</span>
                <div class="text-xl font-semibold text-green-600">₹50.00</div>
              </div>
            </div>
          </div>
          
          <!-- Ledger Table -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                  <th class="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th class="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody>
                ${ledgerRows || `<tr><td colspan="5" class="py-8 text-center text-gray-500">No transactions found</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Customers page render function
function renderCustomersPage() {
  const { filteredCustomers } = customersState;

  // Calculate stats
  const totalCustomers = filteredCustomers.length;
  const totalCredit = filteredCustomers.reduce((sum, c) => sum + parseFloat(c.credit_balance), 0);
  const activeCustomers = filteredCustomers.filter(c => parseFloat(c.credit_balance) > 0).length;

  const tableRows = filteredCustomers.map(customer => {
    const joinDate = new Date(customer.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    return `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3">
          <div class="font-medium text-gray-900">${customer.name}</div>
          <div class="text-xs text-gray-500">${customer.mobile}</div>
        </td>
        <td class="px-4 py-3 text-sm text-gray-600">${customer.gstin || '—'}</td>
        <td class="px-4 py-3">
          <span class="font-medium ${parseFloat(customer.credit_balance) >= 0 ? 'text-green-600' : 'text-red-600'}">
            ₹${parseFloat(customer.credit_balance).toFixed(2)}
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-gray-500">${joinDate}</td>
        <td class="px-4 py-3 text-right">
          <button onclick="viewLedger('${customer.customer_uuid}')" class="text-indigo-600 hover:text-indigo-800 mr-3 text-sm font-medium">Ledger</button>
          <button onclick="openEditCustomer('${customer.customer_uuid}')" class="text-indigo-600 hover:text-indigo-800 mr-3 text-sm font-medium">Edit</button>
          <button onclick="deleteCustomer('${customer.customer_uuid}')" class="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <main class="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Customers</h1>
            <p class="text-sm text-gray-500 mt-1">Manage your customer database</p>
          </div>
          <button onclick="openAddCustomer()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Add Customer
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Total Customers</div>
            <div class="text-2xl font-bold mt-1">${totalCustomers}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Total Credit Balance</div>
            <div class="text-2xl font-bold mt-1 ${totalCredit >= 0 ? 'text-green-600' : 'text-red-600'}">₹${totalCredit.toFixed(2)}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Active with Credit</div>
            <div class="text-2xl font-bold mt-1">${activeCustomers}</div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="flex gap-3">
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="customerSearch" placeholder="Search by name or mobile..." value="${customersState.searchTerm}" 
                onkeyup="handleCustomerSearch(event)" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <button onclick="clearCustomerSearch()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Clear</button>
          </div>
        </div>

        <!-- Customers Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GSTIN</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${tableRows || `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No customers found</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">Showing ${filteredCustomers.length} customers</div>
          <div class="flex gap-2">
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg">1</button>
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
      
      ${customersState.isFormOpen ? renderCustomerFormModal(customersState.editingCustomer) : ''}
      ${customersState.isLedgerOpen && customersState.selectedCustomer ? renderLedgerModal(customersState.selectedCustomer) : ''}
    </main>
  `;
}

// Customer CRUD functions
function openAddCustomer() {
  customersState.editingCustomer = null;
  customersState.isFormOpen = true;
  refreshCustomersUI();
}

function openEditCustomer(uuid) {
  const customer = customersState.customers.find(c => c.customer_uuid === uuid);
  if (customer) {
    customersState.editingCustomer = customer;
    customersState.isFormOpen = true;
    refreshCustomersUI();
  }
}

function closeCustomerModal() {
  customersState.isFormOpen = false;
  customersState.editingCustomer = null;
  refreshCustomersUI();
}

function handleCustomerSubmit(event, isEditing) {
  event.preventDefault();

  const formData = {
    name: document.getElementById('customerName').value,
    mobile: document.getElementById('customerMobile').value,
    email: document.getElementById('customerEmail').value || null,
    gstin: document.getElementById('customerGstin').value || null,
    address: document.getElementById('customerAddress').value || null,
    credit_balance: document.getElementById('customerBalance').value || '0.00'
  };

  if (isEditing) {
    const uuid = document.getElementById('customerUuid').value;
    const index = customersState.customers.findIndex(c => c.customer_uuid === uuid);
    if (index !== -1) {
      customersState.customers[index] = {
        ...customersState.customers[index],
        ...formData,
        updated_at: new Date().toISOString()
      };
    }
  } else {
    const newCustomer = {
      customer_uuid: crypto.randomUUID ? crypto.randomUUID() : 'cust-' + Date.now(),
      tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    customersState.customers.push(newCustomer);
  }

  applyCustomerSearch();
  closeCustomerModal();
}

function deleteCustomer(uuid) {
  if (confirm('Are you sure you want to delete this customer?')) {
    customersState.customers = customersState.customers.filter(c => c.customer_uuid !== uuid);
    applyCustomerSearch();
    refreshCustomersUI();
  }
}

function viewLedger(uuid) {
  const customer = customersState.customers.find(c => c.customer_uuid === uuid);
  if (customer) {
    customersState.selectedCustomer = customer;
    customersState.isLedgerOpen = true;
    refreshCustomersUI();
  }
}

function closeLedgerModal() {
  customersState.isLedgerOpen = false;
  customersState.selectedCustomer = null;
  refreshCustomersUI();
}

function addPayment(uuid) {
  const amount = prompt('Enter payment amount:');
  if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
    const customer = customersState.customers.find(c => c.customer_uuid === uuid);
    if (customer) {
      // Update customer balance
      customer.credit_balance = (parseFloat(customer.credit_balance) - parseFloat(amount)).toFixed(2);

      // Add ledger entry
      customersState.ledgerData.push({
        id: Date.now(),
        tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
        customer_uuid: uuid,
        type: "payment",
        amount: amount,
        reference_uuid: null,
        note: "Manual payment",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        balance: -parseFloat(customer.credit_balance)
      });

      applyCustomerSearch();
      closeLedgerModal();
    }
  }
}

function handleCustomerSearch(event) {
  customersState.searchTerm = event.target.value;
  applyCustomerSearch();
  refreshCustomersUI();
}

function clearCustomerSearch() {
  customersState.searchTerm = '';
  document.getElementById('customerSearch').value = '';
  applyCustomerSearch();
  refreshCustomersUI();
}

function applyCustomerSearch() {
  const term = customersState.searchTerm.toLowerCase();
  if (!term) {
    customersState.filteredCustomers = [...customersState.customers];
  } else {
    customersState.filteredCustomers = customersState.customers.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.mobile.includes(term)
    );
  }
}

function refreshCustomersUI() {
  const app = document.getElementById('app');
  const mainContent = app.querySelector('.flex-1.flex.flex-col.overflow-hidden');
  if (mainContent) {
    const topBarHtml = mainContent.querySelector('header').outerHTML;
    mainContent.innerHTML = topBarHtml + renderCustomersPage();
  }
}

// Export for router
window.openAddCustomer = openAddCustomer;
window.openEditCustomer = openEditCustomer;
window.closeCustomerModal = closeCustomerModal;
window.handleCustomerSubmit = handleCustomerSubmit;
window.deleteCustomer = deleteCustomer;
window.viewLedger = viewLedger;
window.closeLedgerModal = closeLedgerModal;
window.addPayment = addPayment;
window.handleCustomerSearch = handleCustomerSearch;
window.clearCustomerSearch = clearCustomerSearch;

// Export for router
window.viewInvoiceDetail = viewInvoiceDetail;
window.closeInvoiceModal = closeInvoiceModal;
window.createNewSale = createNewSale;
window.handleSaleSearch = handleSaleSearch;
window.handleDateFilter = handleDateFilter;
window.clearSaleFilters = clearSaleFilters;


// ----- PURCHASE HISTORY PAGE COMPONENT -----

// Purchase History state
let purchaseHistoryState = {
  purchases: [...PURCHASES_DATA],
  filteredPurchases: [...PURCHASES_DATA],
  searchTerm: '',
  dateFilter: 'all',
  supplierFilter: 'all',
  selectedPurchase: null,
  isDetailOpen: false
};

// Purchase History page render function
function renderPurchaseHistoryPage() {
  const { filteredPurchases } = purchaseHistoryState;

  // Calculate statistics
  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + parseFloat(p.total), 0);
  const totalOrders = filteredPurchases.length;
  const totalItems = filteredPurchases.reduce((sum, p) => sum + p.items.length, 0);
  const avgOrderValue = totalOrders > 0 ? totalPurchases / totalOrders : 0;

  // Get unique suppliers for filter
  const suppliers = [...new Set(purchasesState.purchases.map(p => p.supplier.name))];

  // Group purchases by month for chart
  const monthlyData = groupPurchasesByMonth(filteredPurchases);

  const tableRows = filteredPurchases.map(purchase => {
    const purchaseDate = new Date(purchase.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    const itemCount = purchase.items.length;
    const itemSummary = purchase.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ');

    return `
      <tr class="hover:bg-gray-50 cursor-pointer" onclick="viewPurchaseHistoryDetail('${purchase.purchase_uuid}')">
        <td class="px-4 py-3">
          <div class="font-medium text-gray-900">${purchaseDate}</div>
          <div class="text-xs text-gray-500">${purchase.invoice_number || 'No Invoice'}</div>
        </td>
        <td class="px-4 py-3">
          <div class="font-medium text-gray-900">${purchase.supplier.name}</div>
          <div class="text-xs text-gray-500">${purchase.supplier.phone}</div>
        </td>
        <td class="px-4 py-3">
          <div class="text-sm text-gray-700 max-w-xs truncate" title="${itemSummary.replace(/,/g, '\n')}">
            ${itemSummary}
          </div>
          <div class="text-xs text-gray-500">${itemCount} item${itemCount !== 1 ? 's' : ''}</div>
        </td>
        <td class="px-4 py-3 text-right font-semibold">₹${purchase.total}</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${purchase.payment_status === 'paid' ? 'bg-green-100 text-green-700' : purchase.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}">
            ${purchase.payment_status ? purchase.payment_status.replace('_', ' ') : 'Pending'}
          </span>
        </td>
        <td class="px-4 py-3 text-right" onclick="event.stopPropagation()">
          <button onclick="viewPurchaseHistoryDetail('${purchase.purchase_uuid}')" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View Details
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <main class="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Purchase History</h1>
            <p class="text-sm text-gray-500 mt-1">Complete record of all purchase transactions</p>
          </div>
          <div class="flex gap-3">
            <button onclick="exportPurchaseHistory()" class="px-4 py-2 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Export
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-xl shadow-sm text-white">
            <div class="text-blue-100 text-sm font-medium">Total Spent</div>
            <div class="text-3xl font-bold mt-2">₹${totalPurchases.toFixed(2)}</div>
            <div class="text-blue-100 text-sm mt-2">All time purchases</div>
          </div>
          
          <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-gray-500 text-sm font-medium">Total Orders</div>
                <div class="text-3xl font-bold mt-1">${totalOrders}</div>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z"/></svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-gray-500 text-sm font-medium">Items Purchased</div>
                <div class="text-3xl font-bold mt-1">${totalItems}</div>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-gray-500 text-sm font-medium">Average Order</div>
                <div class="text-3xl font-bold mt-1">₹${avgOrderValue.toFixed(2)}</div>
              </div>
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 class="font-semibold text-gray-800 mb-4">Monthly Purchase Trend</h3>
            <canvas id="monthlyPurchaseChart" height="200"></canvas>
          </div>
          <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 class="font-semibold text-gray-800 mb-4">Top Suppliers</h3>
            <div id="topSuppliersList" class="space-y-3">
              ${getTopSuppliers(filteredPurchases).map((s, i) => `
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-medium text-gray-500 w-6">#${i + 1}</span>
                    <div>
                      <span class="text-sm font-medium">${s.name}</span>
                      <p class="text-xs text-gray-500">${s.orders} orders</p>
                    </div>
                  </div>
                  <span class="text-sm font-semibold">₹${s.total.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="historySearch" placeholder="Search..." value="${purchaseHistoryState.searchTerm}" 
                onkeyup="handleHistorySearch(event)" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            </div>
            
            <select id="historyDateFilter" onchange="handleHistoryDateFilter(event)" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="all" ${purchaseHistoryState.dateFilter === 'all' ? 'selected' : ''}>All Dates</option>
              <option value="today" ${purchaseHistoryState.dateFilter === 'today' ? 'selected' : ''}>Today</option>
              <option value="week" ${purchaseHistoryState.dateFilter === 'week' ? 'selected' : ''}>This Week</option>
              <option value="month" ${purchaseHistoryState.dateFilter === 'month' ? 'selected' : ''}>This Month</option>
              <option value="year" ${purchaseHistoryState.dateFilter === 'year' ? 'selected' : ''}>This Year</option>
            </select>
            
            <select id="historySupplierFilter" onchange="handleHistorySupplierFilter(event)" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="all" ${purchaseHistoryState.supplierFilter === 'all' ? 'selected' : ''}>All Suppliers</option>
              ${suppliers.map(s => `<option value="${s}" ${purchaseHistoryState.supplierFilter === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
            
            <button onclick="clearHistoryFilters()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Clear Filters</button>
          </div>
        </div>

        <!-- Purchase History Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${tableRows || `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No purchase history found</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Summary by Supplier -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800">Supplier Summary</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th class="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th class="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  <th class="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Last Order</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${getSupplierSummary(filteredPurchases).map(s => `
                  <tr>
                    <td class="py-3 px-4 font-medium">${s.name}</td>
                    <td class="py-3 px-4 text-center">${s.orders}</td>
                    <td class="py-3 px-4 text-right font-semibold">₹${s.total.toFixed(2)}</td>
                    <td class="py-3 px-4 text-right text-gray-500">${s.lastOrder}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">Showing ${filteredPurchases.length} transactions</div>
          <div class="flex gap-2">
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg">1</button>
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
      
      ${purchaseHistoryState.isDetailOpen && purchaseHistoryState.selectedPurchase ? renderPurchaseDetailModal(purchaseHistoryState.selectedPurchase) : ''}
    </main>
  `;
}

// Helper functions
function groupPurchasesByMonth(purchases) {
  const monthly = {};
  purchases.forEach(p => {
    const date = new Date(p.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthly[monthKey]) {
      monthly[monthKey] = 0;
    }
    monthly[monthKey] += parseFloat(p.total);
  });

  return Object.entries(monthly)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);
}

function getTopSuppliers(purchases) {
  const supplierTotals = {};
  purchases.forEach(p => {
    const name = p.supplier.name;
    if (!supplierTotals[name]) {
      supplierTotals[name] = { total: 0, orders: 0 };
    }
    supplierTotals[name].total += parseFloat(p.total);
    supplierTotals[name].orders += 1;
  });

  return Object.entries(supplierTotals)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

function getSupplierSummary(purchases) {
  const summary = {};
  purchases.forEach(p => {
    const name = p.supplier.name;
    if (!summary[name]) {
      summary[name] = {
        total: 0,
        orders: 0,
        lastOrder: p.created_at
      };
    }
    summary[name].total += parseFloat(p.total);
    summary[name].orders += 1;

    if (new Date(p.created_at) > new Date(summary[name].lastOrder)) {
      summary[name].lastOrder = p.created_at;
    }
  });

  return Object.entries(summary)
    .map(([name, data]) => ({
      name,
      total: data.total,
      orders: data.orders,
      lastOrder: new Date(data.lastOrder).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }))
    .sort((a, b) => b.total - a.total);
}

// Purchase History functions
function viewPurchaseHistoryDetail(uuid) {
  const purchase = purchaseHistoryState.purchases.find(p => p.purchase_uuid === uuid);
  if (purchase) {
    purchaseHistoryState.selectedPurchase = purchase;
    purchaseHistoryState.isDetailOpen = true;
    refreshPurchaseHistoryUI();
  }
}

function closePurchaseHistoryDetailModal() {
  purchaseHistoryState.isDetailOpen = false;
  purchaseHistoryState.selectedPurchase = null;
  refreshPurchaseHistoryUI();
}

function handleHistorySearch(event) {
  purchaseHistoryState.searchTerm = event.target.value;
  applyHistoryFilters();
  refreshPurchaseHistoryUI();
  setTimeout(() => initHistoryCharts(), 100);
}

function handleHistoryDateFilter(event) {
  purchaseHistoryState.dateFilter = event.target.value;
  applyHistoryFilters();
  refreshPurchaseHistoryUI();
  setTimeout(() => initHistoryCharts(), 100);
}

function handleHistorySupplierFilter(event) {
  purchaseHistoryState.supplierFilter = event.target.value;
  applyHistoryFilters();
  refreshPurchaseHistoryUI();
  setTimeout(() => initHistoryCharts(), 100);
}

function clearHistoryFilters() {
  purchaseHistoryState.searchTerm = '';
  purchaseHistoryState.dateFilter = 'all';
  purchaseHistoryState.supplierFilter = 'all';
  document.getElementById('historySearch').value = '';
  document.getElementById('historyDateFilter').value = 'all';
  document.getElementById('historySupplierFilter').value = 'all';
  applyHistoryFilters();
  refreshPurchaseHistoryUI();
  setTimeout(() => initHistoryCharts(), 100);
}

function applyHistoryFilters() {
  let filtered = [...purchaseHistoryState.purchases];

  // Search filter
  if (purchaseHistoryState.searchTerm) {
    const term = purchaseHistoryState.searchTerm.toLowerCase();
    filtered = filtered.filter(p =>
      p.supplier.name.toLowerCase().includes(term) ||
      (p.invoice_number && p.invoice_number.toLowerCase().includes(term)) ||
      p.items.some(i => i.product.name.toLowerCase().includes(term))
    );
  }

  // Date filter
  if (purchaseHistoryState.dateFilter !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    filtered = filtered.filter(p => {
      const purchaseDate = new Date(p.created_at);
      if (purchaseHistoryState.dateFilter === 'today') {
        return purchaseDate >= today;
      } else if (purchaseHistoryState.dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return purchaseDate >= weekAgo;
      } else if (purchaseHistoryState.dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return purchaseDate >= monthAgo;
      } else if (purchaseHistoryState.dateFilter === 'year') {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return purchaseDate >= yearAgo;
      }
      return true;
    });
  }

  // Supplier filter
  if (purchaseHistoryState.supplierFilter !== 'all') {
    filtered = filtered.filter(p => p.supplier.name === purchaseHistoryState.supplierFilter);
  }

  purchaseHistoryState.filteredPurchases = filtered;
}

function exportPurchaseHistory() {
  const csv = ['Date,Invoice,Supplier,Items,Total,Status'];
  purchaseHistoryState.filteredPurchases.forEach(p => {
    const date = new Date(p.created_at).toLocaleDateString();
    const items = p.items.map(i => `${i.quantity}x ${i.product.name}`).join('; ');
    csv.push(`"${date}","${p.invoice_number || ''}","${p.supplier.name}","${items}","${p.total}","${p.payment_status || 'pending'}"`);
  });

  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `purchase-history-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function initHistoryCharts() {
  // Monthly purchase trend chart
  const monthlyCtx = document.getElementById('monthlyPurchaseChart')?.getContext('2d');
  if (monthlyCtx) {
    const monthlyData = groupPurchasesByMonth(purchaseHistoryState.filteredPurchases);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    new Chart(monthlyCtx, {
      type: 'bar',
      data: {
        labels: monthlyData.map(([key]) => {
          const [year, month] = key.split('-');
          return monthNames[parseInt(month) - 1] + ' ' + year.slice(2);
        }),
        datasets: [{
          label: 'Purchase Amount (₹)',
          data: monthlyData.map(([, total]) => total),
          backgroundColor: '#4f46e5',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

function refreshPurchaseHistoryUI() {
  const app = document.getElementById('app');
  const mainContent = app.querySelector('.flex-1.flex.flex-col.overflow-hidden');
  if (mainContent) {
    const topBarHtml = mainContent.querySelector('header').outerHTML;
    mainContent.innerHTML = topBarHtml + renderPurchaseHistoryPage();
    setTimeout(() => initHistoryCharts(), 100);
  }
}

// Export for router
window.viewPurchaseHistoryDetail = viewPurchaseHistoryDetail;
window.closePurchaseHistoryDetailModal = closePurchaseHistoryDetailModal;
window.handleHistorySearch = handleHistorySearch;
window.handleHistoryDateFilter = handleHistoryDateFilter;
window.handleHistorySupplierFilter = handleHistorySupplierFilter;
window.clearHistoryFilters = clearHistoryFilters;
window.exportPurchaseHistory = exportPurchaseHistory;

// ----- STAFF PAGE COMPONENT (with CRUD) -----

// Staff mock data
const STAFF_DATA = [
  {
    user_uuid: "e596d661-7035-4243-9edc-6c0485c283c6",
    tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
    name: "Manager 1",
    email: "manager@test.com",
    role: "manager",
    created_at: "2026-04-12T00:00:32.000000Z",
    updated_at: "2026-04-12T00:00:32.000000Z"
  },
  {
    user_uuid: "ece598dd-0f8c-40a3-9cdb-4b2231ade3bb",
    tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
    name: "Cashier 1",
    email: "cashier@test.com",
    role: "cashier",
    created_at: "2026-04-12T00:00:46.000000Z",
    updated_at: "2026-04-12T00:00:46.000000Z"
  }
];

// Staff state
let staffState = {
  staff: [...STAFF_DATA],
  filteredStaff: [...STAFF_DATA],
  searchTerm: '',
  roleFilter: 'all',
  editingStaff: null,
  isFormOpen: false,
  selectedStaff: null,
  isDetailOpen: false
};

// Role options with permissions
const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner', color: 'purple', permissions: ['all'] },
  { value: 'manager', label: 'Manager', color: 'blue', permissions: ['manage_products', 'manage_staff', 'view_reports', 'manage_purchases'] },
  { value: 'cashier', label: 'Cashier', color: 'green', permissions: ['process_sales', 'view_products', 'manage_customers'] },
  { value: 'staff', label: 'Staff', color: 'gray', permissions: ['view_products', 'manage_stock'] }
];

// Staff Form Modal
function renderStaffFormModal(staff = null) {
  const isEditing = staff !== null;
  const modalTitle = isEditing ? 'Edit Staff Member' : 'Add New Staff';

  return `
    <div id="staffModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) closeStaffModal()">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">${modalTitle}</h2>
          <button onclick="closeStaffModal()" class="p-1 hover:bg-gray-100 rounded-lg transition">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <form id="staffForm" onsubmit="handleStaffSubmit(event, ${isEditing})" class="p-6 space-y-5">
          ${isEditing ? `<input type="hidden" id="staffUuid" value="${staff.user_uuid}">` : ''}
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input type="text" id="staffName" value="${isEditing ? staff.name : ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input type="email" id="staffEmail" value="${isEditing ? staff.email : ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          ${!isEditing ? `
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input type="password" id="staffPassword" required minlength="6" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>
          ` : ''}
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select id="staffRole" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" onchange="updatePermissionPreview()">
              ${ROLE_OPTIONS.map(r => `<option value="${r.value}" ${isEditing && staff.role === r.value ? 'selected' : ''}>${r.label}</option>`).join('')}
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
            <input type="tel" id="staffPhone" value="${isEditing && staff.phone ? staff.phone : ''}" pattern="[0-9]{10}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <div id="permissionPreview" class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
            <div id="permissionList" class="space-y-1">
              ${getPermissionList(isEditing ? staff.role : 'staff')}
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <input type="checkbox" id="staffActive" ${isEditing && staff.is_active !== false ? 'checked' : 'checked'} class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500">
            <label for="staffActive" class="text-sm text-gray-700">Active Account</label>
          </div>
          
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onclick="closeStaffModal()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition">
              ${isEditing ? 'Update Staff' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function getPermissionList(role) {
  const roleData = ROLE_OPTIONS.find(r => r.value === role);
  const permissions = roleData?.permissions || [];

  const permissionLabels = {
    'all': 'Full Access',
    'manage_products': 'Manage Products',
    'manage_staff': 'Manage Staff',
    'view_reports': 'View Reports',
    'manage_purchases': 'Manage Purchases',
    'process_sales': 'Process Sales',
    'view_products': 'View Products',
    'manage_customers': 'Manage Customers',
    'manage_stock': 'Manage Stock'
  };

  if (permissions.includes('all')) {
    return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Full System Access</span>';
  }

  return permissions.map(p => `
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      <span class="text-sm text-gray-600">${permissionLabels[p] || p}</span>
    </div>
  `).join('');
}

function updatePermissionPreview() {
  const roleSelect = document.getElementById('staffRole');
  const permissionList = document.getElementById('permissionList');
  if (roleSelect && permissionList) {
    permissionList.innerHTML = getPermissionList(roleSelect.value);
  }
}

// Staff Detail Modal
function renderStaffDetailModal(staff) {
  const joinDate = new Date(staff.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const roleData = ROLE_OPTIONS.find(r => r.value === staff.role);
  const roleColor = {
    'purple': 'bg-purple-100 text-purple-700',
    'blue': 'bg-blue-100 text-blue-700',
    'green': 'bg-green-100 text-green-700',
    'gray': 'bg-gray-100 text-gray-700'
  }[roleData?.color] || 'bg-gray-100 text-gray-700';

  return `
    <div id="staffDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) closeStaffDetailModal()">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Staff Details</h2>
            <p class="text-sm text-gray-500 mt-0.5">Member since ${joinDate}</p>
          </div>
          <button onclick="closeStaffDetailModal()" class="p-1 hover:bg-gray-100 rounded-lg transition">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Profile Header -->
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
              ${staff.name.charAt(0)}
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">${staff.name}</h3>
              <p class="text-gray-600">${staff.email}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColor}">${roleData?.label || staff.role}</span>
                <span class="text-xs ${staff.is_active !== false ? 'text-green-600' : 'text-red-600'}">● ${staff.is_active !== false ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>
          
          <!-- Contact Info -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-3">Contact Information</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-500 uppercase">Email</span>
                <p class="font-medium">${staff.email}</p>
              </div>
              <div>
                <span class="text-xs text-gray-500 uppercase">Phone</span>
                <p class="font-medium">${staff.phone || '—'}</p>
              </div>
            </div>
          </div>
          
          <!-- Permissions -->
          <div>
            <h4 class="font-medium text-gray-800 mb-3">Permissions & Access</h4>
            <div class="bg-gray-50 rounded-lg p-4">
              ${getPermissionList(staff.role)}
            </div>
          </div>
          
          <!-- Recent Activity (placeholder) -->
          <div>
            <h4 class="font-medium text-gray-800 mb-3">Recent Activity</h4>
            <div class="border border-gray-200 rounded-lg divide-y">
              <div class="p-3 text-sm text-gray-600">
                <span class="font-medium">Account created</span>
                <span class="text-gray-400 ml-2">${joinDate}</span>
              </div>
              <div class="p-3 text-sm text-gray-400 text-center">
                No recent activity
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onclick="openEditStaff('${staff.user_uuid}'); closeStaffDetailModal()" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Edit Staff
            </button>
            <button onclick="resetStaffPassword('${staff.user_uuid}')" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Staff page render function
function renderStaffPage() {
  const { filteredStaff } = staffState;

  // Calculate stats
  const totalStaff = filteredStaff.length;
  const activeStaff = filteredStaff.filter(s => s.is_active !== false).length;
  const roleCounts = {};
  filteredStaff.forEach(s => { roleCounts[s.role] = (roleCounts[s.role] || 0) + 1; });

  const tableRows = filteredStaff.map(staff => {
    const joinDate = new Date(staff.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    const roleData = ROLE_OPTIONS.find(r => r.value === staff.role);
    const roleColor = {
      'purple': 'bg-purple-100 text-purple-700',
      'blue': 'bg-blue-100 text-blue-700',
      'green': 'bg-green-100 text-green-700',
      'gray': 'bg-gray-100 text-gray-700'
    }[roleData?.color] || 'bg-gray-100 text-gray-700';

    return `
      <tr class="hover:bg-gray-50 cursor-pointer" onclick="viewStaffDetail('${staff.user_uuid}')">
        <td class="px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
              ${staff.name.charAt(0)}
            </div>
            <div>
              <div class="font-medium text-gray-900">${staff.name}</div>
              <div class="text-xs text-gray-500">${staff.email}</div>
            </div>
          </div>
        </td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColor}">${roleData?.label || staff.role}</span>
        </td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center gap-1 text-xs ${staff.is_active !== false ? 'text-green-600' : 'text-red-600'}">
            <span class="w-1.5 h-1.5 rounded-full ${staff.is_active !== false ? 'bg-green-500' : 'bg-red-500'}"></span>
            ${staff.is_active !== false ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-gray-500">${joinDate}</td>
        <td class="px-4 py-3 text-right" onclick="event.stopPropagation()">
          <button onclick="openEditStaff('${staff.user_uuid}')" class="text-indigo-600 hover:text-indigo-800 mr-3 text-sm font-medium">Edit</button>
          <button onclick="deleteStaff('${staff.user_uuid}')" class="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <main class="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Staff Management</h1>
            <p class="text-sm text-gray-500 mt-1">Manage your team members and their permissions</p>
          </div>
          <button onclick="openAddStaff()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Add Staff
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Total Staff</div>
            <div class="text-2xl font-bold mt-1">${totalStaff}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Active Staff</div>
            <div class="text-2xl font-bold mt-1 text-green-600">${activeStaff}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Managers</div>
            <div class="text-2xl font-bold mt-1">${roleCounts['manager'] || 0}</div>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="text-gray-500 text-xs uppercase tracking-wider">Cashiers</div>
            <div class="text-2xl font-bold mt-1">${roleCounts['cashier'] || 0}</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="flex gap-3">
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="staffSearch" placeholder="Search by name or email..." value="${staffState.searchTerm}" 
                onkeyup="handleStaffSearch(event)" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <select id="staffRoleFilter" onchange="handleStaffRoleFilter(event)" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="all" ${staffState.roleFilter === 'all' ? 'selected' : ''}>All Roles</option>
              ${ROLE_OPTIONS.map(r => `<option value="${r.value}" ${staffState.roleFilter === r.value ? 'selected' : ''}>${r.label}</option>`).join('')}
            </select>
            <button onclick="clearStaffFilters()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Clear</button>
          </div>
        </div>

        <!-- Staff Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${tableRows || `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No staff members found</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Role Summary -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800">Role Permissions Summary</h3>
          </div>
          <div class="p-5">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              ${ROLE_OPTIONS.map(role => `
                <div class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.color === 'purple' ? 'bg-purple-100 text-purple-700' : role.color === 'blue' ? 'bg-blue-100 text-blue-700' : role.color === 'green' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">${role.label}</span>
                    <span class="text-xs text-gray-500">${roleCounts[role.value] || 0} members</span>
                  </div>
                  <div class="text-xs text-gray-600">
                    ${role.permissions.includes('all') ? 'Full system access' : `${role.permissions.length} permissions`}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">Showing ${filteredStaff.length} staff members</div>
          <div class="flex gap-2">
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg">1</button>
            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
      
      ${staffState.isFormOpen ? renderStaffFormModal(staffState.editingStaff) : ''}
      ${staffState.isDetailOpen && staffState.selectedStaff ? renderStaffDetailModal(staffState.selectedStaff) : ''}
    </main>
  `;
}

// Staff CRUD functions
function openAddStaff() {
  staffState.editingStaff = null;
  staffState.isFormOpen = true;
  refreshStaffUI();
  setTimeout(() => {
    const roleSelect = document.getElementById('staffRole');
    if (roleSelect) updatePermissionPreview();
  }, 100);
}

function openEditStaff(uuid) {
  const staff = staffState.staff.find(s => s.user_uuid === uuid);
  if (staff) {
    staffState.editingStaff = staff;
    staffState.isFormOpen = true;
    refreshStaffUI();
    setTimeout(() => {
      const roleSelect = document.getElementById('staffRole');
      if (roleSelect) updatePermissionPreview();
    }, 100);
  }
}

function closeStaffModal() {
  staffState.isFormOpen = false;
  staffState.editingStaff = null;
  refreshStaffUI();
}

function handleStaffSubmit(event, isEditing) {
  event.preventDefault();

  const formData = {
    name: document.getElementById('staffName').value,
    email: document.getElementById('staffEmail').value,
    role: document.getElementById('staffRole').value,
    phone: document.getElementById('staffPhone').value || null,
    is_active: document.getElementById('staffActive').checked
  };

  if (!isEditing) {
    formData.password = document.getElementById('staffPassword').value;
  }

  if (isEditing) {
    const uuid = document.getElementById('staffUuid').value;
    const index = staffState.staff.findIndex(s => s.user_uuid === uuid);
    if (index !== -1) {
      staffState.staff[index] = {
        ...staffState.staff[index],
        ...formData,
        updated_at: new Date().toISOString()
      };
    }
  } else {
    const newStaff = {
      user_uuid: crypto.randomUUID ? crypto.randomUUID() : 'staff-' + Date.now(),
      tenant_uuid: "f145d711-6b9a-432f-8217-c375dd5ff73d",
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    staffState.staff.push(newStaff);
  }

  applyStaffSearch();
  closeStaffModal();
}

function deleteStaff(uuid) {
  const staff = staffState.staff.find(s => s.user_uuid === uuid);
  if (staff && staff.role === 'owner') {
    alert('Cannot delete the owner account.');
    return;
  }

  if (confirm('Are you sure you want to remove this staff member?')) {
    staffState.staff = staffState.staff.filter(s => s.user_uuid !== uuid);
    applyStaffSearch();
    refreshStaffUI();
  }
}

function viewStaffDetail(uuid) {
  const staff = staffState.staff.find(s => s.user_uuid === uuid);
  if (staff) {
    staffState.selectedStaff = staff;
    staffState.isDetailOpen = true;
    refreshStaffUI();
  }
}

function closeStaffDetailModal() {
  staffState.isDetailOpen = false;
  staffState.selectedStaff = null;
  refreshStaffUI();
}

function resetStaffPassword(uuid) {
  const newPassword = prompt('Enter new password (minimum 6 characters):');
  if (newPassword && newPassword.length >= 6) {
    alert(`Password reset successful for staff member.`);
    closeStaffDetailModal();
  } else if (newPassword) {
    alert('Password must be at least 6 characters long.');
  }
}

function handleStaffSearch(event) {
  staffState.searchTerm = event.target.value;
  applyStaffSearch();
  refreshStaffUI();
}

function handleStaffRoleFilter(event) {
  staffState.roleFilter = event.target.value;
  applyStaffSearch();
  refreshStaffUI();
}

function clearStaffFilters() {
  staffState.searchTerm = '';
  staffState.roleFilter = 'all';
  document.getElementById('staffSearch').value = '';
  document.getElementById('staffRoleFilter').value = 'all';
  applyStaffSearch();
  refreshStaffUI();
}

function applyStaffSearch() {
  let filtered = [...staffState.staff];

  // Search filter
  if (staffState.searchTerm) {
    const term = staffState.searchTerm.toLowerCase();
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  }

  // Role filter
  if (staffState.roleFilter !== 'all') {
    filtered = filtered.filter(s => s.role === staffState.roleFilter);
  }

  staffState.filteredStaff = filtered;
}

function refreshStaffUI() {
  const app = document.getElementById('app');
  const mainContent = app.querySelector('.flex-1.flex.flex-col.overflow-hidden');
  if (mainContent) {
    const topBarHtml = mainContent.querySelector('header').outerHTML;
    mainContent.innerHTML = topBarHtml + renderStaffPage();
  }
}

// Export for router
window.openAddStaff = openAddStaff;
window.openEditStaff = openEditStaff;
window.closeStaffModal = closeStaffModal;
window.handleStaffSubmit = handleStaffSubmit;
window.deleteStaff = deleteStaff;
window.viewStaffDetail = viewStaffDetail;
window.closeStaffDetailModal = closeStaffDetailModal;
window.resetStaffPassword = resetStaffPassword;
window.updatePermissionPreview = updatePermissionPreview;
window.handleStaffSearch = handleStaffSearch;
window.handleStaffRoleFilter = handleStaffRoleFilter;
window.clearStaffFilters = clearStaffFilters;


// ----- SETTINGS PAGE COMPONENT (with CRUD) -----

// Settings mock data
const SETTINGS_DATA = {
  shop_name: 'Stockify Retail Store',
  mobile: '9876543210',
  email: 'contact@stockify.com',
  address: '123 Main Street, Chennai, Tamil Nadu - 600001',
  gstin: '33ABCDE1234F1Z5',
  invoice_prefix: 'INV',
  currency: '₹',
  timezone: 'Asia/Kolkata',
  date_format: 'DD/MM/YYYY',
  low_stock_threshold: 50,
  enable_gst: true,
  enable_loyalty: false,
  loyalty_points_rate: 1,
  footer_note: 'Thank you for your business!'
};

// Settings state
let settingsState = {
  settings: { ...SETTINGS_DATA },
  originalSettings: { ...SETTINGS_DATA },
  activeTab: 'general',
  hasChanges: false,
  isSaving: false
};

// Settings page render function
function renderSettingsPage() {
  const { settings, activeTab, hasChanges } = settingsState;

  return `
    <main class="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div class="max-w-5xl mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Settings</h1>
            <p class="text-sm text-gray-500 mt-1">Manage your store preferences and configurations</p>
          </div>
          <div class="flex gap-3">
            ${hasChanges ? `
              <button onclick="resetSettings()" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onclick="saveSettings()" class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Save Changes
              </button>
            ` : `
              <span class="text-sm text-green-600 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                All changes saved
              </span>
            `}
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="border-b border-gray-200">
            <nav class="flex gap-1 px-4">
              <button onclick="switchSettingsTab('general')" class="px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
                General
              </button>
              <button onclick="switchSettingsTab('invoice')" class="px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'invoice' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Invoice
              </button>
              <button onclick="switchSettingsTab('tax')" class="px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'tax' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
                Tax & GST
              </button>
              <button onclick="switchSettingsTab('notifications')" class="px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'notifications' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                Notifications
              </button>
              <button onclick="switchSettingsTab('advanced')" class="px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'advanced' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                Advanced
              </button>
            </nav>
          </div>

          <!-- Settings Forms -->
          <div class="p-6">
            ${activeTab === 'general' ? renderGeneralSettings(settings) : ''}
            ${activeTab === 'invoice' ? renderInvoiceSettings(settings) : ''}
            ${activeTab === 'tax' ? renderTaxSettings(settings) : ''}
            ${activeTab === 'notifications' ? renderNotificationSettings(settings) : ''}
            ${activeTab === 'advanced' ? renderAdvancedSettings(settings) : ''}
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-red-200 bg-red-50">
            <h3 class="font-semibold text-red-800 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              Danger Zone
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium text-gray-800">Reset all settings</h4>
                <p class="text-sm text-gray-500">Restore all settings to their default values</p>
              </div>
              <button onclick="resetAllSettings()" class="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition">
                Reset to Defaults
              </button>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <h4 class="font-medium text-gray-800">Delete store data</h4>
                <p class="text-sm text-gray-500">Permanently delete all store data. This action cannot be undone.</p>
              </div>
              <button onclick="deleteStoreData()" class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                Delete Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;
}

function renderGeneralSettings(settings) {
  return `
    <form onsubmit="return false" onchange="markSettingsChanged()" class="space-y-6">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Shop Name *</label>
          <input type="text" id="shopName" value="${settings.shop_name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
          <input type="tel" id="shopMobile" value="${settings.mobile}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
        <input type="email" id="shopEmail" value="${settings.email || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <textarea id="shopAddress" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">${settings.address || ''}</textarea>
      </div>
      
      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select id="currency" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option value="₹" ${settings.currency === '₹' ? 'selected' : ''}>₹ (INR)</option>
            <option value="$" ${settings.currency === '$' ? 'selected' : ''}>$ (USD)</option>
            <option value="€" ${settings.currency === '€' ? 'selected' : ''}>€ (EUR)</option>
            <option value="£" ${settings.currency === '£' ? 'selected' : ''}>£ (GBP)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select id="timezone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option value="Asia/Kolkata" ${settings.timezone === 'Asia/Kolkata' ? 'selected' : ''}>Asia/Kolkata (IST)</option>
            <option value="America/New_York" ${settings.timezone === 'America/New_York' ? 'selected' : ''}>America/New_York (EST)</option>
            <option value="Europe/London" ${settings.timezone === 'Europe/London' ? 'selected' : ''}>Europe/London (GMT)</option>
          </select>
        </div>
      </div>
    </form>
  `;
}

function renderInvoiceSettings(settings) {
  return `
    <form onsubmit="return false" onchange="markSettingsChanged()" class="space-y-6">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Invoice Prefix</label>
          <input type="text" id="invoicePrefix" value="${settings.invoice_prefix}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
          <p class="text-xs text-gray-500 mt-1">e.g., INV will generate INV-00001</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Next Invoice Number</label>
          <input type="number" id="nextInvoiceNumber" value="15" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Footer Note</label>
        <textarea id="footerNote" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">${settings.footer_note || ''}</textarea>
        <p class="text-xs text-gray-500 mt-1">This text will appear at the bottom of all invoices</p>
      </div>
      
      <div class="border-t border-gray-200 pt-4">
        <h4 class="font-medium text-gray-800 mb-3">Invoice Preview</h4>
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div class="text-center">
            <p class="font-bold text-lg">${settings.shop_name}</p>
            <p class="text-sm text-gray-600">${settings.address || 'Address not set'}</p>
            <p class="text-sm text-gray-600">GST: ${settings.gstin || 'Not set'}</p>
            <div class="border-t border-gray-300 my-3"></div>
            <p class="text-sm">Invoice: <span class="font-mono">${settings.invoice_prefix}-00001</span></p>
            <div class="border-t border-gray-300 my-3"></div>
            <p class="text-xs text-gray-500">${settings.footer_note || 'Thank you for your business!'}</p>
          </div>
        </div>
      </div>
    </form>
  `;
}

function renderTaxSettings(settings) {
  return `
    <form onsubmit="return false" onchange="markSettingsChanged()" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">GSTIN *</label>
        <input type="text" id="gstin" value="${settings.gstin || ''}" placeholder="e.g., 33ABCDE1234F1Z5" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
      </div>
      
      <div class="flex items-center justify-between py-2">
        <div>
          <h4 class="font-medium text-gray-800">Enable GST</h4>
          <p class="text-sm text-gray-500">Apply GST to all taxable items</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="enableGst" ${settings.enable_gst ? 'checked' : ''} class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="font-medium text-blue-800 mb-2">Default GST Rates</h4>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700">Essential Items</span>
            <span class="text-sm font-medium">5%</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700">Standard Rate</span>
            <span class="text-sm font-medium">12%</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700">Luxury Items</span>
            <span class="text-sm font-medium">18%</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700">Sin Goods</span>
            <span class="text-sm font-medium">28%</span>
          </div>
        </div>
      </div>
    </form>
  `;
}

function renderNotificationSettings(settings) {
  return `
    <form onsubmit="return false" onchange="markSettingsChanged()" class="space-y-4">
      <div class="flex items-center justify-between py-3 border-b border-gray-100">
        <div>
          <h4 class="font-medium text-gray-800">Low Stock Alerts</h4>
          <p class="text-sm text-gray-500">Get notified when stock falls below threshold</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="lowStockAlert" checked class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>
      
      <div class="pl-4 border-l-2 border-gray-200 ml-2">
        <label class="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
        <input type="number" id="lowStockThreshold" value="${settings.low_stock_threshold || 50}" class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
      </div>
      
      <div class="flex items-center justify-between py-3 border-b border-gray-100">
        <div>
          <h4 class="font-medium text-gray-800">Daily Sales Summary</h4>
          <p class="text-sm text-gray-500">Receive daily sales report via email</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="dailySalesEmail" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>
      
      <div class="flex items-center justify-between py-3">
        <div>
          <h4 class="font-medium text-gray-800">New Order Notifications</h4>
          <p class="text-sm text-gray-500">Get notified for every new sale</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="newOrderAlert" checked class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>
    </form>
  `;
}

function renderAdvancedSettings(settings) {
  return `
    <form onsubmit="return false" onchange="markSettingsChanged()" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
        <select id="dateFormat" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
          <option value="DD/MM/YYYY" ${settings.date_format === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY</option>
          <option value="MM/DD/YYYY" ${settings.date_format === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
          <option value="YYYY-MM-DD" ${settings.date_format === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
        </select>
      </div>
      
      <div class="flex items-center justify-between py-2">
        <div>
          <h4 class="font-medium text-gray-800">Enable Loyalty Program</h4>
          <p class="text-sm text-gray-500">Allow customers to earn and redeem points</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="enableLoyalty" ${settings.enable_loyalty ? 'checked' : ''} class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Loyalty Points Rate</label>
        <div class="flex items-center gap-2">
          <span class="text-gray-500">₹1 =</span>
          <input type="number" id="loyaltyRate" value="${settings.loyalty_points_rate || 1}" class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
          <span class="text-gray-500">points</span>
        </div>
      </div>
      
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 class="font-medium text-yellow-800 mb-2">System Information</h4>
        <div class="text-sm text-gray-700 space-y-1">
          <p>Version: 1.0.0</p>
          <p>Last Backup: Never</p>
          <p>Storage Used: 45.2 MB</p>
        </div>
        <button onclick="createBackup()" class="mt-3 px-3 py-1.5 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition">
          Create Backup
        </button>
      </div>
    </form>
  `;
}

// Settings functions
function switchSettingsTab(tab) {
  settingsState.activeTab = tab;
  refreshSettingsUI();
}

function markSettingsChanged() {
  settingsState.hasChanges = true;
  refreshSettingsUI();
}

function saveSettings() {
  // Collect all form data
  const newSettings = { ...settingsState.settings };

  // General
  newSettings.shop_name = document.getElementById('shopName')?.value || newSettings.shop_name;
  newSettings.mobile = document.getElementById('shopMobile')?.value || newSettings.mobile;
  newSettings.email = document.getElementById('shopEmail')?.value || newSettings.email;
  newSettings.address = document.getElementById('shopAddress')?.value || newSettings.address;
  newSettings.currency = document.getElementById('currency')?.value || newSettings.currency;
  newSettings.timezone = document.getElementById('timezone')?.value || newSettings.timezone;

  // Invoice
  newSettings.invoice_prefix = document.getElementById('invoicePrefix')?.value || newSettings.invoice_prefix;
  newSettings.footer_note = document.getElementById('footerNote')?.value || newSettings.footer_note;

  // Tax
  newSettings.gstin = document.getElementById('gstin')?.value || newSettings.gstin;
  newSettings.enable_gst = document.getElementById('enableGst')?.checked || false;

  // Notifications
  newSettings.low_stock_threshold = parseInt(document.getElementById('lowStockThreshold')?.value) || 50;

  // Advanced
  newSettings.date_format = document.getElementById('dateFormat')?.value || newSettings.date_format;
  newSettings.enable_loyalty = document.getElementById('enableLoyalty')?.checked || false;
  newSettings.loyalty_points_rate = parseInt(document.getElementById('loyaltyRate')?.value) || 1;

  settingsState.settings = newSettings;
  settingsState.originalSettings = { ...newSettings };
  settingsState.hasChanges = false;

  alert('Settings saved successfully!');
  refreshSettingsUI();
}

function resetSettings() {
  if (confirm('Discard all unsaved changes?')) {
    settingsState.settings = { ...settingsState.originalSettings };
    settingsState.hasChanges = false;
    refreshSettingsUI();
  }
}

function resetAllSettings() {
  if (confirm('Reset all settings to default values? This cannot be undone.')) {
    settingsState.settings = { ...SETTINGS_DATA };
    settingsState.originalSettings = { ...SETTINGS_DATA };
    settingsState.hasChanges = false;
    refreshSettingsUI();
    alert('Settings reset to defaults.');
  }
}

function deleteStoreData() {
  const confirmText = prompt('Type "DELETE" to confirm permanent deletion of all store data:');
  if (confirmText === 'DELETE') {
    alert('All store data has been deleted. You will be logged out.');
  } else if (confirmText) {
    alert('Confirmation text did not match.');
  }
}

function createBackup() {
  alert('Backup created successfully! Downloaded to your computer.');
}

function refreshSettingsUI() {
  const app = document.getElementById('app');
  const mainContent = app.querySelector('.flex-1.flex.flex-col.overflow-hidden');
  if (mainContent) {
    const topBarHtml = mainContent.querySelector('header').outerHTML;
    mainContent.innerHTML = topBarHtml + renderSettingsPage();
  }
}

// Export for router
window.switchSettingsTab = switchSettingsTab;
window.markSettingsChanged = markSettingsChanged;
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.resetAllSettings = resetAllSettings;
window.deleteStoreData = deleteStoreData;
window.createBackup = createBackup;

// ----- MAIN ROUTER -----
function renderApp(page = 'dashboard') {
  const app = document.getElementById('app');
  if (!app) return;

  const pageMap = {
    'dashboard': { name: 'Dashboard', render: renderDashboardPage, chart: true },
    'profile': { name: 'Profile', render: renderProfilePage, chart: false },
    'products': { name: 'Products', render: renderProductsPage, chart: false },
    'sales': { name: 'Sales', render: renderSalesPage, chart: false },
    'customers': { name: 'Customers', render: renderCustomersPage, chart: false },
    'stock': { name: 'Stock', render: renderStockPage, chart: false },
    'reports': { name: 'Reports', render: renderReportsPage, chart: true },
    'suppliers': { name: 'Suppliers', render: renderSuppliersPage, chart: false },
    'purchases': { name: 'Purchases', render: renderPurchasesPage, chart: false },
    'purchase-history': { name: 'Purchase History', render: renderPurchaseHistoryPage, chart: true },
    'staff': { name: 'Staff', render: renderStaffPage, chart: false },
    'settings': { name: 'Settings', render: renderSettingsPage, chart: false }  // Add this
  };


  const current = pageMap[page] || pageMap['dashboard'];
  const sidebarHtml = renderSidebar(current.name);
  const topBarHtml = renderTopBar(['Home', current.name]);
  const pageContent = current.render();

  app.innerHTML = sidebarHtml + `
    <div class="flex-1 flex flex-col overflow-hidden">
      ${topBarHtml}
      ${pageContent}
    </div>
  `;

  if (current.chart) {
    initSalesChart(MOCK.salesTrend);
  }

  // Navigation listeners
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = link.dataset.page;
      if (targetPage === 'dashboard' ||
        targetPage === 'profile' ||
        targetPage === 'products' ||
        targetPage === 'sales' ||
        targetPage === 'customers' ||
        targetPage === 'stock' ||
        targetPage === 'reports' ||
        targetPage === 'suppliers' ||
        targetPage === 'purchases' ||
        targetPage === 'purchase-history' ||
        targetPage === 'staff' ||
        targetPage === 'settings'
      
      ) {
        renderApp(targetPage);
      }
    });
  });
}

// Start the app (default: dashboard)
document.addEventListener('DOMContentLoaded', () => {
  renderApp('dashboard');
});