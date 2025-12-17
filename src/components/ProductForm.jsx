import { useState, useRef } from 'react';
import { addProduct } from '../services/storage';

export default function ProductForm({ onProductAdded }) {
    const [description, setDescription] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description || !purchasePrice) return;

        // Default image placeholder if none? Or require one.
        // Let's require one for visual appeal, or handle null gracefully.

        await addProduct({
            description,
            purchasePrice: Number(purchasePrice),
            image
        });

        setDescription('');
        setPurchasePrice('');
        setImage(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (onProductAdded) onProductAdded();
    };

    return (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ marginBottom: 'var(--space-md)', color: 'var(--primary)' }}>Add New Item</h2>

            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        width: '100px',
                        height: '100px',
                        border: '2px dashed var(--glass-border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundImage: preview ? `url(${preview})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0,
                        overflow: 'hidden'
                    }}
                >
                    {!preview && <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>+</span>}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    <input
                        type="text"
                        placeholder="Product Description (e.g. Vintage Nike Jacket)"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                    />
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <input
                            type="number"
                            placeholder="Purchase Price (kr)"
                            value={purchasePrice}
                            onChange={e => setPurchasePrice(e.target.value)}
                            required
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
