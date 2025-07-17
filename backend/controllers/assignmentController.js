const pool = require('../server');

// Assign equipment to a user
exports.assignEquipment = async (req, res) => {
  const { user_id, equipment_id, quantity, request_id, notes } = req.body;

  try {
    // Check if equipment is available
    const equipmentResult = await pool.query('SELECT available_quantity FROM equipment WHERE id = $1', [equipment_id]);
    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    if (equipmentResult.rows[0].available_quantity < quantity) {
      return res.status(400).json({ error: 'Not enough equipment in stock' });
    }

    // Create assignment
    const result = await pool.query(
      `INSERT INTO assignments (user_id, equipment_id, quantity, request_id, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, equipment_id, quantity, request_id, notes]
    );

    // Update available quantity
    await pool.query(
      'UPDATE equipment SET available_quantity = available_quantity - $1 WHERE id = $2',
      [quantity, equipment_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS user_name, e.name AS equipment_name
       FROM assignments a
       JOIN users u ON a.user_id = u.id
       JOIN equipment e ON a.equipment_id = e.id
       ORDER BY a.assigned_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
