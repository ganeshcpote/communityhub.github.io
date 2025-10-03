// Community Services Platform JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuthentication()) {
        return; // Will redirect to login page
    }

    // Initialize the application
    initializeSidebarNavigation();
    initializeTabs();
    initializeInteractiveElements();
    initializeDashboardCards();
    initializeFormHandlers();
    initializeUserSession();
    initializeNotifications();
    initializeModalHandlers(); // Added modal handlers
    initializeRoleBasedAccess(); // Added role-based access control

    // Set default active section based on role
    const userRole = getUserRole();
    const defaultSection = getDefaultSectionForRole(userRole);
    
    // Use setTimeout to ensure all initialization is complete
    setTimeout(() => {
        showSection(defaultSection);
    }, 100);
});

// Utility function to get user role
function getUserRole() {
    return sessionStorage.getItem('userRole') || localStorage.getItem('userRole');
}

// Get default section based on user role
function getDefaultSectionForRole(role) {
    switch(role) {
        case 'guest':
            return 'guesthouse'; // Guests start with guest house
        case 'employee':
        case 'admin':
        default:
            return 'dashboard'; // Employees and admins start with dashboard
    }
}

// Sidebar Navigation Management
function initializeSidebarNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav links
            navLinks.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
            
            // Close sidebar on mobile
            if (window.innerWidth <= 1024) {
                closeSidebar();
            }
        });
    });
}

// Section Display Management with Role-Based Access Control
function showSection(sectionId) {
    const userRole = getUserRole();
    
    // Check if user has access to this section
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
        const allowedRoles = sectionElement.getAttribute('data-roles');
        if (allowedRoles && userRole && !allowedRoles.split(',').includes(userRole)) {
            // Redirect to default section for their role
            const defaultSection = getDefaultSectionForRole(userRole);
            sectionId = defaultSection;
        }
    }
    
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update page title
    updatePageTitle(sectionId);
}

// Update page title based on active section
function updatePageTitle(sectionId) {
    const titles = {
        'dashboard': 'Dashboard - Community Hub',
        'transport': 'Transport Services - Community Hub',
        'guesthouse': 'Guest House - Community Hub',
        'services': 'Residence Services - Community Hub',
        'admin': 'Admin Dashboard - Community Hub'
    };
    
    document.title = titles[sectionId] || 'Community Hub';
}

