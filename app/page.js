'use client';
import { useState, useEffect } from 'react';
import { WILAYAS } from '@/lib/wilayas';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [storeInfo, setStoreInfo] = useState({ store_name: 'المتجر الإلكتروني' });

  // Checkout form
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    wilaya: WILAYAS[0].name,
    commune: '',
    address: '',
    delivery_type: 'home'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSettings();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.store_info) setStoreInfo(data.store_info);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTitleClick = () => {
    setClickCount(prev => {
      if (prev + 1 >= 6) {
        setShowAdminLogin(true);
        return 0;
      }
      return prev + 1;
    });
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      if (res.ok) {
        window.location.href = '/admin';
      } else {
        alert('كلمة المرور غير صحيحة');
      }
    } catch (e) {
      alert('حدث خطأ أثناء تسجيل الدخول');
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const selectedWilayaObj = WILAYAS.find(w => w.name === formData.wilaya) || WILAYAS[0];
  const deliveryFee = formData.delivery_type === 'home' ? selectedWilayaObj.homePrice : selectedWilayaObj.deskPrice;
  const itemsTotal = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
  const grandTotal = itemsTotal + deliveryFee;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('السلة فارغة');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          total_price: grandTotal,
          items: cart
        })
      });
      if (res.ok) {
        alert('تم إرسال الطلب بنجاح! سنتصل بك قريباً.');
        setCart([]);
        setShowCheckout(false);
      } else {
        alert('حدث خطأ في إرسال الطلب.');
      }
    } catch (e) {
      alert('حدث خطأ في الشبكة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h1 
          onClick={handleTitleClick}
          className="text-2xl font-bold text-slate-800 cursor-pointer select-none"
        >
          {storeInfo.store_name}
        </h1>
        <button 
          onClick={() => setShowCheckout(true)}
          className="relative bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
        >
          السلة ({cart.reduce((a, b) => a + b.quantity, 0)})
        </button>
      </header>

      {/* Categories Bar */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
            selectedCategory === null ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          الكل
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === cat.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            {p.image_url && (
              <img src={p.image_url} alt={p.name} className="w-full h-40 object-cover" />
            )}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 text-base">{p.name}</h3>
                <p className="text-slate-500 text-xs mt-1 line-clamp-2">{p.description}</p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold text-emerald-600 text-sm">{p.price} د.ج</span>
                <button
                  onClick={() => addToCart(p)}
                  className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-800 transition"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart & Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">إتمام الطلب</h2>
              <button onClick={() => setShowCheckout(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {cart.length === 0 ? (
              <p className="text-slate-500 text-center py-8">السلة فارغة حالياً</p>
            ) : (
              <div>
                <div className="divide-y divide-slate-100 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.price} د.ج × {item.quantity}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs">إزالة</button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">الاسم الكامل</label>
                    <input
                      required
                      type="text"
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      value={formData.customer_name}
                      onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">رقم الهاتف</label>
                    <input
                      required
                      type="tel"
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">الولاية</label>
                      <select
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                        value={formData.wilaya}
                        onChange={e => setFormData({ ...formData, wilaya: e.target.value })}
                      >
                        {WILAYAS.map(w => (
                          <option key={w.code} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">البلدية</label>
                      <input
                        required
                        type="text"
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                        value={formData.commune}
                        onChange={e => setFormData({ ...formData, commune: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">نوع التوصيل</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className={`p-2 rounded-lg border text-xs text-center ${formData.delivery_type === 'home' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200'}`}
                        onClick={() => setFormData({ ...formData, delivery_type: 'home' })}
                      >
                        للمنزل ({selectedWilayaObj.homePrice} د.ج)
                      </button>
                      <button
                        type="button"
                        className={`p-2 rounded-lg border text-xs text-center ${formData.delivery_type === 'desk' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200'}`}
                        onClick={() => setFormData({ ...formData, delivery_type: 'desk' })}
                      >
                        للمكتب ({selectedWilayaObj.deskPrice} د.ج)
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg space-y-1 text-xs">
                    <div className="flex justify-between"><span>المجموع:</span><span>{itemsTotal} د.ج</span></div>
                    <div className="flex justify-between"><span>التوصيل:</span><span>{deliveryFee} د.ج</span></div>
                    <div className="flex justify-between font-bold text-slate-800 text-sm pt-1 border-t"><span>الإجمالي:</span><span>{grandTotal} د.ج</span></div>
                  </div>

                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-700 transition"
                  >
                    {isSubmitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-center">دخول لوحة التحكم</h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="password"
                placeholder="كلمة المرور"
                className="w-full border p-2 rounded-lg text-sm"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm">دخول</button>
                <button type="button" onClick={() => setShowAdminLogin(false)} className="px-4 border rounded-lg text-sm">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
