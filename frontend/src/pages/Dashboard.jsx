import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { projectsAPI, userManagementAPI } from '../services/api';
import { 
  Users, 
  Briefcase, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Plus,
  Trash2,
  Edit,
  Shield,
  AlertCircle,
  UserPlus,
  Eye,
  EyeOff,
  BarChart3,
  X,
  Save,
  Loader2,
  Monitor,
  Building,
  UserCheck,
  FileText,
  ChevronRight,
  CheckCircle,
  Mail,
  Calendar,
  Clock,
  UserX,
  Building2
} from 'lucide-react';
import Layout from '../components/Layout';
import UserStatsPieChart from '../components/charts/UserStatsPieChart';
import TotalCountsBarChart from '../components/charts/TotalCountsBarChart';
import { 
  validateProjectCreation, 
  validateProjectAdminCreation, 
  validateSubUserCreation,
  sanitizeFormData,
  validateProjectAssignments
} from '../utils/validation';

// Update the country codes array to remove unused country property
const COUNTRY_CODES = [
  '+91', // India
  '+1',  // USA/Canada
  '+44', // UK
  '+61', // Australia
  '+86', // China
  '+81', // Japan
  '+49', // Germany
  '+33', // France
  '+39', // Italy
  '+34', // Spain
  '+7',  // Russia
  '+55', // Brazil
  '+27', // South Africa
  '+971', // UAE
  '+966', // Saudi Arabia
  '+65', // Singapore
  '+60', // Malaysia
  '+62', // Indonesia
  '+84', // Vietnam
  '+66', // Thailand
  '+82', // South Korea
  '+31', // Netherlands
  '+41', // Switzerland
  '+46', // Sweden
  '+45', // Denmark
  '+47', // Norway
  '+358', // Finland
  '+43', // Austria
  '+32', // Belgium
  '+351', // Portugal
  '+30', // Greece
  '+36', // Hungary
  '+48', // Poland
  '+420', // Czech Republic
  '+421', // Slovakia
  '+385', // Croatia
  '+386', // Slovenia
  '+40', // Romania
  '+359', // Bulgaria
  '+380', // Ukraine
  '+375', // Belarus
  '+370', // Lithuania
  '+371', // Latvia
  '+372', // Estonia
  '+90', // Turkey
  '+972', // Israel
  '+20', // Egypt
  '+234', // Nigeria
  '+254', // Kenya
  '+52', // Mexico
  '+54', // Argentina
  '+56', // Chile
  '+57', // Colombia
  '+58', // Venezuela
  '+51', // Peru
  '+593', // Ecuador
  '+595', // Paraguay
  '+598', // Uruguay
  '+591'  // Bolivia
];