// Tab Management
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabContainer = this.closest('.transport-tabs, .guesthouse-tabs, .admin-tabs');
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tab buttons in this container
            tabContainer.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Hide all tab contents in the parent section
            const parentSection = tabContainer.closest('.content-section');
            parentSection.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show target tab content
            const targetContent = parentSection.querySelector(`#${tabId}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Dashboard Card Interactions
function initializeDashboardCards() {
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    
    dashboardCards.forEach(card => {
        card.addEventListener('click', function() {
            const cardIcon = this.querySelector('.card-icon');
            
            if (cardIcon.classList.contains('transport')) {
                navigateToSection('transport');
            } else if (cardIcon.classList.contains('guesthouse')) {
                navigateToSection('guesthouse');
            } else if (cardIcon.classList.contains('services')) {
                navigateToSection('services');
            } else if (cardIcon.classList.contains('admin')) {
                navigateToSection('admin');
            }
        });
    });
}

// Navigate to section and update navigation
function navigateToSection(sectionId) {
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
    
    // Show section
    showSection(sectionId);
}

// Form Handlers
function initializeFormHandlers() {
    // Transport booking form
    const bookingForm = document.querySelector('.booking-form form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleTransportBooking);
    }
    
    // Visitor registration form
    const visitorForm = document.querySelector('.visitor-form form');
    if (visitorForm) {
        visitorForm.addEventListener('submit', handleVisitorRegistration);
    }
    
    // Service request buttons now use onclick handlers in HTML to open modal
    
    // Room reservation buttons
    const reserveButtons = document.querySelectorAll('.room-card .btn-primary');
    reserveButtons.forEach(button => {
        button.addEventListener('click', handleRoomReservation);
    });
}

// Transport Booking Handler
function handleTransportBooking(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookingData = {
        from: formData.get('from') || e.target.querySelector('select').value,
        to: formData.get('to') || e.target.querySelectorAll('select')[1].value,
        date: formData.get('date') || e.target.querySelector('input[type="date"]').value,
        time: formData.get('time') || e.target.querySelectorAll('select')[2].value,
        passengers: formData.get('passengers') || e.target.querySelector('input[type="number"]').value
    };
    
    // Simulate booking process
    showNotification('Transport booking submitted successfully!', 'success');
    
    // Add to my bookings (simulate)
    addBookingToList(bookingData);
    
    // Reset form
    e.target.reset();
}

// Add booking to the list
function addBookingToList(bookingData) {
    const bookingsList = document.querySelector('.bookings-list');
    if (!bookingsList) return;
    
    const bookingItem = document.createElement('div');
    bookingItem.className = 'booking-item pending';
    bookingItem.innerHTML = `
        <div class="booking-info">
            <h4>${bookingData.from} to ${bookingData.to}</h4>
            <p>${bookingData.date} at ${bookingData.time}</p>
            <span class="booking-id">Booking #TR${Date.now().toString().slice(-3)}</span>
        </div>
        <div class="booking-status">
            <span class="status pending">Pending</span>
            <button class="btn btn-sm btn-outline" onclick="cancelBooking(this)">Cancel</button>
        </div>
    `;
    
    bookingsList.insertBefore(bookingItem, bookingsList.firstChild);
}

// Visitor Registration Handler
function handleVisitorRegistration(e) {
    e.preventDefault();
    
    showNotification('Visitor registered successfully!', 'success');
    e.target.reset();
}

// Old service request handler removed - now using modal-based approach

// Add service request to list
function addServiceRequest(serviceType, serviceName) {
    const requestsList = document.querySelector('.requests-list');
    if (!requestsList) return;
    
    const requestItem = document.createElement('div');
    requestItem.className = 'request-item';
    requestItem.innerHTML = `
        <div class="request-info">
            <h4>${serviceType} - ${serviceName}</h4>
            <p>Service request submitted</p>
            <span class="request-id">Request #SR${Date.now().toString().slice(-3)}</span>
        </div>
        <div class="request-status">
            <span class="status pending">Pending</span>
            <span class="request-date">${new Date().toLocaleDateString()}</span>
        </div>
    `;
    
    requestsList.insertBefore(requestItem, requestsList.firstChild);
}

// Room Reservation Handler
function handleRoomReservation(e) {
    const roomCard = e.target.closest('.room-card');
    const roomType = roomCard.querySelector('h4').textContent;
    const roomPrice = roomCard.querySelector('.room-price').textContent;
    
    if (e.target.disabled) {
        showNotification('This room is not available', 'error');
        return;
    }
    
    showNotification(`${roomType} reserved successfully! Price: ${roomPrice}`, 'success');
    
    // Update availability
    const availability = roomCard.querySelector('.availability');
    if (availability.classList.contains('limited')) {
        const currentCount = parseInt(availability.textContent.split(' ')[0]);
        if (currentCount > 1) {
            availability.textContent = `${currentCount - 1} Left`;
        } else {
            availability.textContent = 'Unavailable';
            availability.className = 'availability unavailable';
            e.target.textContent = 'Unavailable';
            e.target.className = 'btn btn-disabled';
            e.target.disabled = true;
        }
    } else if (availability.classList.contains('available')) {
        availability.textContent = '1 Left';
        availability.className = 'availability limited';
    }
}

// Interactive Elements
function initializeInteractiveElements() {
    // Search functionality
    const searchInputs = document.querySelectorAll('input[type="search"]');
    searchInputs.forEach(input => {
        input.addEventListener('input', handleSearch);
    });
    
    // Date inputs - set minimum date to today
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        if (!input.value) {
            input.min = today;
        }
    });
    
    // Booking and reservation actions
    initializeActionButtons();
}

// Initialize action buttons
function initializeActionButtons() {
    // Cancel booking buttons
    const cancelButtons = document.querySelectorAll('.booking-item .btn-outline');
    cancelButtons.forEach(button => {
        if (button.textContent.includes('Cancel')) {
            button.addEventListener('click', function() {
                cancelBooking(this);
            });
        }
    });
    
    // Generate report buttons
    const reportButtons = document.querySelectorAll('.report-card .btn');
    reportButtons.forEach(button => {
        button.addEventListener('click', function() {
            const reportType = this.closest('.report-card').querySelector('h4').textContent;
            generateReport(reportType);
        });
    });
}

// Cancel booking function
function cancelBooking(button) {
    const bookingItem = button.closest('.booking-item, .reservation-item');
    const bookingId = bookingItem.querySelector('.booking-id, .reservation-id').textContent;
    
    if (confirm(`Are you sure you want to cancel ${bookingId}?`)) {
        bookingItem.style.opacity = '0.5';
        bookingItem.style.pointerEvents = 'none';
        
        const status = bookingItem.querySelector('.status');
        status.textContent = 'Cancelled';
        status.className = 'status unavailable';
        
        button.textContent = 'Cancelled';
        button.disabled = true;
        
        showNotification('Booking cancelled successfully', 'success');
    }
}

// Generate report function
function generateReport(reportType) {
    showNotification(`Generating ${reportType}...`, 'info');
    
    // Simulate report generation
    setTimeout(() => {
        showNotification(`${reportType} generated successfully!`, 'success');
    }, 2000);
}

// Search handler
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const searchContainer = e.target.closest('.user-management');
    
    if (searchContainer) {
        const rows = searchContainer.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Get notification color based on type
function getNotificationColor(type) {
    const colors = {
        'success': '#27ae60',
        'error': '#e74c3c',
        'warning': '#f39c12',
        'info': '#3498db'
    };
    return colors[type] || colors.info;
}

// Add notification animations to CSS
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(notificationStyles);

// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(time) {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Real-time updates simulation
function initializeRealTimeUpdates() {
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
        updateSystemHealth();
        updateAvailableSeats();
    }, 30000);
}

// Update system health indicators
function updateSystemHealth() {
    const healthBars = document.querySelectorAll('.health-fill');
    healthBars.forEach(bar => {
        const currentWidth = parseInt(bar.style.width);
        const variation = Math.random() * 6 - 3; // ±3%
        const newWidth = Math.max(80, Math.min(100, currentWidth + variation));
        bar.style.width = `${newWidth}%`;
        
        const status = bar.closest('.health-item').querySelector('.health-status');
        status.textContent = `${Math.round(newWidth)}%`;
    });
}

// Update available seats
function updateAvailableSeats() {
    const seatElements = document.querySelectorAll('.seats-available, .seats-limited');
    seatElements.forEach(element => {
        const currentSeats = parseInt(element.textContent);
        const variation = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newSeats = Math.max(0, Math.min(20, currentSeats + variation));
        
        element.textContent = newSeats.toString();
        
        if (newSeats <= 3) {
            element.className = 'seats-limited';
        } else {
            element.className = 'seats-available';
        }
    });
}

// Initialize real-time updates
setTimeout(initializeRealTimeUpdates, 5000);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Alt + number keys for quick navigation
    if (e.altKey) {
        switch(e.key) {
            case '1':
                navigateToSection('dashboard');
                break;
            case '2':
                navigateToSection('transport');
                break;
            case '3':
                navigateToSection('guesthouse');
                break;
            case '4':
                navigateToSection('services');
                break;
            case '5':
                navigateToSection('admin');
                break;
        }
    }
});

// Print functionality for reports
function printReport(reportType) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>${reportType}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #2c3e50; }
                    .report-header { border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h1>${reportType}</h1>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                </div>
                <p>Report content would be generated here...</p>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Export functionality
function exportData(format, data) {
    if (format === 'csv') {
        const csv = convertToCSV(data);
        downloadFile(csv, 'export.csv', 'text/csv');
    } else if (format === 'json') {
        const json = JSON.stringify(data, null, 2);
        downloadFile(json, 'export.json', 'application/json');
    }
}

function convertToCSV(data) {
    // Simple CSV conversion - would be more sophisticated in real implementation
    return data.map(row => Object.values(row).join(',')).join('\n');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Initialize tooltips for better UX
function initializeTooltips() {
    const elementsWithTooltips = document.querySelectorAll('[title]');
    elementsWithTooltips.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('title');
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 0.8rem;
        z-index: 1002;
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
    
    e.target.tooltipElement = tooltip;
    e.target.removeAttribute('title');
}

function hideTooltip(e) {
    if (e.target.tooltipElement) {
        e.target.tooltipElement.remove();
        e.target.setAttribute('title', e.target.tooltipElement.textContent);
        e.target.tooltipElement = null;
    }
}

// Initialize tooltips after DOM is loaded
setTimeout(initializeTooltips, 1000);

// Registration System Functions
function submitEmployeeRegistration() {
    const form = document.getElementById('employeeRegForm');
    const formData = new FormData(form);
    
    // Validate required fields
    const requiredFields = ['employeeId', 'fullName', 'officeEmail', 'department', 'managerName', 'contactNumber'];
    let isValid = true;
    
    requiredFields.forEach(field => {
        const input = form.querySelector(`[name="${field}"]`);
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#e74c3c';
        } else {
            input.style.borderColor = '#ecf0f1';
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Create ticket for admin approval
    const ticketData = {
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
            services: Array.from(form.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value)
        },
        status: 'pending',
        priority: 'high',
        createdAt: new Date()
    };
    
    // Add to admin tickets (simulate)
    addTicketToAdmin(ticketData);
    
    showNotification('Employee registration submitted for approval!', 'success');
    form.reset();
}

function submitGuestRegistration() {
    const form = document.getElementById('guestRegForm');
    const formData = new FormData(form);
    
    // Validate required fields
    const requiredFields = ['guestName', 'guestContact', 'visitPurpose', 'visitDuration', 'hostEmployee', 'hostDepartment', 'arrivalDate', 'idProofType'];
    let isValid = true;
    
    requiredFields.forEach(field => {
        const input = form.querySelector(`[name="${field}"]`);
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#e74c3c';
        } else {
            input.style.borderColor = '#ecf0f1';
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Create ticket for admin approval
    const ticketData = {
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
            services: Array.from(form.querySelectorAll('input[name="guestServices"]:checked')).map(cb => cb.value),
            comments: formData.get('comments')
        },
        status: 'pending',
        priority: 'high',
        createdAt: new Date()
    };
    
    // Add to admin tickets (simulate)
    addTicketToAdmin(ticketData);
    
    showNotification('Guest registration submitted for approval!', 'success');
    form.reset();
}

// Ticketing System Functions
function addTicketToAdmin(ticketData) {
    // This would normally send to backend, but for demo we'll add to the tickets list
    console.log('New ticket created:', ticketData);
    
    // Update admin dashboard stats
    updateAdminStats();
}

function approveTicket(ticketId) {
    const ticketElement = document.querySelector(`[data-ticket="${ticketId}"]`);
    if (!ticketElement) return;
    
    // Update ticket status
    const statusElement = ticketElement.querySelector('.status');
    statusElement.textContent = 'Approved';
    statusElement.className = 'status confirmed';
    
    // Update actions
    const actionsContainer = ticketElement.querySelector('.ticket-actions');
    actionsContainer.innerHTML = `
        <button class="btn btn-sm" onclick="assignToTeam('${ticketId}', getTicketType('${ticketId}'))">Assign to Team</button>
        <button class="btn btn-sm" onclick="openTicketDetails('${ticketId}')">View Details</button>
    `;
    
    showNotification(`Ticket ${ticketId} approved successfully!`, 'success');
    
    // Add to assignment queue
    addToAssignmentQueue(ticketId);
}

function rejectTicket(ticketId) {
    if (!confirm(`Are you sure you want to reject ticket ${ticketId}?`)) return;
    
    const ticketElement = document.querySelector(`[data-ticket="${ticketId}"]`);
    if (!ticketElement) return;
    
    // Update ticket status
    const statusElement = ticketElement.querySelector('.status');
    statusElement.textContent = 'Rejected';
    statusElement.className = 'status unavailable';
    
    // Update actions
    const actionsContainer = ticketElement.querySelector('.ticket-actions');
    actionsContainer.innerHTML = `
        <button class="btn btn-sm" onclick="openTicketDetails('${ticketId}')">View Details</button>
        <button class="btn btn-sm" onclick="reopenTicket('${ticketId}')">Reopen</button>
    `;
    
    showNotification(`Ticket ${ticketId} rejected`, 'warning');
}

function requestMoreInfo(ticketId) {
    const additionalInfo = prompt('What additional information is required?');
    if (!additionalInfo) return;
    
    const ticketElement = document.querySelector(`[data-ticket="${ticketId}"]`);
    if (!ticketElement) return;
    
    // Update ticket status
    const statusElement = ticketElement.querySelector('.status');
    statusElement.textContent = 'Info Required';
    statusElement.className = 'status warning';
    
    showNotification(`Information request sent for ticket ${ticketId}`, 'info');
    
    // Add comment to ticket (simulate)
    addTicketComment(ticketId, 'Admin', `Additional information required: ${additionalInfo}`);
}

function assignToTeam(ticketId, teamType) {
    const teams = {
        'transport': 'Transport Team',
        'guesthouse': 'Guest House Team',
        'maintenance': 'Maintenance Team',
        'registration': 'HR Team'
    };
    
    const teamName = teams[teamType] || 'General Team';
    
    const ticketElement = document.querySelector(`[data-ticket="${ticketId}"]`);
    if (!ticketElement) return;
    
    // Update ticket status
    const statusElement = ticketElement.querySelector('.status');
    statusElement.textContent = 'Assigned';
    statusElement.className = 'status in-progress';
    
    // Update actions
    const actionsContainer = ticketElement.querySelector('.ticket-actions');
    actionsContainer.innerHTML = `
        <button class="btn btn-sm" onclick="updateTicketStatus('${ticketId}', 'in-progress')">Mark In Progress</button>
        <button class="btn btn-sm" onclick="openTicketDetails('${ticketId}')">View Details</button>
    `;
    
    showNotification(`Ticket ${ticketId} assigned to ${teamName}`, 'success');
    
    // Remove from assignment queue
    removeFromAssignmentQueue(ticketId);
}

function updateTicketStatus(ticketId, newStatus) {
    const ticketElement = document.querySelector(`[data-ticket="${ticketId}"]`);
    if (!ticketElement) return;
    
    const statusElement = ticketElement.querySelector('.status');
    const statusMap = {
        'in-progress': { text: 'In Progress', class: 'status in-progress' },
        'completed': { text: 'Completed', class: 'status completed' },
        'on-hold': { text: 'On Hold', class: 'status warning' }
    };
    
    const statusInfo = statusMap[newStatus];
    if (statusInfo) {
        statusElement.textContent = statusInfo.text;
        statusElement.className = statusInfo.class;
        
        showNotification(`Ticket ${ticketId} status updated to ${statusInfo.text}`, 'info');
    }
}

function openTicketDetails(ticketId) {
    // Create modal for ticket details
    const modal = document.createElement('div');
    modal.className = 'ticket-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Ticket Details - ${ticketId}</h3>
                <button class="modal-close" onclick="this.closest('.ticket-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="ticket-timeline">
                    <h4>Timeline</h4>
                    <div class="timeline-item">
                        <span class="timeline-time">Oct 3, 2025 - 2:30 PM</span>
                        <span class="timeline-event">Ticket created</span>
                    </div>
                    <div class="timeline-item">
                        <span class="timeline-time">Oct 3, 2025 - 2:45 PM</span>
                        <span class="timeline-event">Under review</span>
                    </div>
                </div>
                <div class="ticket-comments">
                    <h4>Comments</h4>
                    <div class="comment-item">
                        <strong>Admin:</strong> Reviewing registration details...
                        <span class="comment-time">Oct 3, 2025 - 2:45 PM</span>
                    </div>
                </div>
                <div class="add-comment">
                    <h4>Add Comment</h4>
                    <textarea id="newComment" placeholder="Enter your comment..."></textarea>
                    <button class="btn btn-primary" onclick="addComment('${ticketId}')">Add Comment</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 25px;
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    document.body.appendChild(modal);
}

function addComment(ticketId) {
    const commentText = document.getElementById('newComment').value.trim();
    if (!commentText) return;
    
    addTicketComment(ticketId, 'Admin', commentText);
    
    // Update the comments section
    const commentsSection = document.querySelector('.ticket-comments');
    const newComment = document.createElement('div');
    newComment.className = 'comment-item';
    newComment.innerHTML = `
        <strong>Admin:</strong> ${commentText}
        <span class="comment-time">${new Date().toLocaleString()}</span>
    `;
    commentsSection.appendChild(newComment);
    
    document.getElementById('newComment').value = '';
    showNotification('Comment added successfully', 'success');
}

function addTicketComment(ticketId, author, comment) {
    // This would normally save to backend
    console.log(`Comment added to ${ticketId} by ${author}: ${comment}`);
}

function addToAssignmentQueue(ticketId) {
    // Add ticket to assignment queue (simulate)
    console.log(`Ticket ${ticketId} added to assignment queue`);
}

function removeFromAssignmentQueue(ticketId) {
    // Remove ticket from assignment queue (simulate)
    console.log(`Ticket ${ticketId} removed from assignment queue`);
}

function getTicketType(ticketId) {
    const ticketElement = document.querySelector(`[data-ticket="${ticketId}"]`);
    if (!ticketElement) return 'general';
    
    const typeElement = ticketElement.querySelector('.ticket-type');
    return typeElement ? typeElement.className.split(' ')[1] : 'general';
}

function assignTicket(ticketId) {
    const queueItem = document.querySelector(`[data-ticket="${ticketId}"]`).closest('.queue-item');
    const teamSelect = queueItem.querySelector('.team-select');
    const selectedMember = teamSelect.value;
    
    if (!selectedMember || selectedMember === 'Select Team Member') {
        showNotification('Please select a team member', 'warning');
        return;
    }
    
    // Update ticket assignment
    assignToTeam(ticketId, getTicketType(ticketId));
    
    // Remove from queue
    queueItem.remove();
    
    showNotification(`Ticket ${ticketId} assigned to ${selectedMember}`, 'success');
}

function viewAssignment(ticketId) {
    openTicketDetails(ticketId);
}

function updateAdminStats() {
    // Update dashboard statistics (simulate)
    const statCards = document.querySelectorAll('.stat-card .stat-info h3');
    statCards.forEach(stat => {
        const currentValue = parseInt(stat.textContent);
        // Simulate small increases
        if (Math.random() > 0.7) {
            stat.textContent = currentValue + 1;
        }
    });
}

// Ticket Filtering
function initializeTicketFilters() {
    const typeFilter = document.getElementById('ticketTypeFilter');
    const statusFilter = document.getElementById('ticketStatusFilter');
    
    if (typeFilter) {
        typeFilter.addEventListener('change', filterTickets);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterTickets);
    }
}

function filterTickets() {
    const typeFilter = document.getElementById('ticketTypeFilter');
    const statusFilter = document.getElementById('ticketStatusFilter');
    
    if (!typeFilter || !statusFilter) return;
    
    const selectedType = typeFilter.value;
    const selectedStatus = statusFilter.value;
    
    const tickets = document.querySelectorAll('.ticket-item');
    
    tickets.forEach(ticket => {
        const ticketType = ticket.querySelector('.ticket-type').className.split(' ')[1];
        const ticketStatus = ticket.querySelector('.status').className.split(' ')[1];
        
        const typeMatch = selectedType === 'all' || ticketType === selectedType;
        const statusMatch = ticketStatus === selectedStatus;
        
        ticket.style.display = (typeMatch && statusMatch) ? 'block' : 'none';
    });
}

// Override existing form handlers to integrate with approval workflow
function handleTransportBooking(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookingData = {
        from: formData.get('from') || e.target.querySelector('select').value,
        to: formData.get('to') || e.target.querySelectorAll('select')[1].value,
        date: formData.get('date') || e.target.querySelector('input[type="date"]').value,
        time: formData.get('time') || e.target.querySelectorAll('select')[2].value,
        passengers: formData.get('passengers') || e.target.querySelector('input[type="number"]').value
    };
    
    // Create ticket for admin approval
    const ticketData = {
        id: `TRN${Date.now().toString().slice(-3)}`,
        type: 'transport',
        subtype: 'booking',
        title: `Transport Booking - ${bookingData.from} to ${bookingData.to}`,
        data: bookingData,
        status: 'pending',
        priority: 'medium',
        createdAt: new Date()
    };
    
    addTicketToAdmin(ticketData);
    showNotification('Transport booking submitted for approval!', 'success');
    e.target.reset();
}

// Second duplicate handleServiceRequest function removed - using modal-based approach

// Initialize ticket filters when admin section is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeTicketFilters, 1000);
});

// Authentication and Session Management
function checkAuthentication() {
    const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    
    if (!sessionData) {
        // No session found, redirect to login
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        const session = JSON.parse(sessionData);
        if (!session.isAuthenticated) {
            // Invalid session, redirect to login
            clearSession();
            window.location.href = 'login.html';
            return false;
        }
        
        // Check session expiry (optional - 24 hours)
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            // Session expired
            clearSession();
            showNotification('Session expired. Please login again.', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return false;
        }
        
        return true;
    } catch (e) {
        // Invalid session data
        clearSession();
        window.location.href = 'login.html';
        return false;
    }
}

function initializeUserSession() {
    const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            
            // Update user info in navigation
            const userName = document.querySelector('.user-name');
            const userRole = document.querySelector('.user-role');
            
            if (userName) {
                userName.textContent = session.name || session.email.split('@')[0];
            }
            
            if (userRole) {
                userRole.textContent = capitalizeFirst(session.role);
            }
            
            // Hide admin section for non-admin users
            if (session.role !== 'admin') {
                const adminNavItem = document.querySelector('a[data-section="admin"]').closest('.nav-item');
                if (adminNavItem) {
                    adminNavItem.style.display = 'none';
                }
            }
            
            // Load pending registrations for admin
            if (session.role === 'admin') {
                loadPendingRegistrations();
            }
            
        } catch (e) {
            console.error('Error parsing session data:', e);
        }
    }
}

function loadPendingRegistrations() {
    // Load pending registrations from localStorage and add to admin tickets
    const pendingRegistrations = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
    
    if (pendingRegistrations.length > 0) {
        // Update admin dashboard with new registrations
        console.log('Pending registrations loaded:', pendingRegistrations);
        
        // You could dynamically add these to the tickets list here
        // For demo purposes, we'll just log them
    }
}

function clearSession() {
    localStorage.removeItem('userSession');
    sessionStorage.removeItem('userSession');
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// User Menu Functions
function toggleUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    userMenu.classList.toggle('active');
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!e.target.closest('.user-dropdown')) {
            userMenu.classList.remove('active');
            document.removeEventListener('click', closeMenu);
        }
    });
}

function viewProfile() {
    const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    
    if (sessionData) {
        const session = JSON.parse(sessionData);
        
        // Create profile modal
        const modal = document.createElement('div');
        modal.className = 'profile-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>User Profile</h3>
                    <button class="modal-close" onclick="this.closest('.profile-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="profile-info">
                        <div class="profile-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="profile-details">
                            <h4>${session.name}</h4>
                            <p class="profile-email">${session.email}</p>
                            <p class="profile-role">${capitalizeFirst(session.role)}</p>
                            <p class="profile-login">Last login: ${new Date(session.loginTime).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 25px;
            max-width: 400px;
            width: 100%;
        `;
        
        document.body.appendChild(modal);
    }
    
    // Close user menu
    document.querySelector('.user-menu').classList.remove('active');
}

