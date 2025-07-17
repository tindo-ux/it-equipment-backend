const pool = require('../server');

// Log new maintenance issue
exports.reportIssue = async (req, res) => {
  const { equipment_id, issue } = req.body;
  const reported_by = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO maintenance (equipment_id, reported_by, issue)
       VALUES ($1, $2, $3) RETURNING *`,
      [equipment_id, reported_by, issue]
    );
    res.status(201).json({ message: 'Issue reported', maintenance: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update maintenance status/notes
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE maintenance 
       SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 RETURNING *`,
      [status, notes, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Maintenance record not found' });
    res.json({ message: 'Maintenance updated', maintenance: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all maintenance logs
exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, e.name AS equipment_name, u.name AS reporter
       FROM maintenance m
       LEFT JOIN equipment e ON m.equipment_id = e.id
       LEFT JOIN users u ON m.reported_by = u.id
       ORDER BY m.reported_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
