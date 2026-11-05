/**
 * Client-side validation utilities for PULSE
 */

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain both letters and numbers';
  }
  return null;
}

export function validatePollForm(formData) {
  const errors = {};

  if (!formData.question || !formData.question.trim()) {
    errors.question = 'Poll question is required';
  } else if (formData.question.trim().length < 5) {
    errors.question = 'Question must be at least 5 characters';
  } else if (formData.question.trim().length > 300) {
    errors.question = 'Question cannot exceed 300 characters';
  }

  if (formData.description && formData.description.length > 1000) {
    errors.description = 'Description cannot exceed 1000 characters';
  }

  const validOptions = (formData.options || []).map((o) => (typeof o === 'string' ? o.trim() : (o.text || '').trim()));
  const nonEmptyOptions = validOptions.filter(Boolean);

  if (nonEmptyOptions.length < 2) {
    errors.options = 'At least 2 options are required';
  }

  const uniqueOptions = new Set(nonEmptyOptions.map((o) => o.toLowerCase()));
  if (uniqueOptions.size !== nonEmptyOptions.length) {
    errors.options = 'Options must be unique (no duplicates)';
  }

  if (formData.expires_at) {
    const expDate = new Date(formData.expires_at);
    if (isNaN(expDate.getTime())) {
      errors.expires_at = 'Invalid expiration date';
    } else if (expDate.getTime() <= Date.now() + 60 * 1000) {
      errors.expires_at = 'Expiration date must be at least 1 minute in the future';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

