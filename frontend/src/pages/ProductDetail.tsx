import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Loader2, Package, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  stockLevel: number;
  category?: string;
  isActive: boolean;
  currency: string;
}

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Products come from SAP list; fetch all and find by code
    api.get(`/products?search=${encodeURIComponent(id)}&top=5`)
      .then(res => {
        const items = res.data?.data || [];
        const match = items.find((p: Product) => p.id === id || p.code === id) || items[0];
        if (match) setProduct(match);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
        <span className="ml-3 text-slate-500">Cargando producto...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">No se encontro el producto.</p>
        <button onClick={() => navigate('/products')} className="text-brand font-medium hover:underline">Volver a Productos</button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
            <Package className="w-16 h-16" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {product.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="text-sm font-mono text-slate-500 mb-4">{product.code}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium mb-1">Precio</p>
                <p className="text-xl font-bold text-slate-900">{fmt(product.price)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium mb-1">Stock</p>
                <p className="text-xl font-bold text-slate-900">{product.stockLevel.toLocaleString()} u.</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium mb-1">Categoria</p>
                <p className="text-xl font-bold text-slate-900">{product.category || 'General'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium mb-1">Moneda</p>
                <p className="text-xl font-bold text-slate-900">{product.currency}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
