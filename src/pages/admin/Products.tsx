import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductUnits,
  createProductUnit,
  deleteProductUnit,
} from "../../renderer/services/productApi";
import { IonIcon } from "@ionic/react";
import {
  addOutline,
  createOutline,
  trashOutline,
  searchOutline,
  closeOutline,
  cubeOutline,
  checkmarkCircleOutline,
  warningOutline,
  cloudUploadOutline,
  pricetagOutline,
  addCircleOutline,
  chevronDownOutline,
} from "ionicons/icons";
import ImportProductsModal from "../../components/ImportProductsModal";
import PrintLabelsModal from "../../components/PrintLabelsModal";
import { createPortal } from "react-dom";
import {
  getCategories,
  getCategoryAttributes,
  createCategory
} from "../../renderer/services/categoryApi";

const EMPTY_FORM = {
  name: "",
  price: "",
  purchase_price: "",
  stock: "",
  sku: "",
  barcode: "",
  gst_percent: "0",
  hsn_code: "",
  unit: "piece",
  image: "",
  category_uuid: "",
};

// GST options
const GST_OPTIONS = [
  { value: "0", label: "0% (Tax Exempt)" },
  { value: "5", label: "5% (Low Rate)" },
  { value: "12", label: "12% (Standard)" },
  { value: "18", label: "18% (Standard)" },
  { value: "28", label: "28% (High Rate)" },
];

