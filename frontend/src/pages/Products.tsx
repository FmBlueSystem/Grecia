import { useState, useEffect } from 'react';
import { Package, Search, Tag, DollarSign } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    code: string;
    price: number;
    stockLevel: number;
    category?: string;
    isActive: boolean;
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3000/api/products')
            .then(res => res.json())
            .then(data => {
                if (data.data) setProducts(data.data);
                setLoading(false);
            });
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Catálogo de Productos</h2>
                    <p className="text-slate-500 mt-1">Sincronizado con SAP Business One</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-slate-50">
                        Sincronizar SAP
                    </button>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-indigo-700">
                        Nuevo Producto
                    </button>
                </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-lg transition-all group">
                        <div className="h-32 bg-slate-100 rounded-xl mb-4 flex items-center justify-center text-slate-400">
                            <Package className="w-12 h-12" />
                        </div>
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                                <p className="text-xs text-slate-500 font-mono mt-1">{product.code}</p>
                            </div>
                            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg">
                                {product.stockLevel} u.
                            </span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-lg font-bold text-slate-900">{formatCurrency(product.price)}</span>
                            <button className="text-indigo-600 text-sm font-bold hover:underline">Ver Detalle</button>
                        </div>
                    </div>
                ))}
                {products.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center">
                        <div className="inline-block p-4 rounded-full bg-slate-50 mb-4">
                            <Package className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No hay productos en el catálogo.</p>
                        <button className="text-indigo-600 font-bold mt-2 hover:underline">Sincronizar ahora</button>
                    </div>
                )}
            </div>
        </div>
    );
}
