import { useState, useMemo, useEffect } from 'react';
import { updateProduct } from '../services/storage';

export default function ProductCard({ product, onUpdate }) {
    const [salePrice, setSalePrice] = useState(product.salePrice || '');
    const [isSold, setIsSold] = useState(product.isSold);

    // Sync state if product prop changes
    useEffect(() => {
        setSalePrice(product.salePrice || '');
        setIsSold(product.isSold);
    }, [product]);

    const imageUrl = useMemo(() => {
        if (product.image) {
            return URL.createObjectURL(product.image);
        }
        return null;
    }, [product.image]);

    const handleUpdate = async (newIsSold, newPrice) => {
        // If marking as sold, ensure there is a price. If unchecked, price can remain.
        // Actually, user might want to set price without marking sold.
        // We update db on every change or just on specific actions?
        // Let's update DB when toggling sold, OR when blurring the price field.

        // For this specific function, we expect explicit values or fallback to state
        const resolvedPrice = newPrice !== undefined ? newPrice : salePrice;
        const resolvedIsSold = newIsSold !== undefined ? newIsSold : isSold;

        const updatedProduct = {
            ...product,
            isSold: resolvedIsSold,
            salePrice: resolvedPrice ? Number(resolvedPrice) : null
        };

        await updateProduct(updatedProduct);
        onUpdate();
    };

    const toggleSold = () => {
        const newIsSold = !isSold;
        setIsSold(newIsSold);
        handleUpdate(newIsSold, undefined);
    };

    const handlePriceBlur = () => {
        if (salePrice != product.salePrice) {
            handleUpdate(undefined, salePrice);
        }
    };

    const profit = (Number(salePrice) || 0) - product.purchasePrice;
    const profitPercent = product.purchasePrice > 0 ? ((profit / product.purchasePrice) * 100).toFixed(1) : 0;
    const showProfit = isSold && salePrice;

    return (
        <div className="glass-panel" style={{
            padding: 'var(--space-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                aspectRatio: '1',
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 'var(--radius-sm)',
                backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }} />

            <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', fontWeight: 600 }}>{product.description}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                    Bought: {product.purchasePrice} kr
                </p>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                        Sale Price
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="number"
                            placeholder="0"
                            value={salePrice}
                            onChange={e => setSalePrice(e.target.value)}
                            onBlur={handlePriceBlur}
                            style={{ marginBottom: 0, padding: '0.4rem', flex: 1 }}
                        />
                        <button
                            className={isSold ? "btn-primary" : "btn"}
                            type="button"
                            onClick={toggleSold}
                            style={{
                                padding: '0.4rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--glass-border)',
                                background: isSold ? 'var(--success)' : 'var(--glass-surface)',
                                color: isSold ? 'black' : 'var(--text-main)',
                                cursor: 'pointer',
                                minWidth: '60px',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}
                        >
                            {isSold ? 'SOLD' : 'SELL'}
                        </button>
                    </div>
                </div>

                {showProfit && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Profit:</span>
                        <span style={{ fontWeight: 600, color: profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {profit} kr ({profitPercent}%)
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

