// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthTabs();
    initializeRegistrationTypes();
    initializeFormHandlers();
    initializeDateInputs();
});

// Tab Management
function initializeAuthTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and forms
            tabButtons.forEach(btn => btn.classList.remove('active'));
            authForms.forEach(form => form.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding form
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Registration Type Management
function initializeRegistrationTypes() {
    const typeButtons = document.querySelectorAll('.type-btn');
    const registrationForms = document.querySelectorAll('.registration-form');
    
    typeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetType = this.getAttribute('data-type');
            
            // Remove active class from all type buttons and forms
            typeButtons.forEach(btn => btn.classList.remove('active'));
            registrationForms.forEach(form => form.classList.remove('active'));
            
            // Add active class to clicked button and corresponding form
            this.classList.add('active');
            document.getElementById(`${targetType}-registration`).classList.add('active');
        });
    });
}

// Form Handlers
function initializeFormHandlers() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Employee registration form
    const employeeForm = document.getElementById('employeeRegForm');
    if (employeeForm) {
        employeeForm.addEventListener('submit', handleEmployeeRegistration);
    }
    
    // Guest registration form
    const guestForm = document.getElementById('guestRegForm');
    if (guestForm) {
        guestForm.addEventListener('submit', handleGuestRegistration);
    }
    
    // Real-time validation
    initializeFormValidation();
}

// Date Input Initialization
function initializeDateInputs() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        input.min = today;
    });
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const remember = formData.get('remember');
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="loading"></div> Signing In...';
    submitButton.disabled = true;
    
    // Simulate authentication
    setTimeout(() => {
        if (validateLogin(email, password)) {
            // Store session
            const userRole = getUserRole(email);
            storeSession(email, userRole, remember);
            
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to main application
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showNotification('Invalid email or password', 'error');
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }, 2000);
}

