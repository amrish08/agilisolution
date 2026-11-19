CREATE TABLE IF NOT EXISTS bookings (
 id TEXT PRIMARY KEY,
 service TEXT NOT NULL,
 name TEXT NOT NULL,
 phone TEXT NOT NULL,
 address TEXT NOT NULL,
 preferred_date TEXT NOT NULL,
 preferred_time TEXT NOT NULL,
 issue TEXT,
 amount_paise INTEGER NOT NULL,
 status TEXT NOT NULL DEFAULT 'payment_pending',
 razorpay_order_id TEXT,
 razorpay_payment_id TEXT,
 created_at TEXT NOT NULL,
 paid_at TEXT
);
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings(created_at);