// Separate modal components to prevent recreation
const CreateProjectModal = ({ 
  show, 
  onClose, 
  projectForm, 
  onFormChange, 
  onSubmit, 
  loading,
  formErrors = {}
}) => {
  if (!show) return null;
  
  return (
    <div className="modal-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-container" style={{ 
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh'
      }}>
        <div className="modal-header" style={{ 
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 className="modal-title" style={{ color: 'black', fontSize: '1.25rem', fontWeight: '600' }}>
            Create New Project
          </h3>
          <button onClick={onClose} className="modal-close" style={{ color: 'black' }}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="modal-content" style={{ padding: '1.5rem' }}>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
          <div className="form-group">
                <label className="form-label" style={{ color: 'black' }}>Project ID</label>
            <input
              type="text"
              value={projectForm.customProjectId}
              onChange={(e) => onFormChange('customProjectId', e.target.value)}
              className={`form-input ${formErrors.customProjectId ? 'border-red-500' : ''}`}
                  style={{ backgroundColor: 'white', color: 'black' }}
              placeholder="my-project-123"
              required
            />
            {formErrors.customProjectId && (
              <p className="text-red-500 text-sm mt-1">{formErrors.customProjectId}</p>
            )}
          </div>
          
          <div className="form-group">
                <label className="form-label" style={{ color: 'black' }}>Project Name</label>
            <input
              type="text"
              value={projectForm.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              className={`form-input ${formErrors.name ? 'border-red-500' : ''}`}
                  style={{ backgroundColor: 'white', color: 'black' }}
              placeholder="My Awesome Project"
              required
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>
          
          <div className="form-group">
                <label className="form-label" style={{ color: 'black' }}>Project URL</label>
            <input
              type="url"
              value={projectForm.projectUrl}
              onChange={(e) => onFormChange('projectUrl', e.target.value)}
              className={`form-input ${formErrors.projectUrl ? 'border-red-500' : ''}`}
                  style={{ backgroundColor: 'white', color: 'black' }}
              placeholder="https://example.com"
              required
            />
            {formErrors.projectUrl && (
              <p className="text-red-500 text-sm mt-1">{formErrors.projectUrl}</p>
            )}
              </div>
          </div>
          
            {/* Right Column */}
            <div className="space-y-4">
          <div className="form-group">
                <label className="form-label" style={{ color: 'black' }}>Description (Optional)</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => onFormChange('description', e.target.value)}
                  className={`form-input ${formErrors.description ? 'border-red-500' : ''}`}
                  style={{ backgroundColor: 'white', color: 'black' }}
                  placeholder="Brief description of the project"
                  rows="3"
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ color: 'black' }}>Icon (Optional)</label>
            <input
              type="text"
              value={projectForm.icon}
              onChange={(e) => onFormChange('icon', e.target.value)}
              className={`form-input ${formErrors.icon ? 'border-red-500' : ''}`}
                  style={{ backgroundColor: 'white', color: 'black' }}
              placeholder="🚀 or https://example.com/icon.png"
            />
            {formErrors.icon && (
              <p className="text-red-500 text-sm mt-1">{formErrors.icon}</p>
            )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              style={{
                backgroundColor: '#f3f4f6',
                color: 'black',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #211531, #9254de)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="btn-icon spinner" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="btn-icon" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateUserModal = ({ 
  show, 
  onClose, 
  userForm, 
  onFormChange,
  onSubmit, 
  loading, 
  projects,
  isSuperAdmin,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onToggleProjectAssignment,
  formErrors = {}
}) => {
  if (!show) return null;

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    onFormChange('companyPhone', value);
    // Update combined phone number
    onFormChange('combinedPhone', `${userForm.countryCode}${value}`);
  };

  const handleCountryCodeChange = (e) => {
    const code = e.target.value;
    onFormChange('countryCode', code);
    // Update combined phone number
    onFormChange('combinedPhone', `${code}${userForm.companyPhone}`);
  };
  
  return (
    <div className="modal-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-container" style={{ 
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '90vh'
      }}>
        <div className="modal-header" style={{ 
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 className="modal-title" style={{ color: 'black', fontSize: '1.25rem', fontWeight: '600' }}>
            {isSuperAdmin ? 'Create Project Admin' : 'Create Sub User'}
          </h3>
          <button onClick={onClose} className="modal-close" style={{ color: 'black' }}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="modal-content" style={{ padding: '1.5rem' }}>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
          <div className="form-group">
                <label className="form-label" style={{ color: 'black' }}>Full Name</label>
            <input
              type="text"
                  name="name"
              value={userForm.name}
                  onChange={onFormChange}
              className={`form-input ${formErrors.name ? 'border-red-500' : ''}`}
                  style={{ backgroundColor: 'white', color: 'black' }}
              placeholder="John Doe"
              required
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>
          
          <div className="form-group">
                <label className="form-label" style={{ color: 'black' }}>Email</label>
            <input
              type="email"
                  name="email"
              value={userForm.email}
                  onChange={onFormChange}
              className={`form-input ${formErrors.email ? 'border-red-500' : ''}`}
                  style={{ backgroundColor: 'white', color: 'black' }}
              placeholder="john@example.com"
              required
            />
            {formErrors.email && (
              <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
            )}
          </div>
          
          <div className="form-group">
                <label className="form-label" style={{ color: 'black' }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                    name="password"
                value={userForm.password}
                    onChange={onFormChange}
                className={`form-input ${formErrors.password ? 'border-red-500' : ''}`}
                    style={{ backgroundColor: 'white', color: 'black' }}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                    style={{ color: 'black' }}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
            )}
                <p className="text-sm text-gray-500 mt-1">Password must be at least 8 characters long and contain at least one letter and one number</p>
          </div>
          
          <div className="form-group">
                <label className="form-label" style={{ color: 'black' }}>Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                value={userForm.confirmPassword}
                    onChange={onFormChange}
                className={`form-input ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                    style={{ backgroundColor: 'white', color: 'black' }}
                placeholder="Confirm Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                    style={{ color: 'black' }}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
            )}
          </div>

          {!isSuperAdmin && (
            <div className="form-group">
                  <label className="form-label" style={{ color: 'black' }}>Role</label>
              <input
                type="text"
                    name="role"
                value={userForm.role}
                    onChange={onFormChange}
                className={`form-input ${formErrors.role ? 'border-red-500' : ''}`}
                    style={{ backgroundColor: 'white', color: 'black' }}
                placeholder="e.g., Developer, Tester, Designer"
                required
              />
              {formErrors.role && (
                <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>
              )}
            </div>
          )}

          {isSuperAdmin && (
            <div className="form-group">
                  <label className="form-label" style={{ color: 'black' }}>Sub-user Limit</label>
              <input
                type="number"
                    name="subUserLimit"
                value={userForm.subUserLimit}
                    onChange={onFormChange}
                className={`form-input ${formErrors.subUserLimit ? 'border-red-500' : ''}`}
                    style={{ backgroundColor: 'white', color: 'black' }}
                placeholder="5"
                min="1"
                max="100"
                required
              />
              {formErrors.subUserLimit && (
                <p className="text-red-500 text-sm mt-1">{formErrors.subUserLimit}</p>
              )}
                <p className="text-sm text-gray-500 mt-1">Number of sub-users this project admin can create (1-100)</p>
            </div>
          )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Project Assignments */}
              <div className="form-group">
                <label className="form-label" style={{ color: 'black' }}>Project Assignments</label>
                <div className="grid grid-cols-1 gap-2">
                  {projects.map(project => (
                    <div key={project.id} className="flex items-center space-x-4 bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        id={`project-${project.id}`}
                        checked={userForm.projectAssignments.some(pa => pa.projectId === project.id)}
                        onChange={() => onToggleProjectAssignment(project.id)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <label htmlFor={`project-${project.id}`} className="flex-1" style={{ color: 'black' }}>
                        <div className="flex items-center">
                          <span className="font-medium">{project.name}</span>
                          <span className="ml-2 text-sm text-gray-500">({project.customProjectId})</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          Default URL: {project.projectUrl}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

          {isSuperAdmin && (
            <>
              <div className="form-group">
                    <label className="form-label" style={{ color: 'black' }}>Company Name</label>
                <input
                  type="text"
                      name="companyName"
                  value={userForm.companyName}
                      onChange={onFormChange}
                  className={`form-input ${formErrors.companyName ? 'border-red-500' : ''}`}
                      style={{ backgroundColor: 'white', color: 'black' }}
                  placeholder="Acme Corporation"
                  required
                />
                {formErrors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.companyName}</p>
                )}
              </div>

              <div className="form-group">
                    <label className="form-label" style={{ color: 'black' }}>Company Address</label>
                <textarea
                      name="companyAddress"
                  value={userForm.companyAddress}
                      onChange={onFormChange}
                  className={`form-input ${formErrors.companyAddress ? 'border-red-500' : ''}`}
                      style={{ backgroundColor: 'white', color: 'black' }}
                  placeholder="123 Business St, City, Country"
                  rows="3"
                />
                {formErrors.companyAddress && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.companyAddress}</p>
                )}
              </div>

              <div className="form-group">
                    <label className="form-label" style={{ color: 'black' }}>Company Phone</label>
                <div className="flex space-x-2">
                  <select
                    value={userForm.countryCode}
                    onChange={handleCountryCodeChange}
                    className="form-input w-14 text-sm"
                    style={{ 
                          backgroundColor: 'white',
                          color: 'black',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.25rem center',
                      backgroundSize: '1em 1em',
                      paddingRight: '1.5rem',
                      cursor: 'pointer',
                      minWidth: '60px',
                      maxWidth: '100px',
                    }}
                  >
                    {COUNTRY_CODES.map((code) => (
                          <option key={code} value={code} style={{ backgroundColor: 'white', color: 'black' }}>
                        {code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={userForm.companyPhone}
                    onChange={handlePhoneChange}
                    className={`form-input flex-1 ${formErrors.companyPhone ? 'border-red-500' : ''}`}
                        style={{ backgroundColor: 'white', color: 'black' }}
                    placeholder="Enter phone number"
                    maxLength={15}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                {formErrors.companyPhone && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.companyPhone}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">Enter 10-15 digits only</p>
              </div>

                
                </>
                  )}
                </div>
          </div>

          <div className="modal-footer mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#f3f4f6',
                color: 'black',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #211531, #9254de)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditUserModal = ({ 
  onClose, 
  userForm, 
  onSubmit, 
  loading, 
  projects,
  onToggleProjectAssignment,
  isSuperAdmin
}) => {
  // Only super admins can edit users
  if (!isSuperAdmin) return null;

  return (
    <div className="modal-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-container" style={{ 
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh'
      }}>
        <div className="modal-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '1rem 1.5rem' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'black' }}>
            Update Project Access
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="modal-content" style={{ padding: '1.5rem' }}>
          {/* Project Assignments */}
          <div className="form-group">
            <label className="form-label" style={{ color: 'black' }}>Project Assignments</label>
            <div className="grid grid-cols-1 gap-2">
              {projects.map(project => (
                <div key={project.id} className="flex items-center space-x-4 bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    id={`project-${project.id}`}
                    checked={userForm.projectAssignments.some(pa => pa.projectId === project.id)}
                    onChange={() => onToggleProjectAssignment(project.id)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <label htmlFor={`project-${project.id}`} className="flex-1" style={{ color: 'black' }}>
                    <div className="flex items-center">
                      <span className="font-medium">{project.name}</span>
                      <span className="ml-2 text-sm text-gray-500">({project.customProjectId})</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Default URL: {project.projectUrl}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '1rem 1.5rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              style={{ marginRight: '0.5rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Update Access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CompaniesModal = ({ show, onClose, companies }) => {
  if (!show) return null;
  
  return (
    <div className="modal-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-container" style={{ 
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div className="modal-header" style={{ 
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 className="modal-title" style={{ color: 'black', fontSize: '1.25rem', fontWeight: '600' }}>
            Registered Companies
          </h3>
          <button onClick={onClose} className="modal-close" style={{ color: 'black' }}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="modal-content" style={{ padding: '1.5rem' }}>
          <div className="space-y-2">
            {companies.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>No companies registered</p>
            ) : (
              companies.map((company, index) => (
                <div key={index} style={{ 
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem'
                }}>
                  <p style={{ color: 'black', fontWeight: '500' }}>{company}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { 
    user, 
    logout, 
    isSuperAdmin, 
    isProjectAdmin,
    accessProject
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showCompaniesModal, setShowCompaniesModal] = useState(false);
  
  // Form states
  const [projectForm, setProjectForm] = useState({
    customProjectId: '',
    name: '',
    description: '',
    icon: ''
  });
  
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    companyName: '',
    companyAddress: '', // Add companyAddress field
    companyPhone: '',
    countryCode: '+91',
    combinedPhone: '',
    subUserLimit: '',
    projectAssignments: []
  });

  // Real-time validation states
  const [projectFormErrors, setProjectFormErrors] = useState({});
  const [userFormErrors, setUserFormErrors] = useState({});

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userFilter, setUserFilter] = useState('all'); // Add this new state
  const [selectedCompany, setSelectedCompany] = useState(null); // Add this new state
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false); // Add this new state
  const [editingProjectId, setEditingProjectId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    try {
      let usersData = [];
      
      // Always fetch projects for overview, projects tab, and users tab (needed for user creation)
      if (activeTab === 'overview' || activeTab === 'projects' || activeTab === 'users') {
        const projectsResponse = await projectsAPI.getAll();
        setProjects(projectsResponse.data.data?.projects || []);
      }

      // Fetch users for admins
      if ((user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (activeTab === 'users' || activeTab === 'overview')) {
        const usersResponse = await userManagementAPI.getAll();
        usersData = usersResponse.data.data?.users || [];
        
        // Ensure subUserLimit is properly set for each user
        const processedUsers = usersData.map(user => ({
          ...user,
          subUserLimit: user.subUserLimit ?? 5 // Use nullish coalescing to default to 5 if undefined or null
        }));
        
        setUsers(processedUsers);
      }
      
      // Fetch stats for Super Admin
      if (user?.role === 'SUPER_ADMIN' && activeTab === 'overview') {
        try {
          const [projectStats, userStats] = await Promise.all([
            projectsAPI.getStats(),
            userManagementAPI.getStats()
          ]);

          // Calculate unique companies from project admins only
          const projectAdmins = usersData.filter(user => user.role === 'ADMIN');
          const uniqueCompanies = new Set(
            projectAdmins
              .filter(admin => admin.companyName && admin.companyName.trim()) // Only include admins with non-empty company names
              .map(admin => admin.companyName.trim()) // Trim whitespace
          );

          setStats({
            ...projectStats.data.data,
            ...userStats.data.data,
            totalCompanies: uniqueCompanies.size // Override the totalCompanies with our calculated value
          });
        } catch (err) {
          console.error('Failed to fetch stats:', err);
        }
      }
    } catch (err) {
      console.error('❌ Failed to fetch data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]); // Removed isSuperAdmin since we use user?.role directly

  useEffect(() => {
    if (user) {
      // Set default tab based on user role
      if (user.role === 'SUB_USER') {
        setActiveTab('projects');
      } else if (activeTab === '') {
        setActiveTab('overview');
      }
      fetchData();
    }
  }, [user, activeTab, fetchData]); // Added fetchData back to dependencies

  const handleProjectAccess = async (project) => {
    try {
      const result = await accessProject(project.customProjectId);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Failed to access project:', err);
      setError('Failed to access project');
    }
  };

  const handleProjectFormChange = useCallback((field, value) => {
    // Convert project name to uppercase if it's the name field
    if (field === 'name') {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    
    setProjectForm(prev => {
      const updatedForm = { ...prev, [field]: value };
      
      // Real-time validation for the changed field
      const validation = validateProjectCreation(updatedForm);
      
      if (validation.valid) {
        setProjectFormErrors(prevErrors => ({ ...prevErrors, [field]: null }));
      } else {
        // Check which field caused the validation error
        let fieldError = null;
        if (field === 'customProjectId' && (!value || !value.trim())) {
          fieldError = 'Project ID is required';
        } else if (field === 'customProjectId' && !/^[a-zA-Z0-9_-]{3,20}$/.test(value)) {
          fieldError = 'Project ID must be 3-20 characters long and contain only letters, numbers, hyphens, and underscores';
        } else if (field === 'name') {
          if (!value || !value.trim()) {
            fieldError = 'Project name is required';
          } else if (!/^[A-Za-z]/.test(value)) {
            fieldError = 'Project name must start with a letter';
          } else if (value.length < 2 || value.length > 100) {
            fieldError = 'Project name must be between 2 and 100 characters';
          }
        } else if (field === 'description' && value && value.length > 500) {
          fieldError = 'Description cannot exceed 500 characters';
        } else if (field === 'projectUrl' && (!value || !value.trim())) {
          fieldError = 'Project URL is required';
        } else if (field === 'projectUrl' && value) {
          try {
            new URL(value);
          } catch {
            fieldError = 'Please provide a valid project URL';
          }
        } else if (field === 'icon' && value && value.length > 100) {
          fieldError = 'Icon field cannot exceed 100 characters';
        }
        
        setProjectFormErrors(prevErrors => ({ ...prevErrors, [field]: fieldError }));
      }
      
      return updatedForm;
    });
  }, []); // Removed projectForm dependency

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    // Sanitize and validate form data
    const sanitizedData = sanitizeFormData(projectForm);
    const validation = validateProjectCreation(sanitizedData);
    
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    
    setLoading(true);
    
    try {
      await projectsAPI.create(sanitizedData);
      setShowCreateProject(false);
      setProjectForm({ customProjectId: '', name: '', description: '', projectUrl: '', icon: '' });
      fetchData();
    } catch (err) {
      setError('Failed to create project: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUserFormErrors({});

    try {
      if (!isSuperAdmin()) {
        const currentSubUsers = users.filter(u => u.createdBy?.id === user.id).length;
        
        if (currentSubUsers >= user.subUserLimit) {
          setError(`Cannot create more sub-users. Current limit: ${user.subUserLimit}`);
          setLoading(false);
          return;
        }
      }

      const sanitizedData = sanitizeFormData(userForm);

      const validationErrors = isSuperAdmin() 
        ? validateProjectAdminCreation(sanitizedData)
        : validateSubUserCreation(sanitizedData);

      if (!validationErrors.valid) {
        setUserFormErrors({ [validationErrors.field]: validationErrors.message });
        setLoading(false);
        return;
      }

      const userData = {
        ...sanitizedData,
        projectAssignments: sanitizedData.projectAssignments.map(pa => ({
          projectId: Number(pa.projectId)
        })),
        role: isSuperAdmin() ? 'ADMIN' : sanitizedData.role
      };

      const response = isSuperAdmin()
        ? await userManagementAPI.createProjectAdmin(userData)
        : await userManagementAPI.createSubUser(userData);

      if (response.data.success) {
        setShowCreateUser(false);
        setUserForm({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'USER',
          companyName: '',
          companyAddress: '',
          companyPhone: '',
          countryCode: '+91',
          combinedPhone: '',
          subUserLimit: '',
          projectAssignments: []
        });
        setUserFormErrors({});
        await fetchData();
      } else {
        setError(response.data.message || 'Failed to create user');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userManagementAPI.delete(userId);
      fetchData();
    } catch (err) {
      setError('Failed to delete user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditUser = (userToEdit) => {
    // Only super admins can edit users
    if (!isSuperAdmin()) {
      return;
    }
    setEditingUser(userToEdit);
    setUserForm({
      projectAssignments: userToEdit.projects ? userToEdit.projects.map(p => ({
        projectId: p.id
      })) : []
    });
    setShowEditUser(true);
  };

  const handleUpdateUserProjects = async (e) => {
    e.preventDefault();
    // Only super admins can update user project assignments
    if (!isSuperAdmin()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setUserFormErrors({});

    try {
      const sanitizedData = sanitizeFormData(userForm);

      const validationErrors = validateProjectAssignments(sanitizedData.projectAssignments);
      if (!validationErrors.valid) {
        setUserFormErrors({ [validationErrors.field]: validationErrors.message });
        setLoading(false);
        return;
      }

      const userData = {
        projectAssignments: sanitizedData.projectAssignments.map(pa => ({
          projectId: Number(pa.projectId)
        }))
      };

      const response = await userManagementAPI.updateProjects(editingUser.id, userData);
      if (response.data.success) {
        setShowEditUser(false);
        setEditingUser(null);
        setUserForm({
          projectAssignments: []
        });
        setUserFormErrors({});
        await fetchData();
      } else {
        setError(response.data.message || 'Failed to update user access');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update user access');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (customProjectId) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await projectsAPI.delete(customProjectId);
        setProjects(prev => prev.filter(p => p.customProjectId !== customProjectId));
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  // Handle user suspension
  const handleSuspendUser = async (userId, userName) => {
    const reason = prompt(`Suspend ${userName}?\nOptional reason:`);
    if (reason !== null) { // User didn't cancel
      try {
        setLoading(true);
        const result = await userManagementAPI.suspend(userId, { reason: reason.trim() || undefined });
        
        // Refresh data to show updated suspension status for all affected users
        await fetchData();
        
        // Show success message if sub users were also suspended
        if (result.data.data.subUsersSuspended > 0) {
          alert(`${result.data.message}`);
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to suspend user');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle user unsuspension
  const handleUnsuspendUser = async (userId, userName, userRole) => {
    if (!confirm(`Unsuspend ${userName}?${userRole === 'ADMIN' ? '\n\nNote: All Sub Users created by this Project Admin will also be automatically unsuspended.' : ''}`)) {
      return;
    }
    
    try {
      setLoading(true);
      const result = await userManagementAPI.unsuspend(userId, {});
      
      // Refresh data to show updated suspension status for all affected users
      await fetchData();
      
      // Show success message if sub users were also unsuspended
      if (result.data.data.subUsersUnsuspended > 0) {
        alert(`${result.data.message}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to unsuspend user');
    } finally {
      setLoading(false);
    }
  };

  const handleUserFormChange = useCallback((fieldOrEvent, value) => {
    // Handle both event objects and direct field/value pairs
    let field, fieldValue;
    
    if (typeof fieldOrEvent === 'object' && fieldOrEvent.target) {
      // Handle event object
      field = fieldOrEvent.target.name;
      fieldValue = fieldOrEvent.target.value;
    } else {
      // Handle direct field/value pair
      field = fieldOrEvent;
      fieldValue = value;
    }
    
    if (field === 'subUserLimit') {
      setUserForm(prev => ({
        ...prev,
        subUserLimit: fieldValue === '' ? '' : Number(fieldValue)
      }));
    } else {
      setUserForm(prev => ({
        ...prev,
        [field]: fieldValue
      }));
    }
  }, []);

  // Helper function to add/remove project assignments
  const toggleProjectAssignment = useCallback((projectId) => {
    setUserForm(prev => {
      const isAssigned = prev.projectAssignments.some(pa => pa.projectId === projectId);
      
      if (isAssigned) {
        // Remove project assignment
        return {
          ...prev,
          projectAssignments: prev.projectAssignments.filter(pa => pa.projectId !== projectId)
        };
      } else {
        // Add new project assignment
        const newAssignment = {
          projectId: projectId
        };
        return {
          ...prev,
          projectAssignments: [...prev.projectAssignments, newAssignment]
        };
      }
    });
  }, []);

  const handleCancelEdit = () => {
    setEditingProjectId(null);
  };

  const handleEditProject = (project) => {
    if (!isSuperAdmin()) return;
    setEditingProjectId(project.id);
    setProjectForm({
      customProjectId: project.customProjectId,
      name: project.name,
      description: project.description || '',
      projectUrl: project.projectUrl || '',
      icon: project.icon || ''
    });
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin()) return;
    
    setLoading(true);
    setError(null);

    try {
      // Validate the URL
      if (projectForm.projectUrl) {
        try {
          new URL(projectForm.projectUrl);
        } catch {
          setError('Please enter a valid URL');
          setLoading(false);
          return;
        }
      }

      const updateData = {
        projectUrl: projectForm.projectUrl
      };

      const response = await projectsAPI.update(projectForm.customProjectId, updateData);
      if (response.data.success) {
        setEditingProjectId(null);
        await fetchData();
      } else {
        setError(response.data.message || 'Failed to update project');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center p-4 bg-gray-100">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-black">
          <Shield className="h-6 w-6 text-black" />
          Authentication Dashboard
        </h1>
        <p className="text-sm mt-1 text-black">
          Welcome back, {user?.name} ({user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'ADMIN' ? 'Project Admin' : 'Sub User'})
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={logout}
          className="btn btn-primary text-white"
          style={{
            background: 'linear-gradient(135deg, #211531, #9254de)',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <LogOut className="btn-icon" />
          Logout
        </button>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div
      className="dashboard-nav flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #211531, #9254de)',
        minHeight: '100vh',
        width: '250px',
        padding: '1.5rem'
      }}
    >
      <div className="mb-8 flex justify-start ml-8" >
        <img 
          src="/assets/xtown-light.png" 
          alt="XTown Logo" 
          className="h-8 w-auto" 
        />
      </div>
      <nav className="space-y-2">
        {/* Overview tab - only for Super Admin and Project Admin */}
        {(isSuperAdmin() || isProjectAdmin()) && (
        <button
          onClick={() => setActiveTab('overview')}
          className={`nav-tab flex items-center gap-2 px-4 py-2 rounded-lg transition-colors w-full ${
            activeTab === 'overview' 
              ? 'bg-white bg-opacity-20 text-white' 
              : 'text-white hover:bg-white hover:bg-opacity-10'
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          Overview
        </button>
        )}
        
        <button
          onClick={() => setActiveTab('projects')}
          className={`nav-tab flex items-center gap-2 px-4 py-2 rounded-lg transition-colors w-full ${
            activeTab === 'projects' 
              ? 'bg-white bg-opacity-20 text-white' 
              : 'text-white hover:bg-white hover:bg-opacity-10'
          }`}
        >
          <Briefcase className="h-5 w-5" />
          Projects
        </button>
        
        {/* Users tab - only for Super Admin and Project Admin */}
        {(isSuperAdmin() || isProjectAdmin()) && (
          <button
            onClick={() => setActiveTab('users')}
            className={`nav-tab flex items-center gap-2 px-4 py-2 rounded-lg transition-colors w-full ${
              activeTab === 'users' 
                ? 'bg-white bg-opacity-20 text-white' 
                : 'text-white hover:bg-white hover:bg-opacity-10'
            }`}
          >
            <Users className="h-5 w-5" />
            Users
          </button>
        )}
      </nav>
      <div className="mt-auto pt-8">
        <div className="text-white ">
          <b>Powered by Xtown</b>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => {
    // Calculate user distribution
    const userDistribution = {
      total: users?.length || 0,
      verified: users?.filter(user => user.isActive).length || 0,
      unverified: users?.filter(user => !user.isActive).length || 0,
      projectAdmins: users?.filter(user => user.role === 'ADMIN').length || 0,
      subUsers: users?.filter(user => user.role === 'SUB_USER').length || 0
    };

    // Calculate project statistics
    const projectStats = {
      total: projects?.length || 0,
      active: projects?.filter(project => project.isActive).length || 0,
      inactive: projects?.filter(project => !project.isActive).length || 0
    };

    // Calculate Project Admin specific data
    const projectAdminData = {
      // For Project Admin, the backend already filters to only show their sub-users
      subUsers: isProjectAdmin() ? users?.length || 0 : users?.filter(user => user.role === 'SUB_USER' && Number(user.createdBy?.id) === Number(user?.id)).length || 0,
      verifiedSubUsers: isProjectAdmin() ? users?.filter(user => user.isActive).length || 0 : users?.filter(user => user.role === 'SUB_USER' && Number(user.createdBy?.id) === Number(user?.id) && user.isActive).length || 0,
      unverifiedSubUsers: isProjectAdmin() ? users?.filter(user => !user.isActive).length || 0 : users?.filter(user => user.role === 'SUB_USER' && Number(user.createdBy?.id) === Number(user?.id) && !user.isActive).length || 0,
      // Only show projects assigned to this project admin
      assignedProjects: user?.projects?.length || 0
    };

    // Debug logging for Project Admin
    if (isProjectAdmin()) {
      // Debug logging removed
    }

    // Prepare chart data based on user role
    const getBarChartData = () => {
      if (isSuperAdmin()) {
        return [
          { name: 'Users', value: userDistribution.total, color: '#3B82F6' },
          { name: 'Projects', value: projectStats.total, color: '#10B981' },
          { name: 'Companies', value: stats?.totalCompanies || 0, color: '#F59E0B' },
          { name: 'Admins', value: userDistribution.projectAdmins, color: '#8B5CF6' },
          { name: 'Sub Users', value: userDistribution.subUsers, color: '#EF4444' }
        ];
      } else if (isProjectAdmin()) {
        return [
          { name: 'Sub Users', value: projectAdminData.subUsers, color: '#EF4444' },
          { name: 'Assigned Projects', value: projectAdminData.assignedProjects, color: '#10B981' },
          { name: 'Verified Sub Users', value: projectAdminData.verifiedSubUsers, color: '#10B981' },
          { name: 'Unverified Sub Users', value: projectAdminData.unverifiedSubUsers, color: '#F59E0B' },
          { name: 'Sub User Limit', value: user?.subUserLimit || 5, color: '#8B5CF6' }
        ];
      }
      return [];
    };

    return (
    <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div 
            className="bg-white shadow rounded-lg p-6 cursor-pointer transition-all hover:shadow-md"
            onClick={() => setActiveTab('projects')}
          >
              <div className="flex items-center">
              <Briefcase className="h-8 w-8" style={{ color: '#4012b2' }} />
                <div className="ml-4">
                <p className="text-sm font-medium text-black">Total Projects</p>
                <p className="text-2xl font-bold text-black">{projectStats.total}</p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-white shadow rounded-lg p-6 cursor-pointer transition-all hover:shadow-md"
            onClick={() => setActiveTab('users')}
          >
              <div className="flex items-center">
              <Users className="h-8 w-8" style={{ color: '#4012b2' }} />
                <div className="ml-4">
                <p className="text-sm font-medium text-black">Total Users</p>
                <p className="text-2xl font-bold text-black">{userDistribution.total}</p>
              </div>
            </div>
          </div>
          
          {isSuperAdmin() && (
          <div 
            className="bg-white shadow rounded-lg p-6 cursor-pointer transition-all hover:shadow-md"
            onClick={() => setShowCompaniesModal(true)}
          >
              <div className="flex items-center">
              <Building2 className="h-8 w-8" style={{ color: '#4012b2' }} />
                <div className="ml-4">
                <p className="text-sm font-medium text-black">Total Companies</p>
                <p className="text-2xl font-bold text-black">{stats?.totalCompanies || 0}</p>
                </div>
              </div>
            </div>
          )}
          </div>
          
        {/* Charts for Super Admin and Project Admin */}
        {(isSuperAdmin() || isProjectAdmin()) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserStatsPieChart 
              verifiedUsers={isSuperAdmin() ? userDistribution.verified : projectAdminData.verifiedSubUsers}
              unverifiedUsers={isSuperAdmin() ? userDistribution.unverified : projectAdminData.unverifiedSubUsers}
              title={isSuperAdmin() ? "User Verification Status" : "Sub User Verification Status"}
            />
            <TotalCountsBarChart 
              data={getBarChartData()}
              title={isSuperAdmin() ? "System Overview" : "Project Admin Overview"}
            />
                </div>
        )}
    </div>
  );
  };

  const renderProjects = () => {
    // For sub-users, only show their accessible projects
    const accessibleProjects = user?.role === 'SUB_USER' ? (user?.projects || []) : projects;
    const totalProjects = accessibleProjects.length;

    return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-black">Projects</h2>
        {isSuperAdmin() && (
          <button
            onClick={() => setShowCreateProject(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-[#4012b2] to-[#9254de] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
              <Plus className="h-5 w-5 mr-2" />
            Create Project
          </button>
        )}
      </div>

      {/* Project count for sub-users */}
      {user?.role === 'SUB_USER' && (
        <div className="mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8" style={{ color: '#4012b2' }} />
              <div className="ml-4">
                <p className="text-sm font-medium text-black">Total Projects</p>
                <p className="text-2xl font-bold text-black">{totalProjects}</p>
              </div>
            </div>
          </div>
        </div>
      )}

        <div className="grid gap-4">
          {accessibleProjects.map((project) => (
            <div key={project.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
                      <Briefcase className="h-6 w-6" style={{ color: '#4012b2' }} />
          </div>
              </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black">{project.name}</h3>
                    <p className="text-sm text-black opacity-70">ID: {project.customProjectId}</p>
                    {project.description && (
                      <p className="text-sm mt-1 text-black opacity-70">{project.description}</p>
                    )}
                    <div className="mt-2">
                      {editingProjectId === project.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="url"
                            value={projectForm.projectUrl}
                            onChange={(e) => handleProjectFormChange('projectUrl', e.target.value)}
                            className="flex-1 px-3 py-1 border border-gray-200 rounded text-sm text-black"
                            placeholder="Enter project URL"
                          />
                          <button
                            onClick={handleUpdateProject}
                            className="p-1 text-green-600 hover:opacity-70"
                            title="Save URL"
                            disabled={loading}
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-red-600 hover:opacity-70"
                            title="Cancel"
                            disabled={loading}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-black opacity-70">
                            URL: {project.projectUrl || 'Not set'}
                          </p>
                          {isSuperAdmin() && (
                            <button
                              onClick={() => handleEditProject(project)}
                              className="p-1 text-black hover:opacity-70"
                              title="Edit URL"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                        </div>
                      </div>
                    </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleProjectAccess(project)}
                    className="text-black hover:opacity-70"
                          title="Access project"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        {isSuperAdmin() && (
                          <button
                            onClick={() => handleDeleteProject(project.customProjectId)}
                      className="text-black hover:opacity-70"
                            title="Delete project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
      </div>
    </div>
  );
  };

  const renderUsers = () => {
    // Calculate verified and unverified user counts
    const verifiedUsers = users.filter(user => user.isActive);
    const unverifiedUsers = users.filter(user => !user.isActive);

    // Get unique company names from project admins
    const uniqueCompanies = [...new Set(users
      .filter(user => user.role === 'ADMIN' && user.companyName)
      .map(user => user.companyName.trim()))]
      .sort();

    // Filter users based on the selected filter and company
    const filteredUsers = users.filter(user => {
      const matchesFilter = userFilter === 'verified' 
        ? user.isActive 
        : userFilter === 'unverified' 
          ? !user.isActive 
          : true;

      const matchesCompany = selectedCompany 
        ? user.companyName === selectedCompany 
        : true;

      return matchesFilter && matchesCompany;
    });
    
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Users</h2>
          <button
            onClick={() => setShowCreateUser(true)}
            className="btn btn-primary text-white"
            style={{
              background: 'linear-gradient(135deg, #211531, #9254de)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <UserPlus className="btn-icon" />
            {isSuperAdmin() ? 'Create Project Admin' : 'Create Sub User'}
          </button>
        </div>

        {/* User Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div 
            className={`bg-white shadow rounded-lg p-6 cursor-pointer transition-all ${
              userFilter === 'all' ? 'ring-2 ring-purple-500' : 'hover:shadow-md'
            }`}
            onClick={() => setUserFilter('all')}
          >
            <div className="flex items-center">
              <Users className="h-8 w-8" style={{ color: '#4012b2' }} />
              <div className="ml-4">
                <p className="text-sm font-medium text-black">Total Users</p>
                <p className="text-2xl font-bold text-black">{users.length}</p>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white shadow rounded-lg p-6 cursor-pointer transition-all ${
              userFilter === 'verified' ? 'ring-2 ring-purple-500' : 'hover:shadow-md'
            }`}
            onClick={() => setUserFilter('verified')}
          >
            <div className="flex items-center">
              <UserCheck className="h-8 w-8" style={{ color: '#4012b2' }} />
              <div className="ml-4">
                <p className="text-sm font-medium text-black">Verified Users</p>
                <p className="text-2xl font-bold text-black">{verifiedUsers.length}</p>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white shadow rounded-lg p-6 cursor-pointer transition-all ${
              userFilter === 'unverified' ? 'ring-2 ring-purple-500' : 'hover:shadow-md'
            }`}
            onClick={() => setUserFilter('unverified')}
          >
            <div className="flex items-center">
              <UserX className="h-8 w-8" style={{ color: '#4012b2' }} />
              <div className="ml-4">
                <p className="text-sm font-medium text-black">Unverified Users</p>
                <p className="text-2xl font-bold text-black">{unverifiedUsers.length}</p>
              </div>
            </div>
          </div>

          {/* Company Search Box - only for Super Admin */}
          {isSuperAdmin() && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="relative">
              <div className="flex items-center">
                <Building2 className="h-8 w-8" style={{ color: '#4012b2' }} />
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-black">Search by Company</p>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select company..."
                      value={selectedCompany || ''}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      onFocus={() => setShowCompanyDropdown(true)}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {showCompanyDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        <div 
                          className="px-3 py-2 text-sm text-black hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedCompany('');
                            setShowCompanyDropdown(false);
                          }}
                        >
                          All Companies
                        </div>
                        {uniqueCompanies.map((company) => (
                          <div
                            key={company}
                            className="px-3 py-2 text-sm text-black hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowCompanyDropdown(false);
                            }}
                          >
                            {company}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4" style={{ color: '#4012b2' }} />
              <p className="text-black">
                {userFilter === 'verified' 
                  ? 'No verified users found' 
                  : userFilter === 'unverified' 
                    ? 'No unverified users found' 
                    : selectedCompany
                      ? `No users found for company: ${selectedCompany}`
                      : 'No users found'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-black">
                  <div className="col-span-2">User</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Company</div>
                  <div className="col-span-1">Status</div>
                  {/* Sub-user Limit column only for Super Admin */}
                  {isSuperAdmin() && <div className="col-span-1">Sub-User Limit</div>}
                  <div className="col-span-2">Projects</div>
                  <div className="col-span-1">Last Login</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
              <div>
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-6 border-b border-gray-100">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-2">
                          <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-black">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                            <p className="font-medium text-black">{user.name}</p>
                            <p className="text-sm text-black opacity-70">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-black">
                              {user.role === 'ADMIN' ? 'Project Admin' : 'Sub User'}
                            </span>
                            {user.customRole && (
                            <p className="text-xs mt-1 text-black opacity-70">
                                {user.customRole}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div>
                            {user.companyName ? (
                              <>
                              <p className="text-sm font-medium text-black">
                                  {user.companyName}
                                </p>
                                {user.companyPhone && (
                                <p className="text-xs text-black opacity-70">
                                    📞 {user.companyPhone}
                                  </p>
                                )}
                                {user.companyAddress && (
                                <p className="text-xs text-black opacity-70" title={user.companyAddress}>
                                    📍 {user.companyAddress.length > 40 
                                      ? `${user.companyAddress.substring(0, 40)}...` 
                                      : user.companyAddress
                                    }
                                  </p>
                                )}
                              </>
                            ) : (
                            <p className="text-sm text-black opacity-70">
                                No company info
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="col-span-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-black">
                            {user.status || (user.isSuspended ? 'Suspended' : user.isActive ? 'Active' : 'Pending')}
                          </span>
                        </div>
                        {/* Sub-user Limit cell only for Super Admin */}
                        {isSuperAdmin() && (
                        <div className="col-span-1">
                          {user.role === 'ADMIN' && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-black">
                                {user.subUserLimit ?? 5}
                                {user.subUserLimit !== undefined && (
                                  <span className="text-xs ml-1 text-black opacity-70">
                                    (Used: {users.filter(u => u.createdBy?.id === user.id).length})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {user.role === 'SUPER_ADMIN' && (
                            <span className="text-sm text-black opacity-70">
                              Unlimited
                            </span>
                          )}
                          {user.role === 'USER' && (
                            <span className="text-sm text-black opacity-70">
                              N/A
                            </span>
                          )}
                        </div>
                        )}
                        <div className="col-span-2">
                          {user.projects && user.projects.length > 0 ? (
                            <div className="space-y-1">
                              {user.projects.map((project, index) => (
                                <div key={index} className="text-sm text-black opacity-70">
                                  <span className="font-medium">
                                    {project.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-black opacity-70">
                              No projects assigned
                            </p>
                          )}
                        </div>
                        <div className="col-span-1">
                        {user.lastLoginAt ? (
                          <span className="text-sm text-black">
                            {new Date(user.lastLoginAt).toLocaleDateString()} {new Date(user.lastLoginAt).toLocaleTimeString()}
                          </span>
                        ) : (
                          <span className="text-sm text-black opacity-70">Never</span>
                          )}
                        </div>
                        <div className="col-span-1">
                          <div className="flex space-x-2">
                            {(() => {
                              const shouldShowActions = isSuperAdmin() || (isProjectAdmin() && user.role === 'SUB_USER');
                              
                              return shouldShowActions && (
                                <>
                                  {/* Edit button only for Super Admin */}
                                  {isSuperAdmin() && (
                                  <button
                                    onClick={() => handleEditUser(user)}
                                  className="text-black hover:opacity-70"
                                    title="Edit user"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                  className="text-black hover:opacity-70"
                                    title="Delete user"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => user.isSuspended ? handleUnsuspendUser(user.id, user.name, user.role) : handleSuspendUser(user.id, user.name)}
                                  className="text-black hover:opacity-70"
                                    title={user.isSuspended ? "Unsuspend user" : "Suspend user"}
                                  >
                                    {user.isSuspended ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white">
      {renderNavigation()}
      <div className="flex-1 flex flex-col overflow-hidden">
      {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {renderHeader()}
        <div className="flex-1 overflow-y-auto bg-white">
        {activeTab === 'overview' && (isSuperAdmin() || isProjectAdmin()) && renderOverview()}
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'users' && (isSuperAdmin() || isProjectAdmin()) && renderUsers()}
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        show={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        projectForm={projectForm}
        onFormChange={handleProjectFormChange}
        onSubmit={handleCreateProject}
        loading={loading}
        formErrors={projectFormErrors}
      />

      <CreateUserModal
        show={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        userForm={userForm}
        onFormChange={handleUserFormChange}
        onSubmit={handleCreateUser}
        loading={loading}
        projects={projects}
        isSuperAdmin={isSuperAdmin()}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        onToggleProjectAssignment={toggleProjectAssignment}
        formErrors={userFormErrors}
      />

      {showEditUser && (
        <EditUserModal
          onClose={() => {
            setShowEditUser(false);
            setEditingUser(null);
            setUserForm({
              projectAssignments: []
            });
          }}
          userForm={userForm}
          onSubmit={handleUpdateUserProjects}
          loading={loading}
          projects={projects}
          onToggleProjectAssignment={toggleProjectAssignment}
          isSuperAdmin={isSuperAdmin()}
        />
      )}

      <CompaniesModal
        show={showCompaniesModal}
        onClose={() => setShowCompaniesModal(false)}
        companies={users
          .filter(user => user.role === 'ADMIN' && user.companyName) 
          .map(user => user.companyName.trim())  
          .filter((company, index, self) => self.indexOf(company) === index)
          .sort()}
      />
    </div>
  );
};

export default Dashboard;