// Demo Login Functions
function loginAsDemo(role) {
    const demoAccounts = {
        'admin': { email: 'admin@company.com', name: 'Admin User', role: 'admin' },
        'employee': { email: 'john.doe@company.com', name: 'John Doe', role: 'employee' },
        'guest': { email: 'guest@visitor.com', name: 'Guest User', role: 'guest' }
    };
    
    const account = demoAccounts[role];
    if (account) {
        storeSession(account.email, account.role, false, account.name);
        showNotification(`Logged in as ${account.name}`, 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// Employee Registration Handler
function handleEmployeeRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Validate required fields
    const requiredFields = ['employeeId', 'fullName', 'officeEmail', 'department', 'managerName', 'contactNumber'];
    if (!validateRequiredFields(e.target, requiredFields)) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="loading"></div> Submitting...';
    submitButton.disabled = true;
    
    // Simulate registration process
    setTimeout(() => {
        const registrationData = {
            id: `REG${Date.now().toString().slice(-3)}`,
            type: 'registration',
            subtype: 'employee',
            title: `Employee Registration - ${formData.get('fullName')}`,
            data: {
                employeeId: formData.get('employeeId'),
                fullName: formData.get('fullName'),
                officeEmail: formData.get('officeEmail'),
                department: formData.get('department'),
                managerName: formData.get('managerName'),
                managerEmail: formData.get('managerEmail'),
                contactNumber: formData.get('contactNumber'),
                residentialArea: formData.get('residentialArea'),
                services: Array.from(e.target.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value)
            },
            status: 'pending',
            priority: 'high',
            createdAt: new Date()
        };
        
        // Store registration for admin review (simulate)
        storeRegistrationRequest(registrationData);
        
        showNotification('Employee registration submitted successfully! You will receive an email once approved.', 'success');
        
        // Reset form
        e.target.reset();
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Switch to login tab
        setTimeout(() => {
            document.querySelector('.tab-btn[data-tab="login"]').click();
        }, 2000);
        
    }, 2000);
}

// Guest Registration Handler
function handleGuestRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Validate required fields
    const requiredFields = ['guestName', 'guestContact', 'visitPurpose', 'visitDuration', 'hostEmployee', 'hostDepartment', 'arrivalDate', 'idProofType'];
    if (!validateRequiredFields(e.target, requiredFields)) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="loading"></div> Submitting...';
    submitButton.disabled = true;
    
    // Simulate registration process
    setTimeout(() => {
        const registrationData = {
            id: `GST${Date.now().toString().slice(-3)}`,
            type: 'guesthouse',
            subtype: 'guest_registration',
            title: `Guest Registration - ${formData.get('guestName')}`,
            data: {
                guestName: formData.get('guestName'),
                guestContact: formData.get('guestContact'),
                guestEmail: formData.get('guestEmail'),
                organization: formData.get('organization'),
                visitPurpose: formData.get('visitPurpose'),
                visitDuration: formData.get('visitDuration'),
                hostEmployee: formData.get('hostEmployee'),
                hostEmployeeId: formData.get('hostEmployeeId'),
                hostDepartment: formData.get('hostDepartment'),
                arrivalDate: formData.get('arrivalDate'),
                departureDate: formData.get('departureDate'),
                idProofType: formData.get('idProofType'),
                services: Array.from(e.target.querySelectorAll('input[name="guestServices"]:checked')).map(cb => cb.value),
                comments: formData.get('comments')
            },
            status: 'pending',
            priority: 'high',
            createdAt: new Date()
        };
        
        // Store registration for admin review (simulate)
        storeRegistrationRequest(registrationData);
        
        showNotification('Guest registration submitted successfully! Your host will be notified for approval.', 'success');
        
        // Reset form
        e.target.reset();
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Switch to login tab
        setTimeout(() => {
            document.querySelector('.tab-btn[data-tab="login"]').click();
        }, 2000);
        
    }, 2000);
}

// Validation Functions
function validateLogin(email, password) {
    // Demo validation - in real app, this would be server-side
    const validAccounts = {
        'admin@company.com': 'admin123',
        'john.doe@company.com': 'employee123',
        'jane.smith@company.com': 'employee123',
        'guest@visitor.com': 'guest123'
    };
    
    return validAccounts[email] === password;
}

function getUserRole(email) {
    const roleMap = {
        'admin@company.com': 'admin',
        'john.doe@company.com': 'employee',
        'jane.smith@company.com': 'employee',
        'guest@visitor.com': 'guest'
    };
    
    return roleMap[email] || 'employee';
}

function validateRequiredFields(form, requiredFields) {
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        const formGroup = field.closest('.form-group');
        
        if (!field.value.trim()) {
            isValid = false;
            formGroup.classList.add('error');
            
            // Add error message if not exists
            if (!formGroup.querySelector('.error-message')) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> This field is required';
                formGroup.appendChild(errorMsg);
            }
        } else {
            formGroup.classList.remove('error');
            const errorMsg = formGroup.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        }
    });
    
    return isValid;
}

// Real-time Form Validation
function initializeFormValidation() {
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            const formGroup = this.closest('.form-group');
            if (formGroup.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const formGroup = field.closest('.form-group');
    const isRequired = field.hasAttribute('required');
    const value = field.value.trim();
    
    // Remove existing error state
    formGroup.classList.remove('error', 'success');
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Validate required fields
    if (isRequired && !value) {
        formGroup.classList.add('error');
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> This field is required';
        formGroup.appendChild(errorMsg);
        return false;
    }
    
    // Validate email fields
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            formGroup.classList.add('error');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a valid email address';
            formGroup.appendChild(errorMsg);
            return false;
        }
    }
    
    // Validate phone fields
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            formGroup.classList.add('error');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a valid phone number';
            formGroup.appendChild(errorMsg);
            return false;
        }
    }
    
    // If validation passes
    if (value) {
        formGroup.classList.add('success');
    }
    
    return true;
}

// Session Management
function storeSession(email, role, remember, name = null) {
    const sessionData = {
        email: email,
        role: role,
        name: name || email.split('@')[0],
        loginTime: new Date().toISOString(),
        isAuthenticated: true
    };
    
    if (remember) {
        localStorage.setItem('userSession', JSON.stringify(sessionData));
    } else {
        sessionStorage.setItem('userSession', JSON.stringify(sessionData));
    }
}

