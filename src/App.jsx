import { useState, useEffect } from 'react';
import { getProducts } from './services/storage';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import Dashboard from './components/Dashboard';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="app-container" style={{ paddingBottom: 'var(--space-lg)' }}>
      <header style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
        <h1 style={{
          background: 'linear-gradient(to right, var(--primary), var(--secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2.5rem',
          marginBottom: 'var(--space-xs)'
        }}>
          Resale Tracker
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Track your flips and profits</p>
      </header>

      <Dashboard products={products} onDataChanged={loadData} />

      <ProductForm onProductAdded={loadData} />

      <h2 style={{ marginBottom: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>Inventory</h2>
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        <ProductList products={products} onUpdate={loadData} />
      )}
    </div>
  );
}

export default App;