function changePassword() {
    showNotification('Password change functionality would be implemented here', 'info');
    
    // Close user menu
    document.querySelector('.user-menu').classList.remove('active');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        clearSession();
        showNotification('Logged out successfully', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
    
    // Close user menu
    document.querySelector('.user-menu').classList.remove('active');
}

// Override registration functions to redirect to login page
function submitEmployeeRegistration() {
    showNotification('Please use the registration page to create an account', 'info');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

function submitGuestRegistration() {
    showNotification('Please use the registration page to create an account', 'info');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

// Add profile modal styles
const profileStyles = document.createElement('style');
profileStyles.textContent = `
    .profile-info {
        display: flex;
        align-items: center;
        gap: 20px;
    }
    
    .profile-avatar {
        font-size: 4rem;
        color: #667eea;
    }
    
    .profile-details h4 {
        margin-bottom: 5px;
        color: #2c3e50;
        font-size: 1.3rem;
    }
    
    .profile-email {
        color: #7f8c8d;
        margin-bottom: 5px;
    }
    
    .profile-role {
        color: #667eea;
        font-weight: 600;
        margin-bottom: 10px;
    }
    
    .profile-login {
        color: #95a5a6;
        font-size: 0.9rem;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #ecf0f1;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #7f8c8d;
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
    }
    
    .modal-close:hover {
        background: #f8f9fa;
        color: #2c3e50;
    }
`;
document.head.appendChild(profileStyles);

// Enhanced Features JavaScript

// Notifications System
function toggleNotifications() {
    const notificationsPanel = document.querySelector('.notifications-panel');
    notificationsPanel.classList.toggle('active');
    
    // Close panel when clicking outside
    document.addEventListener('click', function closeNotifications(e) {
        if (!e.target.closest('.notifications-dropdown')) {
            notificationsPanel.classList.remove('active');
            document.removeEventListener('click', closeNotifications);
        }
    });
}

function markAllNotificationsRead() {
    const unreadItems = document.querySelectorAll('.notification-item.unread');
    unreadItems.forEach(item => {
        item.classList.remove('unread');
    });
    
    // Update badge count
    const badge = document.querySelector('.notification-badge');
    badge.textContent = '0';
    badge.style.display = 'none';
    
    showNotification('All notifications marked as read', 'success');
}

// Sidebar Toggle Functions
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('active');
    mainContent.classList.toggle('expanded');
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.remove('active');
    mainContent.classList.add('expanded');
}

// Simple Search Function
function performGlobalSearch() {
    const searchInput = document.querySelector('.search-input');
    const query = searchInput.value.trim();
    
    if (query) {
        showNotification(`Searching for "${query}"...`, 'info');
        // In a real application, this would make an API call
        console.log(`Searching for: ${query}`);
    }
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performGlobalSearch();
            }
        });
    }
    
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performGlobalSearch);
    }
}

