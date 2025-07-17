const pool = require('../server');

// Create a new vendor
exports.createVendor = async (req, res) => {
  const { name, contact_person, phone, email, address } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO vendors (name, contact_person, phone, email, address) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, contact_person, phone, email, address]
    );
    res.status(201).json({ message: 'Vendor created', vendor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all vendors
exports.getVendors = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vendors ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update vendor
exports.updateVendor = async (req, res) => {
  const { id } = req.params;
  const { name, contact_person, phone, email, address } = req.body;
  try {
    const result = await pool.query(
      `UPDATE vendors SET name=$1, contact_person=$2, phone=$3, email=$4, address=$5 
       WHERE id=$6 RETURNING *`,
      [name, contact_person, phone, email, address, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vendor not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete vendor
exports.deleteVendor = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vendors WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vendor not found' });
    res.json({ message: 'Vendor deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
