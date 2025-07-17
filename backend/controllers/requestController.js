const pool = require('../server');
const { sendEmail } = require('../../utils/mailer');

// Submit a new request
exports.createRequest = async (req, res) => {
  const { equipment_id, quantity, reason } = req.body;
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `INSERT INTO requests (user_id, equipment_id, quantity, reason)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, equipment_id, quantity, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all requests (admin only)
exports.getAllRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name, e.name AS equipment_name
       FROM requests r
       JOIN users u ON r.user_id = u.id
       JOIN equipment e ON r.equipment_id = e.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get my requests (for logged-in user)
exports.getMyRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, e.name AS equipment_name
       FROM requests r
       JOIN equipment e ON r.equipment_id = e.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve or reject a request (admin only)
exports.updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      `UPDATE requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Request not found' });

    // Get user email
    const userResult = await pool.query(
      `SELECT email, name FROM users WHERE id = $1`,
      [result.rows[0].user_id]
    );

    const { email, name } = userResult.rows[0];
    const subject = `Your Equipment Request (#${id}) has been ${status}`;
    const message = `Hello ${name},\n\nYour equipment request has been ${status}.\n\nRegards,\nIT Department`;

    await sendEmail(email, subject, message);

    res.json({ message: `Request ${status}`, request: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