// Analytics functions removed

// Workflow Engine Functions
function createNewWorkflow() {
    showNotification('Workflow builder would open here', 'info');
}

function editWorkflowTemplate(templateId) {
    showNotification(`Editing workflow template ${templateId}`, 'info');
}

function cloneWorkflowTemplate(templateId) {
    showNotification(`Cloning workflow template ${templateId}`, 'success');
}

// Real-time Updates Simulation
function startRealTimeUpdates() {
    // Update notifications periodically
    setInterval(() => {
        if (Math.random() > 0.95) { // 5% chance every interval
            addNewNotification();
        }
    }, 10000); // Every 10 seconds
    
    // Update KPI values
    setInterval(() => {
        updateKPIValues();
    }, 30000); // Every 30 seconds
    
    // Update system health
    setInterval(() => {
        updateSystemHealth();
    }, 45000); // Every 45 seconds
}

function addNewNotification() {
    const notifications = [
        {
            type: 'transport',
            icon: 'fas fa-bus',
            title: 'Transport booking confirmed',
            message: 'Your Route B booking for 3:00 PM today',
            time: 'Just now'
        },
        {
            type: 'maintenance',
            icon: 'fas fa-wrench',
            title: 'Service request updated',
            message: 'Electrical work in progress - ETA 2 hours',
            time: 'Just now'
        },
        {
            type: 'system',
            icon: 'fas fa-info-circle',
            title: 'System update',
            message: 'New features available in the platform',
            time: 'Just now'
        }
    ];
    
    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    
    // Add to notifications panel
    const notificationsList = document.querySelector('.notifications-list');
    const newNotification = document.createElement('div');
    newNotification.className = 'notification-item unread';
    newNotification.innerHTML = `
        <div class="notification-icon ${randomNotification.type}">
            <i class="${randomNotification.icon}"></i>
        </div>
        <div class="notification-content">
            <p><strong>${randomNotification.title}</strong></p>
            <span>${randomNotification.message}</span>
            <time>${randomNotification.time}</time>
        </div>
    `;
    
    notificationsList.insertBefore(newNotification, notificationsList.firstChild);
    
    // Update badge
    const badge = document.querySelector('.notification-badge');
    const currentCount = parseInt(badge.textContent) || 0;
    badge.textContent = currentCount + 1;
    badge.style.display = 'block';
    
    // Show toast notification
    showNotification(randomNotification.title, 'info');
}

