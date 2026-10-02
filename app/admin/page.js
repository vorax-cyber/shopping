'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');

  // Form states
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', image_url: '', category_id: '' });
  const [newCategory, setNewCategory] = useState({ name: '' });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('/api/admin/orders');
    if (res.ok) setOrders(await res.json());
  };

  const fetchProducts = async () => {
    const res = await fetch('/api/admin/products');
    if (res.ok) setProducts(await res.json());
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories');
    if (res.ok) setCategories(await res.json());
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });
    if (res.ok) {
      fetchProducts();
      setNewProduct({ name: '', price: '', description: '', image_url: '', category_id: '' });
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory)
    });
    if (res.ok) {
      fetchCategories();
      setNewCategory({ name: '' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">لوحة الإدارة</h1>

      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2 px-4 font-medium text-sm ${activeTab === 'orders' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}
        >
          الطلبات ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-2 px-4 font-medium text-sm ${activeTab === 'products' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}
        >
          المنتجات ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-2 px-4 font-medium text-sm ${activeTab === 'categories' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}
        >
          الفئات ({categories.length})
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold">{order.customer_name} - {order.phone}</h3>
                  <p className="text-xs text-slate-500">{order.wilaya} / {order.commune}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-bold">{order.total_price} د.ج</span>
              </div>
              <div className="text-xs bg-slate-50 p-2 rounded mt-2">
                <strong>المنتجات:</strong>
                <ul>
                  {order.items.map((item, i) => (
                    <li key={i}>{item.name} × {item.quantity}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <form onSubmit={handleAddProduct} className="bg-white p-4 rounded-xl border mb-6 space-y-3">
            <h3 className="font-bold text-sm">إضافة منتج جديد</h3>
            <input placeholder="اسم المنتج" required className="w-full border p-2 rounded text-sm" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
            <input placeholder="السعر" required type="number" className="w-full border p-2 rounded text-sm" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
            <input placeholder="رابط الصورة" className="w-full border p-2 rounded text-sm" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} />
            <button type="submit" className="bg-slate-900 text-white text-xs px-4 py-2 rounded">حفظ المنتج</button>
          </form>
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          <form onSubmit={handleAddCategory} className="bg-white p-4 rounded-xl border mb-6 space-y-3">
            <h3 className="font-bold text-sm">إضافة فئة جديدة</h3>
            <input placeholder="اسم الفئة" required className="w-full border p-2 rounded text-sm" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} />
            <button type="submit" className="bg-slate-900 text-white text-xs px-4 py-2 rounded">حفظ الفئة</button>
          </form>
        </div>
      )}
    </div>
  );
}
