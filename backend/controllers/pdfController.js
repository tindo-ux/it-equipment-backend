const PDFDocument = require('pdfkit');
const pool = require('../server');

exports.generatePDFReport = async (req, res) => {
  const { status, from, to } = req.query;

  const doc = new PDFDocument();
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=equipment_report.pdf',
      'Content-Length': pdfData.length,
    });
    res.end(pdfData);
  });

  try {
    // Base query
    let query = `SELECT r.*, u.name AS user_name, e.name AS equipment_name 
                 FROM requests r
                 JOIN users u ON r.user_id = u.id
                 JOIN equipment e ON r.equipment_id = e.id`;
    let conditions = [];
    let params = [];

    if (status) {
      params.push(status);
      conditions.push(`r.status = $${params.length}`);
    }

    if (from && to) {
      params.push(from);
      params.push(to);
      conditions.push(`r.created_at BETWEEN $${params.length - 1} AND $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await pool.query(query, params);

    doc.fontSize(16).text('Equipment Request Report', { align: 'center' });
    doc.moveDown();

    result.rows.forEach(row => {
      doc.fontSize(12).text(
        `ID: ${row.id} | User: ${row.user_name} | Equipment: ${row.equipment_name} | Qty: ${row.quantity} | Status: ${row.status} | Date: ${new Date(row.created_at).toLocaleDateString()}`
      );
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