function updateKPIValues() {
    const kpiCards = document.querySelectorAll('.kpi-card');
    kpiCards.forEach(card => {
        const value = card.querySelector('.kpi-value');
        const change = card.querySelector('.kpi-change');
        
        if (value && change) {
            // Simulate small changes in values
            const currentValue = parseFloat(value.textContent.replace(/[^\d.]/g, ''));
            const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
            const newValue = Math.max(0, currentValue + variation);
            
            // Update value while preserving format
            const originalText = value.textContent;
            const newText = originalText.replace(/[\d.]+/, newValue.toFixed(1));
            value.textContent = newText;
            
            // Update change indicator
            const isPositive = variation > 0;
            change.className = `kpi-change ${isPositive ? 'positive' : 'negative'}`;
            change.innerHTML = `
                <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i> 
                ${Math.abs(variation).toFixed(1)}%
            `;
        }
    });
}

// Initialize notifications system
function initializeNotifications() {
    // Add event listeners for notification features
    const markAllReadBtn = document.querySelector('.mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllNotificationsRead);
    }
    
    // Initialize search
    initializeSearch();
    
    // Analytics removed - initialize real-time updates only
    setTimeout(() => {
        startRealTimeUpdates();
        
        // Initialize workflow functions
        const createWorkflowBtn = document.querySelector('.workflow-header .btn-primary');
        if (createWorkflowBtn) {
            createWorkflowBtn.addEventListener('click', createNewWorkflow);
        }
        
        // Add click handlers for template actions
        document.addEventListener('click', function(e) {
            if (e.target.matches('.template-card .btn:not(.btn-outline)')) {
                const templateCard = e.target.closest('.template-card');
                const templateName = templateCard.querySelector('h5').textContent;
                editWorkflowTemplate(templateName);
            }
            
            if (e.target.matches('.template-card .btn-outline')) {
                const templateCard = e.target.closest('.template-card');
                const templateName = templateCard.querySelector('h5').textContent;
                cloneWorkflowTemplate(templateName);
            }
        });
        
    }, 1000);
}

