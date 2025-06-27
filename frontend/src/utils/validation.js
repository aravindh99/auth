// Frontend validation utilities that match backend validation exactly

export const validateEmail = (email) => {
  // Matches backend validateEmail function
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Matches backend: At least 8 characters, contains letters and numbers
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateCustomProjectId = (customProjectId) => {
  // Matches backend: Only alphanumeric characters, hyphens, and underscores, 3-20 characters
  const projectIdRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return projectIdRegex.test(customProjectId);
};

// Validation functions that match backend express-validator rules exactly

export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { valid: false, field: 'name', message: 'Name is required' };
  }
  if (name.length < 2 || name.length > 100) {
    return { valid: false, field: 'name', message: 'Name must be between 2 and 100 characters' };
  }
  return { valid: true };
};

export const validateEmailField = (email) => {
  if (!email || !email.trim()) {
    return { valid: false, field: 'email', message: 'Email is required' };
  }
  if (!validateEmail(email)) {
    return { valid: false, field: 'email', message: 'Please provide a valid email' };
  }
  return { valid: true };
};

export const validatePasswordField = (password) => {
  if (!password) {
    return { valid: false, field: 'password', message: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, field: 'password', message: 'Password must be at least 8 characters long' };
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
    return { valid: false, field: 'password', message: 'Password must contain at least one letter and one number' };
  }
  return { valid: true };
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { valid: false, field: 'confirmPassword', message: 'Please confirm your password' };
  }
  if (password !== confirmPassword) {
    return { valid: false, field: 'confirmPassword', message: 'Passwords do not match' };
  }
  return { valid: true };
};

export const validateCompanyName = (companyName) => {
  if (!companyName || !companyName.trim()) {
    return { valid: false, field: 'companyName', message: 'Company name is required' };
  }
  if (companyName.length < 2 || companyName.length > 100) {
    return { valid: false, field: 'companyName', message: 'Company name must be between 2 and 100 characters' };
  }
  return { valid: true };
};

export const validateRole = (role) => {
  if (!role || !role.trim()) {
    return { valid: false, field: 'role', message: 'Role is required' };
  }
  if (role.length < 2 || role.length > 50) {
    return { valid: false, field: 'role', message: 'Role must be between 2 and 50 characters' };
  }
  return { valid: true };
};

export const validateOTP = (otp) => {
  if (!otp || !otp.trim()) {
    return { valid: false, message: 'OTP is required' };
  }
  if (otp.length !== 6) {
    return { valid: false, message: 'OTP must be a 6-digit number' };
  }
  if (!/^\d{6}$/.test(otp)) {
    return { valid: false, message: 'OTP must be a 6-digit number' };
  }
  return { valid: true };
};

export const validateProjectName = (name) => {
  if (!name || !name.trim()) {
    return { valid: false, message: 'Project name is required' };
  }
  if (name.length < 2 || name.length > 100) {
    return { valid: false, message: 'Project name must be between 2 and 100 characters' };
  }
  return { valid: true };
};

export const validateProjectId = (customProjectId) => {
  if (!customProjectId || !customProjectId.trim()) {
    return { valid: false, message: 'Project ID is required' };
  }
  if (!validateCustomProjectId(customProjectId)) {
    return { valid: false, message: 'Project ID must be 3-20 characters long and contain only letters, numbers, hyphens, and underscores' };
  }
  return { valid: true };
};

export const validateProjectDescription = (description) => {
  if (description && description.length > 500) {
    return { valid: false, message: 'Description cannot exceed 500 characters' };
  }
  return { valid: true };
};

export const validateProjectIcon = (icon) => {
  if (icon && icon.length > 100) {
    return { valid: false, message: 'Icon field cannot exceed 100 characters' };
  }
  return { valid: true };
};

