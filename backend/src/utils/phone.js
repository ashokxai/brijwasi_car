function normalizeIndianPhone(value) {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length < 10) return null;
  const last10 = digits.slice(-10);
  if (!/^[6-9]\d{9}$/.test(last10)) return null;
  return last10;
}

module.exports = { normalizeIndianPhone };