// Service Request Modal Functions
function openServiceRequestModal(serviceType) {
    const modal = document.getElementById('serviceRequestModal');
    const modalTitle = document.getElementById('modalServiceTitle');
    const serviceTypeInput = document.getElementById('serviceType');
    
    // Set the service type
    modalTitle.textContent = `Request ${serviceType}`;
    serviceTypeInput.value = serviceType;
    
    // Reset form
    document.getElementById('serviceRequestForm').reset();
    serviceTypeInput.value = serviceType; // Keep service type after reset
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeServiceRequestModal() {
    const modal = document.getElementById('serviceRequestModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function initializeModalHandlers() {
    const modal = document.getElementById('serviceRequestModal');
    const closeBtn = document.querySelector('.modal-close');
    
    // Close modal when clicking the X button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeServiceRequestModal);
    }
    
    // Close modal when clicking outside of it
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeServiceRequestModal();
            }
        });
    }
    
    // Handle form submission
    const form = document.getElementById('serviceRequestForm');
    if (form) {
        form.addEventListener('submit', handleServiceRequestSubmission);
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeServiceRequestModal();
        }
    });
}

function handleServiceRequestSubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const requestData = {
        serviceType: formData.get('serviceType'),
        problemDescription: formData.get('problemDescription'),
        urgencyLevel: formData.get('urgencyLevel'),
        buildingName: formData.get('buildingName'),
        apartmentNumber: formData.get('apartmentNumber'),
        residentName: formData.get('residentName'),
        contactNumber: formData.get('contactNumber'),
        alternateContact: formData.get('alternateContact'),
        preferredTime: formData.get('preferredTime'),
        accessInstructions: formData.get('accessInstructions')
    };
    
    // Validate required fields
    const requiredFields = ['problemDescription', 'urgencyLevel', 'buildingName', 'apartmentNumber', 'residentName', 'contactNumber'];
    const missingFields = requiredFields.filter(field => !requestData[field]);
    
    if (missingFields.length > 0) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Generate request ID
    const requestId = 'SR' + String(Date.now()).slice(-6);
    
    // Simulate API call
    setTimeout(() => {
        // Add to service requests list (in a real app, this would be handled by the backend)
        addNewServiceRequest({
            ...requestData,
            requestId: requestId,
            status: 'pending',
            dateSubmitted: new Date().toLocaleDateString()
        });
        
        showToast(`Service request submitted successfully! Request ID: ${requestId}`, 'success');
        closeServiceRequestModal();
    }, 1000);
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1000);
}