export const validateProjectAssignments = (assignments) => {
  if (!Array.isArray(assignments)) {
    return {
      valid: false,
      field: 'projectAssignments',
      message: 'Project assignments must be an array'
    };
  }

  if (assignments.length === 0) {
    return {
      valid: false,
      field: 'projectAssignments',
      message: 'At least one project must be assigned'
    };
  }

  for (const assignment of assignments) {
    if (!assignment.projectId) {
      return {
        valid: false,
        field: 'projectAssignments',
        message: 'Project ID is required for each assignment'
      };
    }
  }

  return { valid: true };
};

// Comprehensive form validation functions

export const validateSuperAdminRegistration = (formData) => {
  const { name, email, password, confirmPassword, companyName } = formData;
  
  const nameValidation = validateName(name);
  if (!nameValidation.valid) return nameValidation;
  
  const emailValidation = validateEmailField(email);
  if (!emailValidation.valid) return emailValidation;
  
  const passwordValidation = validatePasswordField(password);
  if (!passwordValidation.valid) return passwordValidation;
  
  const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);
  if (!confirmPasswordValidation.valid) return confirmPasswordValidation;
  
  const companyNameValidation = validateCompanyName(companyName);
  if (!companyNameValidation.valid) return companyNameValidation;
  
  return { valid: true };
};

export const validateProjectCreation = (formData) => {
  const sanitized = sanitizeFormData(formData);
  const { customProjectId, name, description, projectUrl, icon } = sanitized;
  
  const projectIdValidation = validateProjectId(customProjectId);
  if (!projectIdValidation.valid) return projectIdValidation;
  
  const nameValidation = validateProjectName(name);
  if (!nameValidation.valid) return nameValidation;
  
  const descriptionValidation = validateProjectDescription(description);
  if (!descriptionValidation.valid) return descriptionValidation;
  
  const urlValidation = validateUrl(projectUrl);
  if (!urlValidation.valid) return urlValidation;
  
  const iconValidation = validateProjectIcon(icon);
  if (!iconValidation.valid) return iconValidation;
  
  return { valid: true };
};

export const validateCompanyAddress = (companyAddress) => {
  if (companyAddress && companyAddress.length > 1000) {
    return { valid: false, field: 'companyAddress', message: 'Company address cannot exceed 1000 characters' };
  }
  return { valid: true };
};

export const validateCompanyPhone = (companyPhone) => {
  if (companyPhone && (companyPhone.length > 20 || !/^[\d\s\-\+\(\)]+$/.test(companyPhone))) {
    return { valid: false, field: 'companyPhone', message: 'Please provide a valid phone number (max 20 characters)' };
  }
  return { valid: true };
};

export const validateSubUserLimit = (limit) => {
  if (limit === undefined || limit === null || limit === '') {
    return { valid: false, field: 'subUserLimit', message: 'Sub-user limit is required' };
  }
  const numLimit = Number(limit);
  if (isNaN(numLimit) || numLimit < 1) {
    return { valid: false, field: 'subUserLimit', message: 'Sub-user limit must be a positive number' };
  }
  if (numLimit > 100) {
    return { valid: false, field: 'subUserLimit', message: 'Sub-user limit cannot exceed 100' };
  }
  return { valid: true };
};

export const validateProjectAdminCreation = (formData) => {
  const sanitized = sanitizeFormData(formData);
  const { 
    name, 
    email, 
    password, 
    confirmPassword, 
    companyName, 
    companyAddress, 
    companyPhone,
    countryCode,
    projectAssignments, 
    subUserLimit 
  } = sanitized;
  
  const nameValidation = validateName(name);
  if (!nameValidation.valid) return nameValidation;
  
  const emailValidation = validateEmailField(email);
  if (!emailValidation.valid) return emailValidation;
  
  const passwordValidation = validatePasswordField(password);
  if (!passwordValidation.valid) return passwordValidation;
  
  const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);
  if (!confirmPasswordValidation.valid) return confirmPasswordValidation;
  
  const companyNameValidation = validateCompanyName(companyName);
  if (!companyNameValidation.valid) return companyNameValidation;
  
  const companyAddressValidation = validateCompanyAddress(companyAddress);
  if (!companyAddressValidation.valid) return companyAddressValidation;
  
  const companyPhoneValidation = validatePhoneNumber(companyPhone);
  if (!companyPhoneValidation.valid) return companyPhoneValidation;
  
  const countryCodeValidation = validateCountryCode(countryCode);
  if (!countryCodeValidation.valid) return countryCodeValidation;
  
  const projectAssignmentsValidation = validateProjectAssignments(projectAssignments);
  if (!projectAssignmentsValidation.valid) return projectAssignmentsValidation;
  
  const subUserLimitValidation = validateSubUserLimit(subUserLimit);
  if (!subUserLimitValidation.valid) return subUserLimitValidation;
  
  return { valid: true };
};

