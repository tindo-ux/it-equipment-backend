const pool = require('../server');

// Checkout equipment
exports.checkout = async (req, res) => {
  const { equipment_id, quantity, due_date, notes } = req.body;
  const user_id = req.user.id;

  try {
    const eq = await pool.query('SELECT available_quantity FROM equipment WHERE id = $1', [equipment_id]);
    if (eq.rows.length === 0) return res.status(404).json({ error: 'Equipment not found' });

    if (eq.rows[0].available_quantity < quantity) {
      return res.status(400).json({ error: 'Not enough available quantity' });
    }

    const result = await pool.query(
      `INSERT INTO checkouts (user_id, equipment_id, quantity, due_date, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, equipment_id, quantity, due_date, notes]
    );

    await pool.query(
      `UPDATE equipment SET available_quantity = available_quantity - $1 WHERE id = $2`,
      [quantity, equipment_id]
    );

    res.status(201).json({ message: 'Equipment checked out', checkout: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Return equipment
exports.returnEquipment = async (req, res) => {
  const { id } = req.params;

  try {
    const checkout = await pool.query('SELECT * FROM checkouts WHERE id = $1', [id]);
    if (checkout.rows.length === 0) return res.status(404).json({ error: 'Checkout not found' });

    if (checkout.rows[0].status === 'returned') {
      return res.status(400).json({ error: 'Already returned' });
    }

    await pool.query(
      `UPDATE checkouts 
       SET return_date = CURRENT_DATE, status = 'returned' 
       WHERE id = $1`,
      [id]
    );

    await pool.query(
      `UPDATE equipment 
       SET available_quantity = available_quantity + $1 
       WHERE id = $2`,
      [checkout.rows[0].quantity, checkout.rows[0].equipment_id]
    );

    res.json({ message: 'Equipment returned' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all checkouts (admin view)
exports.getAllCheckouts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.name AS user_name, e.name AS equipment_name 
       FROM checkouts c
       JOIN users u ON c.user_id = u.id
       JOIN equipment e ON c.equipment_id = e.id
       ORDER BY c.checkout_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get my checkouts (user view)
exports.getMyCheckouts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, e.name AS equipment_name 
       FROM checkouts c
       JOIN equipment e ON c.equipment_id = e.id
       WHERE c.user_id = $1
       ORDER BY c.checkout_date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