function storeRegistrationRequest(data) {
    // Store registration requests for admin to review
    let registrations = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
    registrations.push(data);
    localStorage.setItem('pendingRegistrations', JSON.stringify(registrations));
}

// Password Toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    const icon = toggle.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Check if user is already logged in
function checkExistingSession() {
    const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            if (session.isAuthenticated) {
                // User is already logged in, redirect to main app
                window.location.href = 'index.html';
            }
        } catch (e) {
            // Invalid session data, clear it
            localStorage.removeItem('userSession');
            sessionStorage.removeItem('userSession');
        }
    }
}

// Initialize session check
document.addEventListener('DOMContentLoaded', function() {
    checkExistingSession();
});

// Form Auto-fill for Demo
function autoFillDemo(type) {
    if (type === 'employee') {
        const form = document.getElementById('employeeRegForm');
        form.querySelector('[name="employeeId"]').value = 'EMP12345';
        form.querySelector('[name="fullName"]').value = 'John Smith';
        form.querySelector('[name="officeEmail"]').value = 'john.smith@company.com';
        form.querySelector('[name="department"]').value = 'Engineering';
        form.querySelector('[name="managerName"]').value = 'Sarah Johnson';
        form.querySelector('[name="contactNumber"]').value = '+1 234 567 8900';
        form.querySelector('[name="managerEmail"]').value = 'sarah.johnson@company.com';
        form.querySelector('[name="residentialArea"]').value = 'Residential Area A';
        
        // Check services
        form.querySelectorAll('[name="services"]').forEach(cb => cb.checked = true);
    } else if (type === 'guest') {
        const form = document.getElementById('guestRegForm');
        form.querySelector('[name="guestName"]').value = 'Michael Brown';
        form.querySelector('[name="guestContact"]').value = '+1 234 567 8901';
        form.querySelector('[name="guestEmail"]').value = 'michael@techsolutions.com';
        form.querySelector('[name="organization"]').value = 'Tech Solutions Inc.';
        form.querySelector('[name="visitPurpose"]').value = 'Business Meeting';
        form.querySelector('[name="visitDuration"]').value = '2-3 Days';
        form.querySelector('[name="hostEmployee"]').value = 'Alice Wilson';
        form.querySelector('[name="hostEmployeeId"]').value = 'EMP54321';
        form.querySelector('[name="hostDepartment"]').value = 'Engineering';
        form.querySelector('[name="idProofType"]').value = 'Passport';
        
        // Set dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 3);
        
        form.querySelector('[name="arrivalDate"]').value = tomorrow.toISOString().split('T')[0];
        form.querySelector('[name="departureDate"]').value = dayAfter.toISOString().split('T')[0];
        
        // Check services
        form.querySelectorAll('[name="guestServices"]').forEach((cb, index) => {
            if (index < 2) cb.checked = true;
        });
        
        form.querySelector('[name="comments"]').value = 'Looking forward to the business meeting and collaboration opportunities.';
    }
}

// Add demo fill buttons (for development/testing)
document.addEventListener('DOMContentLoaded', function() {
    // Add demo fill button for employee form
    const empForm = document.getElementById('employee-registration');
    if (empForm) {
        const demoBtn = document.createElement('button');
        demoBtn.type = 'button';
        demoBtn.className = 'demo-btn';
        demoBtn.innerHTML = '<i class="fas fa-magic"></i> Fill Demo Data';
        demoBtn.style.marginBottom = '15px';
        demoBtn.onclick = () => autoFillDemo('employee');
        empForm.querySelector('h3').after(demoBtn);
    }
    
    // Add demo fill button for guest form
    const guestForm = document.getElementById('guest-registration');
    if (guestForm) {
        const demoBtn = document.createElement('button');
        demoBtn.type = 'button';
        demoBtn.className = 'demo-btn';
        demoBtn.innerHTML = '<i class="fas fa-magic"></i> Fill Demo Data';
        demoBtn.style.marginBottom = '15px';
        demoBtn.onclick = () => autoFillDemo('guest');
        guestForm.querySelector('h3').after(demoBtn);
    }
});
