export const emailRegex = /^[\w.\-+]+@[\w.\-]+\.[A-Za-z]{2,}$/;
export const phoneRegex = /^[6-9]\d{9}$/;

export function normalizePhone(value = '') {
  const cleaned = String(value).replace(/[\s\-+]/g, '');
  if (cleaned.startsWith('91') && cleaned.length > 10) {
    return cleaned.slice(-10);
  }
  return cleaned;
}

export function required(message = 'This field is required') {
  return { required: true, message };
}

export function emailRule() {
  return {
    validator(_, value) {
      if (!value || !String(value).trim()) {
        return Promise.reject(new Error('Email is required'));
      }
      if (!emailRegex.test(String(value).trim())) {
        return Promise.reject(new Error('Enter a valid email'));
      }
      return Promise.resolve();
    },
  };
}

export function phoneRule() {
  return {
    validator(_, value) {
      const digits = normalizePhone(value);
      if (!digits) return Promise.reject(new Error('Phone is required'));
      if (!phoneRegex.test(digits)) {
        return Promise.reject(new Error('Enter a valid 10-digit mobile number'));
      }
      return Promise.resolve();
    },
  };
}

export function emailOrPhoneRule() {
  return {
    validator(_, value) {
      const raw = String(value || '').trim();
      if (!raw) return Promise.reject(new Error('Email or phone is required'));
      if (raw.includes('@')) {
        if (!emailRegex.test(raw)) {
          return Promise.reject(new Error('Enter a valid email'));
        }
        return Promise.resolve();
      }
      const digits = normalizePhone(raw);
      if (!phoneRegex.test(digits)) {
        return Promise.reject(new Error('Enter a valid 10-digit mobile number'));
      }
      return Promise.resolve();
    },
  };
}

export function passwordRule(min = 6) {
  return {
    validator(_, value) {
      if (!value) return Promise.reject(new Error('Password is required'));
      if (String(value).length < min) {
        return Promise.reject(new Error(`Password must be at least ${min} characters`));
      }
      return Promise.resolve();
    },
  };
}

export function nameRule(label = 'Name') {
  return {
    validator(_, value) {
      const v = String(value || '').trim();
      if (!v) return Promise.reject(new Error(`${label} is required`));
      if (v.length < 2) return Promise.reject(new Error(`${label} must be at least 2 characters`));
      if (v.length > 50) return Promise.reject(new Error(`${label} must be under 50 characters`));
      return Promise.resolve();
    },
  };
}

export function titleRule() {
  return {
    validator(_, value) {
      const v = String(value || '').trim();
      if (!v) return Promise.reject(new Error('Title is required'));
      if (v.length < 3) return Promise.reject(new Error('Title must be at least 3 characters'));
      if (v.length > 100) return Promise.reject(new Error('Title must be under 100 characters'));
      return Promise.resolve();
    },
  };
}

export function positiveNumberRule(label = 'Value') {
  return {
    validator(_, value) {
      if (value === undefined || value === null || value === '') {
        return Promise.reject(new Error(`${label} is required`));
      }
      const n = Number(value);
      if (Number.isNaN(n)) return Promise.reject(new Error(`Enter a valid ${label.toLowerCase()}`));
      if (n <= 0) return Promise.reject(new Error(`${label} must be greater than 0`));
      return Promise.resolve();
    },
  };
}

export function nonNegativeIntRule(label = 'Value') {
  return {
    validator(_, value) {
      if (value === undefined || value === null || value === '') {
        return Promise.reject(new Error(`${label} is required`));
      }
      const n = Number(value);
      if (!Number.isInteger(n) && !Number.isInteger(Number(value))) {
        // InputNumber may give float; accept whole numbers
      }
      if (Number.isNaN(n)) return Promise.reject(new Error(`Enter a valid ${label.toLowerCase()}`));
      if (n < 0) return Promise.reject(new Error(`${label} cannot be negative`));
      if (!Number.isInteger(n)) return Promise.reject(new Error(`${label} must be a whole number`));
      return Promise.resolve();
    },
  };
}

export function yearRule() {
  const now = new Date().getFullYear();
  return {
    validator(_, value) {
      if (value === undefined || value === null || value === '') {
        return Promise.reject(new Error('Year is required'));
      }
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1980 || n > now) {
        return Promise.reject(new Error(`Year must be between 1980 and ${now}`));
      }
      return Promise.resolve();
    },
  };
}

export function urlOptionalRule() {
  return {
    validator(_, value) {
      const v = String(value || '').trim();
      if (!v) return Promise.resolve();
      try {
        // allow relative paths like /uploads/...
        if (v.startsWith('/')) return Promise.resolve();
        // eslint-disable-next-line no-new
        new URL(v);
        return Promise.resolve();
      } catch {
        return Promise.reject(new Error('Enter a valid URL'));
      }
    },
  };
}
