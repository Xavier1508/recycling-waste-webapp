const db = require('../config/database');

const getActiveCatalogItems = async (req, res) => {
    const query = `
        SELECT catalog_id, item_name, item_type, points_required, item_value, 
               description, image_url, stock_quantity 
        FROM catalog_items 
        WHERE is_active = TRUE 
        ORDER BY points_required ASC
    `;
    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error('Error fetching active catalog items:', err);
        res.status(500).json({ error: 'Gagal mengambil data katalog.' });
    }
};

const getCatalogItemById = async (req, res) => {
    const { catalog_id } = req.params;
    const query = 'SELECT * FROM catalog_items WHERE catalog_id = ?';
    try {
        const [results] = await db.query(query, [catalog_id]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Item katalog tidak ditemukan.' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error fetching catalog item by ID:', err);
        res.status(500).json({ error: 'Kesalahan database.' });
    }
};

module.exports = {
    getActiveCatalogItems,
    getCatalogItemById
};