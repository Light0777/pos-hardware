import { apiGet } from "./api";

const API = "http://127.0.0.1:3000/api";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
  };
}

export async function getDashboardReport() {
  try {
    const res = await fetch(`${API}/reports/dashboard`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Dashboard API error:", res.status, errorText);
      throw new Error(`Dashboard failed: ${res.status}`);
    }
    
    const data = await res.json();
    console.log("Dashboard data received:", data);
    
    // Ensure the data has all required fields
    return {
      today_sales: data.today_sales || 0,
      month_sales: data.month_sales || 0,
      total_sales: data.total_sales || 0,
      total_orders: data.total_orders || 0,
      low_stock: data.low_stock || [],
      recent_sales: data.recent_sales || [],
      recent_purchases: data.recent_purchases || [],
      top_products: data.top_products || [],
      ...data
    };
  } catch (error) {
    console.error("Dashboard API error:", error);
    // Return default data structure instead of throwing
    return {
      today_sales: 0,
      month_sales: 0,
      total_sales: 0,
      total_orders: 0,
      low_stock: [],
      recent_sales: [],
      recent_purchases: [],
      top_products: [],
    };
  }
}

export async function getTopProducts() {
  try {
    const res = await fetch(`${API}/reports/top-products`, {
      headers: getHeaders(),
    });

    if (!res.ok) throw new Error("Top products failed");
    const data = await res.json();
    
    console.log("Top products raw response:", data);
    
    // Handle different response structures
    // Case 1: { success: true, data: [...] }
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    // Case 2: Direct array
    if (Array.isArray(data)) {
      return data;
    }
    // Case 3: { data: [...] }
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    // Case 4: { products: [...] }
    if (data.products && Array.isArray(data.products)) {
      return data.products;
    }
    // Default: return empty array
    console.warn("Unexpected top products response structure:", data);
    return [];
  } catch (error) {
    console.error("Top products API error:", error);
    return [];
  }
}

export async function getStockReport() {
  try {
    const res = await fetch(`${API}/reports/stock`, {
      headers: getHeaders(),
    });

    if (!res.ok) throw new Error("Stock failed");
    const data = await res.json();
    
    console.log("Stock report raw response:", data);
    
    // Handle different response structures
    // Case 1: { success: true, data: [...] }
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    // Case 2: Direct array
    if (Array.isArray(data)) {
      return data;
    }
    // Case 3: { data: [...] }
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    // Case 4: { products: [...] }
    if (data.products && Array.isArray(data.products)) {
      return data.products;
    }
    // Default: return empty array
    console.warn("Unexpected stock response structure:", data);
    return [];
  } catch (error) {
    console.error("Stock report API error:", error);
    return [];
  }
}

export async function getProfitReport() {
  try {
    const res = await fetch(`${API}/reports/profit`, {
      headers: getHeaders(),
    });

    if (!res.ok) throw new Error("Profit failed");
    const data = await res.json();
    
    console.log("Profit report raw response:", data);
    
    // Handle different response structures
    // Case 1: { success: true, data: { revenue, cost, profit } }
    if (data.success && data.data) {
      return {
        revenue: data.data.revenue || 0,
        cost: data.data.cost || 0,
        profit: data.data.profit || 0,
      };
    }
    // Case 2: Direct object with revenue, cost, profit
    if (data.revenue !== undefined || data.cost !== undefined || data.profit !== undefined) {
      return {
        revenue: data.revenue || 0,
        cost: data.cost || 0,
        profit: data.profit || 0,
      };
    }
    // Default: return zeros
    console.warn("Unexpected profit response structure:", data);
    return {
      revenue: 0,
      cost: 0,
      profit: 0,
    };
  } catch (error) {
    console.error("Profit API error:", error);
    return {
      revenue: 0,
      cost: 0,
      profit: 0,
    };
  }
}

export async function getSalesTrend() {
  try {
    const data = await apiGet("/reports/sales-trend");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Sales trend API error:", error);
    return [];
  }
}

export async function getProfitTrend() {
  try {
    const data = await apiGet("/reports/profit-trend");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Profit trend API error:", error);
    return [];
  }
}