function addNewServiceRequest(requestData) {
    const requestsList = document.querySelector('.requests-list');
    if (!requestsList) return;
    
    const requestItem = document.createElement('div');
    requestItem.className = `request-item ${requestData.status}`;
    requestItem.innerHTML = `
        <div class="request-info">
            <h4>${requestData.serviceType}</h4>
            <p>${requestData.problemDescription}</p>
            <span class="request-id">Request #${requestData.requestId}</span>
        </div>
        <div class="request-status">
            <span class="status ${requestData.status}">${requestData.status.charAt(0).toUpperCase() + requestData.status.slice(1)}</span>
            <span class="request-date">${requestData.dateSubmitted}</span>
        </div>
    `;
    
    // Add to the top of the list
    requestsList.insertBefore(requestItem, requestsList.firstChild);
    
    // Add animation
    requestItem.style.opacity = '0';
    requestItem.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        requestItem.style.transition = 'all 0.3s ease';
        requestItem.style.opacity = '1';
        requestItem.style.transform = 'translateY(0)';
    }, 100);
}

// Role-Based Access Control
function initializeRoleBasedAccess() {
    const userRole = getUserRole();
    if (!userRole) return;
    
    // Hide/show menu items based on role
    const menuItems = document.querySelectorAll('[data-roles]');
    menuItems.forEach(item => {
        const allowedRoles = item.getAttribute('data-roles').split(',');
        if (!allowedRoles.includes(userRole)) {
            item.style.display = 'none';
        } else {
            item.style.display = '';
        }
    });
    
    // Update dashboard content based on role
    updateDashboardForRole(userRole);
    
    // Update user display
    updateUserDisplay(userRole);
}

// getUserRole function is defined earlier in the file

function updateDashboardForRole(role) {
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    
    // Hide/show dashboard cards based on role
    dashboardCards.forEach(card => {
        const cardTitle = card.querySelector('h3').textContent.toLowerCase();
        
        switch(role) {
            case 'guest':
                // Guests can only see guest house and basic info
                if (cardTitle.includes('transport') || 
                    cardTitle.includes('maintenance') || 
                    cardTitle.includes('admin') ||
                    cardTitle.includes('team')) {
                    card.style.display = 'none';
                }
                break;
                
            case 'employee':
                // Employees can see most things except admin functions
                if (cardTitle.includes('admin') || 
                    cardTitle.includes('team assignment') ||
                    cardTitle.includes('user management')) {
                    card.style.display = 'none';
                }
                break;
                
            case 'admin':
                // Admins can see everything
                break;
        }
    });
    
    // Update dashboard title based on role
    const dashboardTitle = document.querySelector('#dashboard .section-header h1');
    const dashboardSubtitle = document.querySelector('#dashboard .section-header p');
    
    if (dashboardTitle && dashboardSubtitle) {
        switch(role) {
            case 'guest':
                dashboardTitle.textContent = 'Guest Portal';
                dashboardSubtitle.textContent = 'Access guest house services and accommodations';
                break;
            case 'employee':
                dashboardTitle.textContent = 'Employee Dashboard';
                dashboardSubtitle.textContent = 'Access transport, guest house, and residence services';
                break;
            case 'admin':
                dashboardTitle.textContent = 'Admin Dashboard';
                dashboardSubtitle.textContent = 'Comprehensive overview and system management';
                break;
        }
    }
}

function updateUserDisplay(role) {
    const userRoleDisplay = document.querySelector('.user-info .user-role');
    if (userRoleDisplay) {
        userRoleDisplay.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    }
    
    // Update role-specific features in sections
    updateSectionFeatures(role);
}

function updateSectionFeatures(role) {
    // Update Transport section for different roles
    const transportSection = document.getElementById('transport');
    if (transportSection) {
        const scheduleTab = transportSection.querySelector('[data-tab="schedule"]');
        if (scheduleTab && role === 'guest') {
            scheduleTab.style.display = 'none';
        }
    }
    
    // Update Guest House section for different roles
    const guestHouseSection = document.getElementById('guesthouse');
    if (guestHouseSection) {
        const visitorTab = guestHouseSection.querySelector('[data-tab="visitors"]');
        if (visitorTab && role === 'guest') {
            visitorTab.style.display = 'none';
        }
    }
    
    // Update Services section for different roles
    const servicesSection = document.getElementById('services');
    if (servicesSection && role === 'guest') {
        // Guests cannot access residence services
        servicesSection.style.display = 'none';
    }
}

// getDefaultSectionForRole function is defined earlier in the file
// Role-based access control is now integrated directly into showSection function above

