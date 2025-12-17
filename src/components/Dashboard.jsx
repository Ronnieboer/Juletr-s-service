import { exportData, importData } from '../services/storage';

export default function Dashboard({ products, onDataChanged }) {
    const totalInvested = products.reduce((sum, p) => sum + (p.purchasePrice || 0), 0);

    const soldProducts = products.filter(p => p.isSold);
    const totalSold = soldProducts.reduce((sum, p) => sum + (p.salePrice || 0), 0);
    const costOfSold = soldProducts.reduce((sum, p) => sum + (p.purchasePrice || 0), 0);

    const profit = totalSold - costOfSold;
    const profitPercent = costOfSold > 0 ? ((profit / costOfSold) * 100).toFixed(1) : 0;

    const handleExport = async () => {
        const data = await exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resale-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!confirm('This will overwrite your current data. Are you sure?')) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                await importData(event.target.result);
                alert('Data restored successfully!');
                if (onDataChanged) onDataChanged(); // Need to pass this prop from App
            } catch (err) {
                console.error(err);
                alert('Failed to import data.');
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    return (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <div className="glass-panel" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Invested</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{totalInvested} kr</div>
                </div>

                <div className="glass-panel" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Sales</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{totalSold} kr</div>
                </div>

                <div className="glass-panel" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Realized Profit</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {profit} kr
                    </div>
                    <div style={{ fontSize: '0.9rem', color: profit >= 0 ? 'var(--success)' : 'var(--danger)', opacity: 0.8 }}>
                        {profitPercent}%
                    </div>
                </div>
            </div>

            {/* Savings Options */}
            <div className="glass-panel" style={{ padding: 'var(--space-sm)', display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
                <button onClick={handleExport} className="btn" style={{ fontSize: '0.9rem' }}>
                    💾 Export Backup
                </button>
                <label className="btn" style={{ fontSize: '0.9rem', cursor: 'pointer', display: 'inline-block' }}>
                    📂 Import Backup
                    <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                </label>
            </div>
        </div>
    );
}
