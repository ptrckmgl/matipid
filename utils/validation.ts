/**
 * Validation utilities for data integrity
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate transaction data before database operations
 */
export function validateTransaction(data: {
  amount: number;
  category: string;
  date: string;
  type: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Amount validation
  if (!data.amount || data.amount <= 0) {
    errors.push({
      field: "amount",
      message: "Amount must be greater than 0",
    });
  }

  if (data.amount > 999999999) {
    errors.push({
      field: "amount",
      message: "Amount is too large",
    });
  }

  // Category validation
  if (!data.category || data.category.trim() === "") {
    errors.push({
      field: "category",
      message: "Category is required",
    });
  }

  // Date validation
  if (!data.date) {
    errors.push({
      field: "date",
      message: "Date is required",
    });
  } else {
    const dateObj = new Date(data.date);
    if (isNaN(dateObj.getTime())) {
      errors.push({
        field: "date",
        message: "Invalid date format",
      });
    }
  }

  // Type validation
  if (!data.type || (data.type !== "expense" && data.type !== "income")) {
    errors.push({
      field: "type",
      message: "Type must be 'expense' or 'income'",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate category data
 */
export function validateCategory(data: { name: string; type: string; color: string; icon: string }): ValidationResult {
  const errors: ValidationError[] = [];

  // Name validation
  if (!data.name || data.name.trim() === "") {
    errors.push({
      field: "name",
      message: "Category name is required",
    });
  }

  if (data.name && data.name.length > 50) {
    errors.push({
      field: "name",
      message: "Category name is too long (max 50 characters)",
    });
  }

  // Type validation
  if (!data.type || (data.type !== "expense" && data.type !== "income")) {
    errors.push({
      field: "type",
      message: "Type must be 'expense' or 'income'",
    });
  }

  // Color validation (hex format)
  if (!data.color || !/^#[0-9A-F]{6}$/i.test(data.color)) {
    errors.push({
      field: "color",
      message: "Color must be a valid hex code (e.g., #FF0000)",
    });
  }

  // Icon validation
  if (!data.icon || data.icon.trim() === "") {
    errors.push({
      field: "icon",
      message: "Icon is required",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate budget data
 */
export function validateBudget(data: { categoryId: string; limitAmount: number; month: string }): ValidationResult {
  const errors: ValidationError[] = [];

  // Category ID validation
  if (!data.categoryId || data.categoryId.trim() === "") {
    errors.push({
      field: "categoryId",
      message: "Category is required",
    });
  }

  // Limit amount validation
  if (!data.limitAmount || data.limitAmount <= 0) {
    errors.push({
      field: "limitAmount",
      message: "Budget limit must be greater than 0",
    });
  }

  if (data.limitAmount > 999999999) {
    errors.push({
      field: "limitAmount",
      message: "Budget limit is too large",
    });
  }

  // Month validation (YYYY-MM format)
  if (!data.month || !/^\d{4}-\d{2}$/.test(data.month)) {
    errors.push({
      field: "month",
      message: "Month must be in YYYY-MM format",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format validation errors for user display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return "";
  if (errors.length === 1) return errors[0].message;

  return errors.map((e) => `• ${e.message}`).join("\n");
}