export const validateSubUserCreation = (formData) => {
  const { name, email, password, confirmPassword, role, projectAssignments } = formData;
  
  const nameValidation = validateName(name);
  if (!nameValidation.valid) return nameValidation;
  
  const emailValidation = validateEmailField(email);
  if (!emailValidation.valid) return emailValidation;
  
  const passwordValidation = validatePasswordField(password);
  if (!passwordValidation.valid) return passwordValidation;
  
  const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);
  if (!confirmPasswordValidation.valid) return confirmPasswordValidation;
  
  const roleValidation = validateRole(role);
  if (!roleValidation.valid) return roleValidation;
  
  const projectAssignmentsValidation = validateProjectAssignments(projectAssignments);
  if (!projectAssignmentsValidation.valid) return projectAssignmentsValidation;
  
  return { valid: true };
};

export const validateLogin = (formData) => {
  const { email, password } = formData;
  
  const emailValidation = validateEmailField(email);
  if (!emailValidation.valid) return emailValidation;
  
  if (!password || !password.trim()) {
    return { valid: false, message: 'Password is required' };
  }
  
  return { valid: true };
};

// Add data sanitization function
export const sanitizeFormData = (formData) => {
  const sanitized = { ...formData };
  
  // Trim all string fields
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim();
    }
  });
  
  // Handle optional fields consistently
  sanitized.companyAddress = sanitized.companyAddress || null;
  sanitized.companyPhone = sanitized.companyPhone || null;
  sanitized.description = sanitized.description || null;
  sanitized.icon = sanitized.icon || null;
  
  return sanitized;
};

// Update URL validation
export const validateUrl = (url) => {
  if (!url || !url.trim()) {
    return { valid: false, message: 'URL is required' };
  }
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, message: 'Please provide a valid URL including protocol (http:// or https://)' };
  }
};

// Update phone validation
export const validatePhoneNumber = (phone) => {
  if (!phone) return { valid: true };
  if (!/^[\d\s\-\+\(\)]+$/.test(phone)) {
    return { valid: false, field: 'companyPhone', message: 'Please provide a valid phone number' };
  }
  if (phone.length < 5 || phone.length > 20) {
    return { valid: false, field: 'companyPhone', message: 'Phone number must be between 5 and 20 characters' };
  }
  return { valid: true };
};

// Update country code validation
export const validateCountryCode = (code) => {
  if (!code) return { valid: true };
  if (!/^\+\d{1,4}$/.test(code)) {
    return { valid: false, field: 'countryCode', message: 'Please provide a valid country code (e.g., +1, +91)' };
  }
  return { valid: true };
};

// Update project validation
export const validateProject = (project) => {
  const errors = {};

  if (!project.customProjectId || !project.customProjectId.trim()) {
    errors.customProjectId = 'Project ID is required';
  } else if (!validateCustomProjectId(project.customProjectId)) {
    errors.customProjectId = 'Project ID must be 3-20 characters long and contain only letters, numbers, hyphens, and underscores';
  }

  if (!project.name || !project.name.trim()) {
    errors.name = 'Project name is required';
  } else if (project.name.length < 2 || project.name.length > 100) {
    errors.name = 'Project name must be between 2 and 100 characters';
  }

  if (project.description && project.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }

  if (project.icon && project.icon.length > 100) {
    errors.icon = 'Icon field cannot exceed 100 characters';
  }

  return errors;
}; 