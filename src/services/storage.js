import { openDB } from 'idb';

const DB_NAME = 'resale-tracker-db';
const STORE_NAME = 'products';

export async function initDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('createdAt', 'createdAt');
            }
        },
    });
}

// Helper to convert Blob/File to ArrayBuffer
function blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });
}

// Helper to convert Blob to Base64 (for Export)
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Helper to convert Base64 to Blob (for Import)
async function base64ToBlob(base64) {
    const res = await fetch(base64);
    return res.blob();
}

export async function getProducts() {
    const db = await initDB();
    const products = await db.getAllFromIndex(STORE_NAME, 'createdAt');
    const reversed = products.reverse();

    // Hydrate: Convert stored { buffer, type } back to Blob for the UI
    return reversed.map(p => {
        if (p.image && p.image.buffer && p.image.type) {
            return {
                ...p,
                image: new Blob([p.image.buffer], { type: p.image.type })
            };
        }
        // Handle legacy Blobs or null
        return p;
    });
}

async function triggerAutoSave() {
    if (window.electron && window.electron.saveBackup) {
        const data = await exportData();
        window.electron.saveBackup(data);
    }
}

export async function addProduct(product) {
    const db = await initDB();

    // Process image to ArrayBuffer for robust storage
    let processedImage = null;
    if (product.image instanceof Blob) {
        processedImage = {
            buffer: await blobToArrayBuffer(product.image),
            type: product.image.type
        };
    }

    const newProduct = {
        ...product,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        isSold: false,
        salePrice: null,
        image: processedImage
    };
    await db.add(STORE_NAME, newProduct);
    await triggerAutoSave();
    return {
        ...newProduct,
        image: product.image // Return original Blob for immediate UI update
    };
}

export async function updateProduct(product) {
    const db = await initDB();

    // Check if image is a Blob (newly updated) or already processed object
    let imageToStore = product.image;
    if (product.image instanceof Blob) {
        imageToStore = {
            buffer: await blobToArrayBuffer(product.image),
            type: product.image.type
        };
    }

    const productToSave = {
        ...product,
        image: imageToStore
    };

    await db.put(STORE_NAME, productToSave);
    await triggerAutoSave();
    return product; // Return original for UI
}

export async function deleteProduct(id) {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
    await triggerAutoSave();
}

export async function exportData() {
    const products = await getProducts(); // This gets them as Blobs
    // We need to convert Blobs/Files to base64 to store in JSON
    const serializableProducts = await Promise.all(products.map(async (p) => {
        let imageBase64 = null;
        if (p.image instanceof Blob) {
            imageBase64 = await blobToBase64(p.image);
        }
        return {
            ...p,
            image: imageBase64
        };
    }));
    return JSON.stringify(serializableProducts, null, 2);
}

export async function importData(jsonData) {
    const products = JSON.parse(jsonData);
    const db = await initDB();

    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.store.clear();

    for (const p of products) {
        let imageObject = null;
        if (p.image && typeof p.image === 'string') {
            // Import as ArrayBuffer directly if possible, or Blob then ArrayBuffer
            const blob = await base64ToBlob(p.image);
            imageObject = {
                buffer: await blobToArrayBuffer(blob),
                type: blob.type
            };
        }

        await tx.store.add({
            ...p,
            image: imageObject
        });
    }
    await tx.done;
}
