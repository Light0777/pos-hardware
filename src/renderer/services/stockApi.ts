// stockApi.ts
const BASE_URL = "http://127.0.0.1:3000/api";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export async function getStock() {
  try {
    const res = await fetch(`${BASE_URL}/reports/stock`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    console.log("Stock API raw response:", data);
    
    // Handle different response structures from backend
    let stockData = [];
    
    // If response has success flag and data array
    if (data.success && Array.isArray(data.data)) {
      stockData = data.data;
    }
    // If response is directly an array
    else if (Array.isArray(data)) {
      stockData = data;
    }
    // If response has data property that's an array
    else if (data.data && Array.isArray(data.data)) {
      stockData = data.data;
    }
    // If response has products property
    else if (data.products && Array.isArray(data.products)) {
      stockData = data.products;
    }
    // If response is empty or has no data
    else {
      console.warn("Unexpected stock response structure:", data);
      stockData = [];
    }
    
    console.log("Parsed stock data:", stockData.length, "items");
    return stockData;
  } catch (error) {
    console.error("Stock API error:", error);
    return [];
  }
}

export async function updateStock(productUUID: string, stock: number) {
  try {
    const res = await fetch(`${BASE_URL}/products/${productUUID}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ stock }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    console.log("Update stock response:", data);
    return data;
  } catch (error) {
    console.error("Update stock error:", error);
    throw error;
  }
}