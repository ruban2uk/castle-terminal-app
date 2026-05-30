'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Wallet, 
  Receipt, 
  Smartphone, 
  Globe2, 
  Gift, 
  Cpu,
  Search,
  ShoppingCart,
  Printer,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  retailPrice: number;
  type: string;
  operator?: string | null;
  country?: string | null;
  fulfillmentMode: string;
}

export default function TerminalPOSPage() {
  const [screen, setScreen] = useState<'home' | 'products' | 'checkout' | 'success'>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');

  // Mock wallet balance
  const walletBalance = 1248.60;
  const todaySales = 386.40;
  const todayMargin = 31.84;

  useEffect(() => {
    // Fetch products from API
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Use mock data as fallback
      setProducts([
        { id: '1', sku: 'LEB-10-UK', name: 'Lebara £10 Top-up', description: 'UK Lebara mobile airtime top-up', retailPrice: 10.00, type: 'ETOPUP', operator: 'Lebara', country: 'GB', fulfillmentMode: 'API' },
        { id: '2', sku: 'GCC-5-INT', name: 'Global Call Card £5', description: 'International calling voucher', retailPrice: 5.00, type: 'VOUCHER', country: 'INT', fulfillmentMode: 'MANUAL_PIN' },
        { id: '3', sku: 'USA-ESIM-5GB', name: 'USA eSIM 5GB', description: 'USA travel data bundle 5GB', retailPrice: 14.99, type: 'ESIM', country: 'US', fulfillmentMode: 'API' },
        { id: '4', sku: 'NG-DATA-2GB', name: 'Nigeria Data 2GB', description: 'Nigeria mobile data bundle', retailPrice: 8.00, type: 'DATA', country: 'NG', fulfillmentMode: 'HYBRID' },
      ]);
    }
  };

  const categories = [
    { id: 'all', label: 'All', icon: ShoppingCart },
    { id: 'ETOPUP', label: 'eTopup', icon: Smartphone },
    { id: 'ESIM', label: 'eSIM', icon: Cpu },
    { id: 'VOUCHER', label: 'Voucher', icon: Globe2 },
    { id: 'GIFT_CARD', label: 'Gift Card', icon: Gift },
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.type === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.country && product.country.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setScreen('checkout');
  };

  const handleConfirmSale = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setTransactionRef(`TXN-${Date.now().toString().slice(-5)}`);
    setIsProcessing(false);
    setScreen('success');
  };

  const getFulfillmentBadge = (mode: string) => {
    switch (mode) {
      case 'API': return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">API</Badge>;
      case 'MANUAL_PIN': return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Manual PIN</Badge>;
      case 'HYBRID': return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Hybrid</Badge>;
      default: return <Badge>{mode}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-md mx-auto min-h-screen bg-zinc-50 text-zinc-900 relative">
        
        {/* Header */}
        <div className="bg-zinc-950 text-white p-5 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">Castle S1F4 Terminal</p>
              <h2 className="text-xl font-semibold">
                {screen === 'home' && 'Retailer POS'}
                {screen === 'products' && 'Sell Product'}
                {screen === 'checkout' && 'Confirm Sale'}
                {screen === 'success' && 'Sale Complete'}
              </h2>
            </div>
            {screen !== 'home' && (
              <button 
                onClick={() => setScreen(screen === 'checkout' ? 'products' : 'home')}
                className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Home Screen */}
        {screen === 'home' && (
          <div className="p-4 space-y-4">
            {/* Wallet Card */}
            <Card className="rounded-3xl shadow-sm border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">Wallet balance</p>
                    <p className="text-3xl font-bold">£{walletBalance.toFixed(2)}</p>
                  </div>
                  <Wallet className="h-9 w-9 text-zinc-700" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
                  <div className="rounded-2xl bg-zinc-100 p-3">
                    <p className="text-zinc-500">Today sales</p>
                    <p className="font-semibold">£{todaySales.toFixed(2)}</p>
                  </div>
                  <div className="rounded-2xl bg-zinc-100 p-3">
                    <p className="text-zinc-500">Today margin</p>
                    <p className="font-semibold">£{todayMargin.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Grid */}
            <div className="grid grid-cols-2 gap-3">
              {categories.slice(1).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedCategory(id);
                    setScreen('products');
                  }}
                  className="rounded-3xl bg-white p-4 text-left shadow-sm border-0 hover:bg-zinc-50 transition-colors"
                >
                  <Icon className="h-7 w-7 mb-3 text-zinc-700" />
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {products.filter(p => p.type === id).length} products
                  </p>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="rounded-2xl h-12"
                onClick={() => setScreen('products')}
              >
                <ShoppingCart className="h-4 w-4 mr-2" /> New Sale
              </Button>
              <Button variant="outline" className="rounded-2xl h-12">
                <Receipt className="h-4 w-4 mr-2" /> History
              </Button>
            </div>
          </div>
        )}

        {/* Products Screen */}
        {screen === 'products' && (
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search products..."
                className="pl-10 rounded-2xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`px-3 py-2 rounded-full whitespace-nowrap text-sm ${
                    selectedCategory === id
                      ? 'bg-zinc-950 text-white'
                      : 'bg-white border'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Product List */}
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="rounded-3xl shadow-sm border-0 cursor-pointer hover:bg-zinc-50 transition-colors"
                  onClick={() => handleProductSelect(product)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          {getFulfillmentBadge(product.fulfillmentMode)}
                          <Badge variant="outline">{product.type}</Badge>
                        </div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {product.country && `${product.country} · `}
                          {product.operator && `${product.operator} · `}
                          {product.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">£{product.retailPrice.toFixed(2)}</p>
                        <ChevronRight className="h-5 w-5 mt-7 ml-auto text-zinc-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-500">No products found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Checkout Screen */}
        {screen === 'checkout' && selectedProduct && (
          <div className="p-4 space-y-4">
            <Card className="rounded-3xl shadow-sm border-0">
              <CardContent className="p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Product</span>
                  <span className="font-semibold">{selectedProduct.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Selling price</span>
                  <span className="font-semibold">£{selectedProduct.retailPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Wallet before</span>
                  <span>£{walletBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Wallet after</span>
                  <span>£{(walletBalance - selectedProduct.retailPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-zinc-500">Retailer margin</span>
                  <span className="text-emerald-700 font-semibold">£{(selectedProduct.retailPrice * 0.12).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-3xl bg-white border-0 shadow-sm p-4">
              <p className="text-sm text-zinc-500 mb-2">Customer mobile/email optional</p>
              <Input 
                placeholder="Enter customer contact"
                className="rounded-2xl"
              />
            </div>

            <div className="rounded-3xl bg-white border-0 shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">Print voucher</p>
                <p className="text-sm text-zinc-500">Use Castle S1F4 thermal printer</p>
              </div>
              <div className="h-7 w-12 rounded-full bg-zinc-950 p-1">
                <div className="h-5 w-5 rounded-full bg-white ml-auto" />
              </div>
            </div>

            <Button 
              className="w-full h-14 rounded-2xl text-base"
              onClick={handleConfirmSale}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm & Sell'
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-2xl"
              onClick={() => setScreen('products')}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Success Screen */}
        {screen === 'success' && (
          <div className="p-5 min-h-[600px] flex flex-col justify-between">
            <div className="text-center pt-12">
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-700" />
              </div>
              <h2 className="text-2xl font-bold mt-5">Sale successful</h2>
              <p className="text-zinc-500 mt-1">{transactionRef}</p>
            </div>

            <Card className="rounded-[2rem] shadow-sm bg-white border-0">
              <CardContent className="p-5 space-y-4">
                <div className="text-center border-b pb-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">
                    {selectedProduct?.fulfillmentMode === 'MANUAL_PIN' ? 'Voucher PIN' : 'Confirmation'}
                  </p>
                  {selectedProduct?.fulfillmentMode === 'MANUAL_PIN' ? (
                    <p className="text-3xl font-black tracking-widest mt-2">8492 1120 7733</p>
                  ) : (
                    <p className="text-lg font-semibold mt-2">Transaction Completed</p>
                  )}
                  <p className="text-sm text-zinc-500 mt-2">
                    {selectedProduct?.name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-zinc-500">Amount</p>
                    <p className="font-semibold">£{selectedProduct?.retailPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Provider</p>
                    <p className="font-semibold">
                      {selectedProduct?.fulfillmentMode === 'API' ? 'DT One' : 'Manual PIN'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button className="w-full h-14 rounded-2xl">
                <Printer className="h-4 w-4 mr-2" /> Print Receipt
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-2xl"
                onClick={() => {
                  setScreen('home');
                  setSelectedProduct(null);
                }}
              >
                New Sale
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2">
          <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
            {[
              { icon: Wallet, label: 'Home', screen: 'home' as const },
              { icon: ShoppingCart, label: 'Sell', screen: 'products' as const },
              { icon: Receipt, label: 'History', screen: 'products' as const },
              { icon: Wallet, label: 'Wallet', screen: 'home' as const },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="rounded-xl p-2 text-center text-xs text-zinc-600 hover:bg-zinc-50"
                onClick={() => setScreen('home')}
              >
                <Icon className="h-5 w-5 mx-auto mb-1" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