// Custom Dropdown Component for Units (with filter)
const UnitDropdown = ({ value, onChange, options, onSaveNew, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    const filter = inputValue.toLowerCase();
    setFilteredOptions(
      options.filter((opt: string) => opt.toLowerCase().includes(filter))
    );
  }, [inputValue, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };

  const handleBlur = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      onChange("");
      return;
    }
    if (!options.includes(trimmed)) {
      onSaveNew(trimmed);
    }
    onChange(trimmed);
  };

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray text-white placeholder-gray-400"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
        >
          <IonIcon icon={chevronDownOutline} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-black border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.map((opt: string) => (
            <li
              key={opt}
              onClick={() => handleSelect(opt)}
              className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm text-white"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Custom Dropdown Component for Categories (async creation, with filter)
const CategoryDropdown = ({ value, onChange, options, onCreateNew, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localOptions, setLocalOptions] = useState(options);
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    setLocalOptions(options);
    const selected = options.find((c: any) => c.category_uuid === value);
    setInputValue(selected?.name || "");
  }, [options, value]);

  useEffect(() => {
    const filter = inputValue.toLowerCase();
    setFilteredOptions(
      localOptions.filter((cat: any) => cat.name.toLowerCase().includes(filter))
    );
  }, [inputValue, localOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (category: any) => {
    setInputValue(category.name);
    onChange(category.category_uuid);
    setIsOpen(false);
  };

  const handleBlur = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      onChange("");
      return;
    }
    const existing = localOptions.find(
      (c: any) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      onChange(existing.category_uuid);
    } else {
      try {
        const created = await onCreateNew(trimmed);
        onChange(created.category_uuid);
      } catch (err) {
        console.error("Failed to create category:", err);
      }
    }
  };

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray text-white placeholder-gray-400"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
        >
          <IonIcon icon={chevronDownOutline} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-black border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.map((cat: any) => (
            <li
              key={cat.category_uuid}
              onClick={() => handleSelect(cat)}
              className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm text-white"
            >
              {cat.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Custom Dropdown Component for GST (simple select with filter)
// Custom Dropdown Component for GST (simple select with filter)
const GstDropdown = ({ value, onChange, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [filteredOptions, setFilteredOptions] = useState(GST_OPTIONS);

  // When value changes, set inputValue – but leave empty if value is "0"
  useEffect(() => {
    if (value === "0") {
      setInputValue("");
    } else {
      const selected = GST_OPTIONS.find(opt => opt.value === value);
      setInputValue(selected?.label || "");
    }
  }, [value]);

  useEffect(() => {
    const filter = inputValue.toLowerCase();
    setFilteredOptions(
      GST_OPTIONS.filter(opt => opt.label.toLowerCase().includes(filter))
    );
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (opt: { value: string; label: string }) => {
    if (opt.value === "0") {
      setInputValue("");          // keep input empty for 0%
    } else {
      setInputValue(opt.label);
    }
    onChange(opt.value);
    setIsOpen(false);
  };

  const handleBlur = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      onChange("0");
      setInputValue("");
      return;
    }
    const matched = GST_OPTIONS.find(opt => opt.label.toLowerCase() === trimmed.toLowerCase());
    if (matched) {
      if (matched.value === "0") {
        setInputValue("");
      } else {
        setInputValue(matched.label);
      }
      onChange(matched.value);
    } else {
      // No match: default to 0% and clear input
      onChange("0");
      setInputValue("");
    }
  };

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black text-white placeholder-gray-400"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
        >
          <IonIcon icon={chevronDownOutline} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-black border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.map((opt) => (
            <li
              key={opt.value}
              onClick={() => handleSelect(opt)}
              className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm text-white"
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function Products() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showPrintLabels, setShowPrintLabels] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [categories, setCategories] = useState<any[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});

  // ── Product Units state ──────────────────────────────────────────────────
  const [units, setUnits] = useState<any[]>([]);
  const [unitForm, setUnitForm] = useState({
    unit_name: "",
    conversion_factor: "1",
    barcode: "",
    price: "",
    purchase_price: "",
    is_base_unit: false,
  });
  const [showUnitForm, setShowUnitForm] = useState(false);

  const [unitsMasterList, setUnitsMasterList] = useState<string[]>([
    "piece", "box", "pack", "set", "pair", "roll", "bundle", "bag",
    "kg", "g", "litre", "ml", "meter", "feet", "inch", "sqft", "dozen"
  ]);

  const loadCustomUnits = () => {
    const stored = localStorage.getItem("custom_units");
    if (stored) {
      try {
        const custom = JSON.parse(stored);
        setUnitsMasterList(prev => [...new Set([...prev, ...custom])]);
      } catch (e) { }
    }
  };

  const saveNewUnit = (newUnit: string) => {
    const trimmed = newUnit.trim().toLowerCase();
    if (!trimmed) return;
    if (!unitsMasterList.includes(trimmed)) {
      const updatedList = [...unitsMasterList, trimmed];
      setUnitsMasterList(updatedList);
      const builtIn = new Set([
        "piece", "box", "pack", "set", "pair", "roll", "bundle", "bag",
        "kg", "g", "litre", "ml", "meter", "feet", "inch", "sqft", "dozen"
      ]);
      const customOnly = updatedList.filter(u => !builtIn.has(u));
      localStorage.setItem("custom_units", JSON.stringify(customOnly));
    }
  };

  const loadProducts = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load products error:", err);
      setError(t("products.loadError"));
      setProducts([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadUnits = async (product_uuid: string) => {
    const data = await getProductUnits(product_uuid);
    setUnits(data);
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadCustomUnits();
  }, []);

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  useEffect(() => {
    if (!form.category_uuid) {
      setCategoryAttributes([]);
      setAttributeValues({});
      return;
    }
    getCategoryAttributes(form.category_uuid).then((attrs) => {
      setCategoryAttributes(attrs);
      if (editing?.attributes?.length) {
        const prefilled: Record<string, string> = {};
        for (const a of editing.attributes) {
          prefilled[a.attribute_uuid] = a.value;
        }
        setAttributeValues(prefilled);
      } else {
        setAttributeValues({});
      }
    });
  }, [form.category_uuid]);

  useEffect(() => {
    if (editing?.product_uuid) {
      loadUnits(editing.product_uuid);
    } else {
      setUnits([]);
    }
  }, [editing]);

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      setError(t("products.namePriceRequired"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        sku: form.sku || undefined,
        barcode: form.barcode || undefined,
        gst_percent: Number(form.gst_percent) || 0,
        hsn_code: form.hsn_code || undefined,
        unit: form.unit || "piece",
        image: form.image || undefined,
        category_uuid: form.category_uuid || undefined,
      };
      if (form.purchase_price) {
        payload.purchase_price = Number(form.purchase_price);
      }
      const filledAttributes = Object.entries(attributeValues)
        .filter(([, value]) => value !== "")
        .map(([attribute_uuid, value]) => ({ attribute_uuid, value }));
      if (filledAttributes.length) {
        payload.attributes = filledAttributes;
      }

      if (editing) {
        await updateProduct(editing.product_uuid, payload);
      } else {
        await createProduct(payload);
      }

      setForm({ ...EMPTY_FORM });
      setEditing(null);
      setShowForm(false);
      setShowUnitForm(false);
      await loadProducts();
    } catch (err) {
      console.error("Submit error:", err);
      setError(editing ? t("products.updateError") : t("products.createError"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: String(p.price),
      purchase_price: String(p.purchase_price || ""),
      stock: String(p.stock || 0),
      sku: p.sku || "",
      barcode: p.barcode || "",
      gst_percent: String(p.gst_percent || "0"),
      hsn_code: p.hsn_code || "",
      unit: p.unit || "piece",
      image: p.image || "",
      category_uuid: p.category_uuid || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (uuid: string) => {
    if (!confirm(t("products.deleteConfirm"))) return;
    setDeleting(uuid);
    try {
      await deleteProduct(uuid);
      await loadProducts(true);
    } catch (err) {
      console.error("Delete error:", err);
      setError(t("products.deleteError"));
    } finally {
      setDeleting(null);
    }
  };

  const handleAddUnit = async () => {
    if (!editing?.product_uuid) return;
    if (!unitForm.unit_name || !unitForm.conversion_factor) return;
    try {
      await createProductUnit({
        product_uuid: editing.product_uuid,
        unit_name: unitForm.unit_name,
        conversion_factor: Number(unitForm.conversion_factor),
        barcode: unitForm.barcode || undefined,
        price: unitForm.price ? Number(unitForm.price) : undefined,
        purchase_price: unitForm.purchase_price ? Number(unitForm.purchase_price) : undefined,
        is_base_unit: unitForm.is_base_unit,
      });
      setUnitForm({ unit_name: "", conversion_factor: "1", barcode: "", price: "", purchase_price: "", is_base_unit: false });
      setShowUnitForm(false);
      await loadUnits(editing.product_uuid);
    } catch (err) {
      console.error("Add unit error:", err);
    }
  };

  const handleDeleteUnit = async (unit_uuid: string) => {
    if (!editing?.product_uuid) return;
    await deleteProductUnit(unit_uuid);
    await loadUnits(editing.product_uuid);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock <= 10 && p.stock > 0).length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="font-inter text-start">
          <h1 className="text-3xl font-bold text-white font-inter">{t("products.title")}</h1>
          <p className="text-gray-500 text-sm font-inter">{t("products.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditing(null);
              setForm({ ...EMPTY_FORM });
              setError(null);
              setShowUnitForm(false);
              setCategoryAttributes([]);
              setAttributeValues({});
              setShowForm(!showForm);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <IonIcon icon={addOutline} className="text-xl" />
            <span>{t("products.addProduct")}</span>
          </button>
          <button
            onClick={() => setShowPrintLabels(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <IonIcon icon={pricetagOutline} className="text-xl" />
            <span>Print Labels</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IonIcon icon={warningOutline} className="text-xl" />
              <p className="text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <IonIcon icon={closeOutline} className="text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-blue-100 text-sm">{t("products.totalProducts")}</p>
              <p className="text-3xl font-bold mt-1">{totalProducts}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={cubeOutline} className="text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-orange-100 text-sm">{t("products.lowStock")}</p>
              <p className="text-3xl font-bold mt-1">{lowStockProducts}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={warningOutline} className="text-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-red-100 text-sm">{t("products.outOfStock")}</p>
              <p className="text-3xl font-bold mt-1">{outOfStockProducts}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={closeOutline} className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <IonIcon icon={searchOutline} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          placeholder={t("products.searchPlaceholder")}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <IonIcon icon={cubeOutline} className="text-2xl" />
                    <h2 className="text-2xl font-bold">
                      {editing ? t("products.editProduct") : t("products.addNewProduct")}
                    </h2>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {editing ? t("products.updateProductInfo") : t("products.createNewProduct")}
                  </p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                  <IonIcon icon={closeOutline} className="text-2xl" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("products.productName")} *</label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("products.namePlaceholder")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("products.barcodeLabel")}</label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("products.barcodePlaceholder")}
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">{t("products.barcodeHint")}</p>
              </div>

              {/* Price + Purchase Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("products.priceLabel")} *</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("products.pricePlaceholder")}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    value={form.purchase_price}
                    onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                  />
                </div>
              </div>

              {/* Stock + Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("products.stockLabel")}</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("products.stockPlaceholder")}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <div className="flex gap-2">
                    <UnitDropdown
                      value={form.unit}
                      onChange={(val: string) => setForm({ ...form, unit: val })}
                      options={unitsMasterList}
                      onSaveNew={saveNewUnit}
                      placeholder="Select or type new unit…"
                    />
                    {form.unit && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, unit: "" })}
                        className="text-gray-400 hover:text-red-500 px-2 transition"
                        title="Clear unit"
                      >
                        <IonIcon icon={closeOutline} />
                      </button>
                    )}
                  </div>
                  {form.unit && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Unit: {form.unit}
                    </p>
                  )}
                </div>
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("products.skuLabel")}</label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("products.skuPlaceholder")}
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="flex gap-2">
                  <CategoryDropdown
                    value={form.category_uuid}
                    onChange={(uuid: string) => setForm({ ...form, category_uuid: uuid })}
                    options={categories}
                    onCreateNew={async (name: string) => {
                      const created = await createCategory({ name });
                      await loadCategories();
                      return created;
                    }}
                    placeholder="Select or type new category…"
                  />
                  {form.category_uuid && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, category_uuid: "" })}
                      className="text-gray-400 hover:text-red-500 px-2 transition"
                      title="Clear category"
                    >
                      <IonIcon icon={closeOutline} />
                    </button>
                  )}
                </div>
                {form.category_uuid && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ {categories.find((c) => c.category_uuid === form.category_uuid)?.name}
                  </p>
                )}
              </div>

              {/* Dynamic attributes for selected category */}
              {categoryAttributes.length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Category Attributes
                  </h3>
                  {categoryAttributes.map((attr) => (
                    <div key={attr.attribute_uuid}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {attr.display_name}
                        {attr.is_required ? (
                          <span className="text-red-500 ml-1">*</span>
                        ) : null}
                        <span className="text-xs text-gray-400 ml-2">({attr.data_type})</span>
                      </label>
                      <input
                        type={attr.data_type === "number" ? "number" : "text"}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${attr.display_name.toLowerCase()}`}
                        value={attributeValues[attr.attribute_uuid] || ""}
                        onChange={(e) =>
                          setAttributeValues((prev) => ({
                            ...prev,
                            [attr.attribute_uuid]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* GST + HSN */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("products.gstPercentLabel")}
                  </label>
                  <GstDropdown
                    value={form.gst_percent}
                    onChange={(val: string) => setForm({ ...form, gst_percent: val })}
                    placeholder="Select GST rate…"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("products.hsnCodeLabel")}
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("products.hsnPlaceholder")}
                    value={form.hsn_code}
                    onChange={(e) => setForm({ ...form, hsn_code: e.target.value })}
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("products.imageLabel")}</label>
                <div className="flex items-center gap-3">
                  {form.image && (
                    <img src={form.image} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                  )}
                  <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-3 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement("canvas");
                            const MAX = 200;
                            let w = img.width, h = img.height;
                            if (w > h) { if (w > MAX) { h = (h * MAX) / w; w = MAX; } }
                            else { if (h > MAX) { w = (w * MAX) / h; h = MAX; } }
                            canvas.width = w; canvas.height = h;
                            canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
                            setForm({ ...form, image: canvas.toDataURL("image/jpeg", 0.7) });
                          };
                          img.src = ev.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <p className="text-xs text-gray-400">
                      {form.image ? t("products.changeImage") : t("products.uploadImage")}
                    </p>
                  </label>
                  {form.image && (
                    <button type="button" onClick={() => setForm({ ...form, image: "" })} className="text-red-500 hover:text-red-700 text-xs">
                      {t("products.removeImage")}
                    </button>
                  )}
                </div>
              </div>

              {/* ── Product Units (only shown when editing) ── */}
              {editing && (
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">Product Units</h3>
                    <button
                      type="button"
                      onClick={() => setShowUnitForm(!showUnitForm)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                    >
                      <IonIcon icon={addCircleOutline} />
                      Add Unit
                    </button>
                  </div>

                  {showUnitForm && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Unit name (e.g. box)"
                          value={unitForm.unit_name}
                          onChange={(e) => setUnitForm({ ...unitForm, unit_name: e.target.value })}
                        />
                        <input
                          type="number"
                          className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Conversion factor"
                          value={unitForm.conversion_factor}
                          onChange={(e) => setUnitForm({ ...unitForm, conversion_factor: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Barcode (optional)"
                          value={unitForm.barcode}
                          onChange={(e) => setUnitForm({ ...unitForm, barcode: e.target.value })}
                        />
                        <input
                          type="number"
                          className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Price (optional)"
                          value={unitForm.price}
                          onChange={(e) => setUnitForm({ ...unitForm, price: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_base_unit"
                          checked={unitForm.is_base_unit}
                          onChange={(e) => setUnitForm({ ...unitForm, is_base_unit: e.target.checked })}
                        />
                        <label htmlFor="is_base_unit" className="text-sm text-gray-600">Base unit</label>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddUnit}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5 rounded-lg"
                      >
                        Save Unit
                      </button>
                    </div>
                  )}

                  {units.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-2">No units added yet</p>
                  ) : (
                    <div className="space-y-1">
                      {units.map((u) => (
                        <div key={u.unit_uuid} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                          <div>
                            <span className="font-medium">{u.unit_name}</span>
                            <span className="text-gray-400 ml-2">×{u.conversion_factor}</span>
                            {u.price && <span className="text-green-600 ml-2">₹{u.price}</span>}
                            {u.is_base_unit ? <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">base</span> : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteUnit(u.unit_uuid)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editing ? t("products.updating") : t("products.creating")}
                  </span>
                ) : editing ? t("products.updateProduct") : t("products.createProduct")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 text-center">
              <tr>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">{t("products.tableProduct")}</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">{t("products.tableSku")}</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">{t("products.tableGst")}</th>
                <th className="text-end p-4 text-sm font-semibold text-gray-600">{t("products.tablePrice")}</th>
                <th className="text-end p-4 text-sm font-semibold text-gray-600">{t("products.tableStock")}</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">{t("products.tableStatus")}</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">{t("products.tableActions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500">
                    {searchTerm ? t("products.noSearchResults") : t("products.noProducts")}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.product_uuid} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{p.name}</div>
                      {p.unit && p.unit !== "piece" && (
                        <div className="text-xs text-gray-400 mt-0.5">{p.unit}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono text-gray-500">{p.sku || "—"}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs font-mono text-gray-500">{p.gst_percent || 0}%</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-green-600">₹{p.price?.toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-medium ${p.stock === 0 ? "text-red-600" : p.stock <= 10 ? "text-orange-600" : "text-gray-700"}`}>
                        {p.stock ?? "-"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {p.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          <IonIcon icon={closeOutline} className="text-xs" />
                          {t("products.outOfStockLabel")}
                        </span>
                      ) : p.stock <= 10 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                          <IonIcon icon={warningOutline} className="text-xs" />
                          {t("products.lowStockLabel")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          <IonIcon icon={checkmarkCircleOutline} className="text-xs" />
                          {t("products.inStockLabel")}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title={t("products.editTitle")}
                        >
                          <IonIcon icon={createOutline} className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.product_uuid)}
                          disabled={deleting === p.product_uuid}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title={t("products.deleteTitle")}
                        >
                          {deleting === p.product_uuid ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                          ) : (
                            <IonIcon icon={trashOutline} className="text-lg" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPrintLabels && createPortal(<PrintLabelsModal products={products} onClose={() => setShowPrintLabels(false)} />, document.body)}
    </div>
  );
}