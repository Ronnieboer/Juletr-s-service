import ProductCard from './ProductCard';

export default function ProductList({ products, onUpdate }) {
    if (products.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--text-muted)' }}>
                No items yet. Add your first purchase above!
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'var(--space-md)'
        }}>
            {products.map(product => (
                <ProductCard key={product.id} product={product} onUpdate={onUpdate} />
            ))}
        </div>
    );
}
