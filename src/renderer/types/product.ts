export type Product = {
  category: string | number | undefined;
  product_uuid: string;
  name: string;
  price: number;
  gst_percent?: number;
  stock?: number;
  barcode?: string;
  sku?: string;
};