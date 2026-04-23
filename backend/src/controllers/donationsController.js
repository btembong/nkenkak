const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { sendEmail } = require('../services/email');

const generateRef = () => 'NN-' + Date.now() + '-' + Math.random().toString(36).substr(2,6).toUpperCase();

// POST /api/donations/initiate
exports.initiate = async (req, res) => {
  const { project_id, amount, currency = 'XAF', provider, donor_name, donor_email, donor_phone, message, is_anonymous } = req.body;
  const reference = generateRef();

  const result = await query(
    `INSERT INTO donations (reference, user_id, project_id, amount, currency, provider, status, donor_name, donor_email, donor_phone, message, is_anonymous)
     VALUES ($1,$2,$3,$4,$5,$6,'pending',$7,$8,$9,$10,$11) RETURNING *`,
    [reference, req.user?.id || null, project_id || null, amount, currency, provider, donor_name || null, donor_email || null, donor_phone || null, message || null, is_anonymous || false]
  );

  const donation = result.rows[0];

  // ── Payment provider routing ────────────────────────────────
  // Each returns { paymentUrl, providerRef } or throws
  let paymentData = {};
  try {
    if (provider === 'mtn_momo')      paymentData = await initMtnMomo(donation);
    else if (provider === 'orange_money') paymentData = await initOrangeMoney(donation);
    else if (provider === 'paypal')   paymentData = await initPayPal(donation);
    else if (provider === 'stripe')   paymentData = await initStripe(donation);
    else if (provider === 'bank_transfer') paymentData = { instructions: 'Bank details sent to your email.' };
  } catch (err) {
    await query('UPDATE donations SET status = \'failed\' WHERE id = $1', [donation.id]);
    return res.status(502).json({ error: 'Payment provider error: ' + err.message });
  }

  res.json({ donation: { id: donation.id, reference: donation.reference, amount, currency, provider }, ...paymentData });
};

// POST /api/donations/webhook/:provider
exports.webhook = async (req, res) => {
  const { provider } = req.params;
  // Signature verification should happen per-provider here
  const { reference, status, provider_ref } = req.body;

  const newStatus = status === 'success' ? 'completed' : 'failed';
  await query('UPDATE donations SET status = $1, provider_ref = $2, updated_at = NOW() WHERE reference = $3', [newStatus, provider_ref || null, reference]);

  if (newStatus === 'completed') {
    const don = await query('SELECT d.*, p.title AS project_title FROM donations d LEFT JOIN projects p ON p.id = d.project_id WHERE d.reference = $1', [reference]);
    if (don.rows[0]?.donor_email) {
      await sendEmail({
        to: don.rows[0].donor_email,
        subject: `Donation Receipt — ${reference}`,
        html: `<h2>Thank you for your donation!</h2>
               <p>Amount: <strong>${don.rows[0].amount.toLocaleString()} ${don.rows[0].currency}</strong></p>
               <p>Project: ${don.rows[0].project_title || 'General Fund'}</p>
               <p>Reference: ${reference}</p>`,
      }).catch(console.error);
    }
  }

  res.json({ received: true });
};

// GET /api/donations (admin)
exports.getAll = async (req, res) => {
  const { status, project_id, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let cond = [], params = [], i = 1;
  if (status)     { cond.push(`d.status = $${i++}`);     params.push(status); }
  if (project_id) { cond.push(`d.project_id = $${i++}`); params.push(project_id); }
  const where = cond.length ? 'WHERE ' + cond.join(' AND ') : '';

  const rows = await query(
    `SELECT d.*, p.title AS project_title, u.first_name || ' ' || u.last_name AS user_name
     FROM donations d
     LEFT JOIN projects p ON p.id = d.project_id
     LEFT JOIN users u ON u.id = d.user_id
     ${where} ORDER BY d.created_at DESC LIMIT $${i} OFFSET $${i+1}`,
    [...params, limit, offset]
  );
  res.json(rows.rows);
};

// GET /api/donations/my
exports.myDonations = async (req, res) => {
  const result = await query(
    `SELECT d.*, p.title AS project_title FROM donations d
     LEFT JOIN projects p ON p.id = d.project_id
     WHERE d.user_id = $1 ORDER BY d.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
};

// GET /api/donations/summary (admin)
exports.summary = async (req, res) => {
  const result = await query(`
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE status='completed'),0) AS total_raised,
      COUNT(*) FILTER (WHERE status='completed') AS total_donations,
      COUNT(DISTINCT donor_email) AS unique_donors,
      COALESCE(SUM(amount) FILTER (WHERE status='completed' AND created_at > NOW()-INTERVAL '30 days'),0) AS this_month
    FROM donations
  `);
  res.json(result.rows[0]);
};

// ── Payment stub functions (replace with real SDKs) ───────────
async function initMtnMomo(donation) {
  // TODO: MTN MoMo Collections API v1
  // const { MTN_MOMO_BASE_URL, MTN_MOMO_SUBSCRIPTION_KEY } = process.env;
  // ... real implementation
  return { message: 'MTN MoMo payment initiated. Approve on your phone.' };
}

async function initOrangeMoney(donation) {
  // TODO: Orange Money WebPay API
  return { message: 'Orange Money payment initiated.' };
}

async function initPayPal(donation) {
  // TODO: PayPal Orders v2 API
  return { message: 'PayPal order created.' };
}

async function initStripe(donation) {
  // TODO: Stripe Payment Intents
  return { clientSecret: 'pi_stub_secret' };
}