// Workflow Modal Functions
function openCreateWorkflowModal() {
    const modal = document.getElementById('createWorkflowModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Initialize with first step
    initializeWorkflowSteps();
    
    // Initialize conditional settings
    initializeConditionalSettings();
    
    // Initialize form submission handler
    initializeWorkflowForm();
}

function closeCreateWorkflowModal() {
    const modal = document.getElementById('createWorkflowModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('createWorkflowForm').reset();
    document.getElementById('workflowSteps').innerHTML = '';
}

function initializeWorkflowSteps() {
    const stepsContainer = document.getElementById('workflowSteps');
    stepsContainer.innerHTML = '';
    addWorkflowStep(); // Add initial step
}

function addWorkflowStep() {
    const stepsContainer = document.getElementById('workflowSteps');
    const stepCount = stepsContainer.children.length + 1;
    
    const stepHtml = `
        <div class="workflow-step" data-step="${stepCount}">
            <div class="step-header">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="step-number">${stepCount}</div>
                    <span class="step-title">Step ${stepCount}</span>
                </div>
                ${stepCount > 1 ? '<button type="button" class="step-remove" onclick="removeWorkflowStep(this)"><i class="fas fa-times"></i></button>' : ''}
            </div>
            <div class="step-content">
                <div class="form-group">
                    <label>Step Name</label>
                    <input type="text" name="stepName[]" placeholder="e.g., Manager Approval" required>
                </div>
                <div class="form-group">
                    <label>Approver Role</label>
                    <select name="approverRole[]" required>
                        <option value="">Select role</option>
                        <option value="manager">Direct Manager</option>
                        <option value="dept_head">Department Head</option>
                        <option value="hr">HR Team</option>
                        <option value="finance">Finance Team</option>
                        <option value="admin">System Admin</option>
                        <option value="custom">Custom User</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Approval Type</label>
                    <select name="approvalType[]" required>
                        <option value="required">Required</option>
                        <option value="optional">Optional</option>
                        <option value="conditional">Conditional</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Timeout (Hours)</label>
                    <input type="number" name="stepTimeout[]" placeholder="24" min="1" max="168">
                </div>
            </div>
        </div>
    `;
    
    stepsContainer.insertAdjacentHTML('beforeend', stepHtml);
    updateStepNumbers();
}

function removeWorkflowStep(button) {
    const step = button.closest('.workflow-step');
    step.remove();
    updateStepNumbers();
}

function updateStepNumbers() {
    const steps = document.querySelectorAll('.workflow-step');
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.setAttribute('data-step', stepNumber);
        step.querySelector('.step-number').textContent = stepNumber;
        step.querySelector('.step-title').textContent = `Step ${stepNumber}`;
        
        // Update remove button visibility
        const removeBtn = step.querySelector('.step-remove');
        if (removeBtn) {
            removeBtn.style.display = stepNumber === 1 ? 'none' : 'flex';
        }
    });
}

function initializeConditionalSettings() {
    const autoApproveCheckbox = document.getElementById('autoApprove');
    const escalationCheckbox = document.getElementById('escalationEnabled');
    
    autoApproveCheckbox.addEventListener('change', function() {
        const settings = document.querySelector('.auto-approve-settings');
        settings.style.display = this.checked ? 'block' : 'none';
    });
    
    escalationCheckbox.addEventListener('change', function() {
        const settings = document.querySelector('.escalation-settings');
        settings.style.display = this.checked ? 'block' : 'none';
    });
}

function saveWorkflowDraft() {
    const formData = new FormData(document.getElementById('createWorkflowForm'));
    const workflowData = {
        name: formData.get('workflowName'),
        category: formData.get('workflowCategory'),
        description: formData.get('workflowDescription'),
        priority: formData.get('workflowPriority'),
        sla: formData.get('workflowSLA'),
        status: 'draft',
        steps: collectWorkflowSteps(),
        conditions: collectWorkflowConditions(formData),
        notifications: collectNotificationSettings(formData)
    };
    
    // Save to localStorage as draft
    const drafts = JSON.parse(localStorage.getItem('workflowDrafts') || '[]');
    drafts.push({
        ...workflowData,
        id: 'draft_' + Date.now(),
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('workflowDrafts', JSON.stringify(drafts));
    
    showToast('Workflow saved as draft', 'success');
    closeCreateWorkflowModal();
}

function collectWorkflowSteps() {
    const steps = [];
    const stepElements = document.querySelectorAll('.workflow-step');
    
    stepElements.forEach((stepEl, index) => {
        const stepData = {
            order: index + 1,
            name: stepEl.querySelector('input[name="stepName[]"]').value,
            approverRole: stepEl.querySelector('select[name="approverRole[]"]').value,
            approvalType: stepEl.querySelector('select[name="approvalType[]"]').value,
            timeout: stepEl.querySelector('input[name="stepTimeout[]"]').value || 24
        };
        steps.push(stepData);
    });
    
    return steps;
}

function collectWorkflowConditions(formData) {
    return {
        autoApprove: formData.has('autoApprove'),
        autoApproveLimit: formData.get('autoApproveLimit') || 0,
        escalationEnabled: formData.has('escalationEnabled'),
        escalationTime: formData.get('escalationTime') || 24
    };
}

function collectNotificationSettings(formData) {
    return {
        notifySubmitter: formData.has('notifySubmitter'),
        notifyApprovers: formData.has('notifyApprovers'),
        notifyManager: formData.has('notifyManager')
    };
}

// Handle workflow form submission - this will be initialized when the modal opens
function initializeWorkflowForm() {
    const workflowForm = document.getElementById('createWorkflowForm');
    if (workflowForm && !workflowForm.hasAttribute('data-initialized')) {
        workflowForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleWorkflowCreation();
        });
        workflowForm.setAttribute('data-initialized', 'true');
    }
}

function handleWorkflowCreation() {
    const formData = new FormData(document.getElementById('createWorkflowForm'));
    const workflowData = {
        name: formData.get('workflowName'),
        category: formData.get('workflowCategory'),
        description: formData.get('workflowDescription'),
        priority: formData.get('workflowPriority'),
        sla: formData.get('workflowSLA'),
        status: 'active',
        steps: collectWorkflowSteps(),
        conditions: collectWorkflowConditions(formData),
        notifications: collectNotificationSettings(formData)
    };
    
    // Validate workflow
    if (!workflowData.name || !workflowData.category || workflowData.steps.length === 0) {
        showToast('Please fill in all required fields and add at least one step', 'error');
        return;
    }
    
    // Simulate API call
    const submitBtn = document.querySelector('#createWorkflowForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Generate workflow ID
        const workflowId = 'WF' + String(Date.now()).slice(-6);
        
        // Save workflow (in real app, this would be an API call)
        const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
        workflows.push({
            ...workflowData,
            id: workflowId,
            createdAt: new Date().toISOString(),
            createdBy: 'Admin User'
        });
        localStorage.setItem('workflows', JSON.stringify(workflows));
        
        showToast(`Workflow "${workflowData.name}" created successfully! ID: ${workflowId}`, 'success');
        closeCreateWorkflowModal();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Refresh workflow templates display if needed
        refreshWorkflowTemplates();
    }, 1500);
}

function refreshWorkflowTemplates() {
    // This would refresh the workflow templates display
    // For now, just show a message
    console.log('Workflow templates refreshed');
}
