const pool = require('../server');

// GET all equipment
exports.getAllEquipment = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single equipment
exports.getEquipmentById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE new equipment
exports.createEquipment = async (req, res) => {
  const { name, description, category, quantity, vendor_id, purchase_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO equipment 
       (name, description, category, quantity, available_quantity, vendor_id, purchase_date) 
       VALUES ($1, $2, $3, $4, $4, $5, $6) RETURNING *`,
      [name, description, category, quantity, vendor_id, purchase_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE equipment
exports.updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { name, description, category, quantity, available_quantity, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE equipment 
       SET name=$1, description=$2, category=$3, quantity=$4, available_quantity=$5, status=$6 
       WHERE id=$7 RETURNING *`,
      [name, description, category, quantity, available_quantity, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM equipment WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Equipment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
