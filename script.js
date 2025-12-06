// Variables globales
let reportsData = [];

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha por defecto como hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    document.getElementById('date').max = today;
    
    // Cargar estadísticas
    loadStats();
    
    // Manejo del formulario
    const form = document.getElementById('reportForm');
    form.addEventListener('submit', handleFormSubmit);
    
    // Manejo del modal
    const modal = document.getElementById('reportsModal');
    const openModalBtns = document.querySelectorAll('#viewReportsBtn, .view-reports-link');
    const closeModalBtn = document.querySelector('.close-modal');
    
    openModalBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    });
    
    closeModalBtn.addEventListener('click', closeModal);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Botón para descargar CSV
    document.getElementById('downloadCSV').addEventListener('click', downloadCSV);
    
    // Búsqueda en reportes
    document.getElementById('searchReports').addEventListener('input', filterReports);
    
    // Efectos visuales en campos del formulario
    const formInputs = document.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
});

// Función para manejar el envío del formulario
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    // Validación
    if (!validateForm()) {
        return;
    }
    
    // Deshabilitar botón y mostrar carga
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    try {
        // Obtener datos del formulario
        const formData = getFormData();
        
        // Enviar datos al servidor (simulación)
        const success = await submitToServer(formData);
        
        if (success) {
            // Mostrar mensaje de éxito
            showNotification('¡Reporte enviado con éxito! Gracias por tu colaboración.', 'success');
            
            // Resetear formulario
            document.getElementById('reportForm').reset();
            
            // Establecer fecha por defecto como hoy
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('date').value = today;
            
            // Actualizar estadísticas
            loadStats();
        } else {
            showNotification('Error al enviar el reporte. Por favor, inténtalo de nuevo.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al enviar el reporte. Por favor, inténtalo de nuevo.', 'error');
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Obtener datos del formulario
function getFormData() {
    const form = document.getElementById('reportForm');
    const formData = {
        timestamp: new Date().toISOString(),
        foundNet: form.foundNet.value,
        location: form.location.value,
        date: form.date.value,
        description: form.description.value,
        photo: form.photo.value || 'No proporcionado',
        video: form.video.value || 'No proporcionado',
        name: form.name.value,
        phone: form.phone.value,
        email: form.email.value,
        contactMethod: form.contactMethod.value,
        permission: 'Sí'
    };
    
    return formData;
}

// Validar formulario
function validateForm() {
    const requiredFields = document.querySelectorAll('#reportForm [required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = 'var(--danger)';
            
            // Scroll al primer campo con error
            if (isValid === false) {
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            field.style.borderColor = '#ddd';
        }
    });
    
    // Validar email
    const emailField = document.getElementById('email');
    if (emailField.value && !isValidEmail(emailField.value)) {
        isValid = false;
        emailField.style.borderColor = 'var(--danger)';
        showNotification('Por favor, introduce un correo electrónico válido.', 'error');
    }
    
    if (!isValid) {
        showNotification('Por favor, complete todos los campos obligatorios (*).', 'error');
    }
    
    return isValid;
}

// Validar email
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Simular envío al servidor
async function submitToServer(formData) {
    // En un entorno real, aquí harías una petición fetch a tu backend
    // Para este ejemplo, simulamos un envío exitoso
    
    // Guardar en localStorage para persistencia
    saveToLocalStorage(formData);
    
    // También guardaríamos en el "backend" simulado
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 1500);
    });
}

// Guardar en localStorage
function saveToLocalStorage(formData) {
    let reports = JSON.parse(localStorage.getItem('ghostDivingReports') || '[]');
    reports.push(formData);
    localStorage.setItem('ghostDivingReports', JSON.stringify(reports));
}

// Cargar estadísticas
function loadStats() {
    const reports = JSON.parse(localStorage.getItem('ghostDivingReports') || '[]');
    
    // Actualizar contador
    document.getElementById('totalReports').textContent = reports.length;
    
    // Actualizar última fecha
    if (reports.length > 0) {
        const lastReport = reports[reports.length - 1];
        const lastDate = new Date(lastReport.timestamp).toLocaleDateString('es-ES');
        document.getElementById('lastReport').textContent = lastDate;
    }
    
    // Guardar datos para el modal
    reportsData = reports;
}

// Abrir modal
function openModal() {
    const modal = document.getElementById('reportsModal');
    modal.style.display = 'block';
    loadReportsTable();
}

// Cerrar modal
function closeModal() {
    const modal = document.getElementById('reportsModal');
    modal.style.display = 'none';
}

// Cargar tabla de reportes
function loadReportsTable() {
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = '';
    
    if (reportsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">No hay reportes aún. ¡Sé el primero en reportar una red!</td></tr>';
        return;
    }
    
    // Ordenar por fecha más reciente primero
    const sortedReports = [...reportsData].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    sortedReports.forEach(report => {
        const row = document.createElement('tr');
        
        // Formatear fecha
        const date = new Date(report.timestamp);
        const formattedDate = date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Limitar descripción
        const shortDesc = report.description.length > 50 
            ? report.description.substring(0, 50) + '...' 
            : report.description;
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${report.name}</td>
            <td>${report.location}</td>
            <td>${shortDesc}</td>
            <td>${report.email}<br><small>${report.phone}</small></td>
        `;
        
        tbody.appendChild(row);
    });
}

// Filtrar reportes
function filterReports() {
    const searchTerm = document.getElementById('searchReports').value.toLowerCase();
    const rows = document.querySelectorAll('#reportsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Descargar CSV
function downloadCSV() {
    if (reportsData.length === 0) {
        showNotification('No hay datos para descargar.', 'warning');
        return;
    }
    
    // Crear contenido CSV
    const headers = ['Fecha y hora', '¿Encontró red?', 'Lugar', 'Fecha hallazgo', 'Descripción', 'Foto', 'Vídeo', 'Nombre', 'Teléfono', 'Email', 'Método contacto', 'Permiso'];
    
    const csvContent = [
        headers.join(','),
        ...reportsData.map(report => [
            new Date(report.timestamp).toLocaleString('es-ES'),
            `"${report.foundNet}"`,
            `"${report.location}"`,
            report.date,
            `"${report.description.replace(/"/g, '""')}"`,
            report.photo,
            report.video,
            `"${report.name}"`,
            `"${report.phone}"`,
            report.email,
            report.contactMethod,
            report.permission
        ].join(','))
    ].join('\n');
    
    // Crear y descargar archivo
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `reportes_ghost_diving_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Archivo CSV descargado correctamente.', 'success');
}

// Mostrar notificación
function showNotification(message, type) {
    // Eliminar notificación anterior si existe
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Estilos para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 3000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s, fadeOut 0.3s 3s forwards;
        min-width: 300px;
        max-width: 400px;
    `;
    
    // Colores según tipo
    if (type === 'success') {
        notification.style.backgroundColor = '#27ae60';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#e74c3c';
    } else {
        notification.style.backgroundColor = '#f39c12';
    }
    
    // Animaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            to { opacity: 0; visibility: hidden; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Eliminar después de 3.5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3500);
}

// Cargar estadísticas actualizado
function loadStats() {
    const reports = JSON.parse(localStorage.getItem('ghostDivingReports') || '[]');
    
    // Actualizar contador total
    document.getElementById('totalReports').textContent = reports.length;
    
    // Contar reportes anónimos
    const anonymousCount = reports.filter(report => report.anonymous === true).length;
    document.getElementById('anonymousReports').textContent = anonymousCount;
    
    // Actualizar última fecha
    if (reports.length > 0) {
        const lastReport = reports[reports.length - 1];
        const lastDate = new Date(lastReport.timestamp).toLocaleDateString('es-ES');
        document.getElementById('lastReport').textContent = lastDate;
    }
    
    // Guardar datos para el modal
    reportsData = reports;
}

// Nueva función para manejar la opción anónima
function setupAnonymousOption() {
    const anonymousCheckbox = document.getElementById('anonymous');
    const contactInfoSection = document.getElementById('contactInfoSection');
    const contactFields = document.querySelectorAll('.contact-field');
    
    anonymousCheckbox.addEventListener('change', function() {
        if (this.checked) {
            // Ocultar sección de contacto
            contactInfoSection.style.display = 'none';
            
            // Quitar required de campos de contacto
            contactFields.forEach(field => {
                field.required = false;
                if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
                    field.value = '';
                }
            });
            
            // Mostrar mensaje
            showNotification('¡Modo anónimo activado! No se guardarán tus datos personales.', 'info');
        } else {
            // Mostrar sección de contacto
            contactInfoSection.style.display = 'block';
            
            // Añadir required a campos de contacto
            contactFields.forEach(field => {
                if (field.classList.contains('required')) {
                    field.required = true;
                }
            });
        }
    });
}

// Obtener datos del formulario actualizado
function getFormData() {
    const form = document.getElementById('reportForm');
    const isAnonymous = document.getElementById('anonymous').checked;
    
    const formData = {
        timestamp: new Date().toISOString(),
        reportId: 'REP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        anonymous: isAnonymous,
        foundNet: form.foundNet.value,
        location: form.location.value,
        date: form.date.value,
        description: form.description.value,
        photo: form.photo.value || 'No proporcionado',
        video: form.video.value || 'No proporcionado',
        lopd1: document.getElementById('lopd1').checked ? 'Sí' : 'No',
        lopd2: document.getElementById('lopd2').checked ? 'Sí' : 'No',
        lopd3: document.getElementById('lopd3').checked ? 'Sí' : 'No'
    };
    
    // Solo incluir datos personales si no es anónimo
    if (!isAnonymous) {
        formData.name = form.name.value;
        formData.phone = form.phone.value;
        formData.email = form.email.value;
        formData.contactMethod = form.contactMethod.value;
    } else {
        formData.name = 'ANÓNIMO';
        formData.phone = 'NO PROPORCIONADO';
        formData.email = 'NO PROPORCIONADO';
        formData.contactMethod = 'NO APLICA';
    }
    
    return formData;
}

// Validar formulario actualizado para LOPD
function validateForm() {
    const requiredFields = document.querySelectorAll('#reportForm [required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim() && field.id !== 'anonymous') {
            isValid = false;
            field.style.borderColor = 'var(--danger)';
            
            // Scroll al primer campo con error
            if (isValid === false) {
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            field.style.borderColor = '#ddd';
        }
    });
    
    // Validar email solo si no es anónimo y se proporciona
    const emailField = document.getElementById('email');
    const isAnonymous = document.getElementById('anonymous').checked;
    
    if (!isAnonymous && emailField.value && !isValidEmail(emailField.value)) {
        isValid = false;
        emailField.style.borderColor = 'var(--danger)';
        showNotification('Por favor, introduce un correo electrónico válido.', 'error');
    }
    
    // Validar consentimiento LOPD
    const lopd1 = document.getElementById('lopd1');
    if (!lopd1.checked) {
        isValid = false;
        lopd1.parentElement.style.color = 'var(--danger)';
        showNotification('Debe aceptar la Política de Privacidad para continuar.', 'error');
    } else {
        lopd1.parentElement.style.color = '';
    }
    
    if (!isValid) {
        showNotification('Por favor, complete todos los campos obligatorios (*).', 'error');
    }
    
    return isValid;
}

// Cargar tabla de reportes actualizado
function loadReportsTable() {
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = '';
    
    if (reportsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">No hay reportes aún. ¡Sé el primero en reportar una red!</td></tr>';
        return;
    }
    
    // Ordenar por fecha más reciente primero
    const sortedReports = [...reportsData].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    sortedReports.forEach(report => {
        const row = document.createElement('tr');
        
        // Formatear fecha
        const date = new Date(report.timestamp);
        const formattedDate = date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Limitar descripción
        const shortDesc = report.description.length > 50 
            ? report.description.substring(0, 50) + '...' 
            : report.description;
        
        // Tipo de reporte
        const reportType = report.anonymous ? 
            `Red encontrada <span class="anonymous-badge">ANÓNIMO</span>` : 
            'Red encontrada';
        
        // Información de contacto (respetando LOPD)
        let contactInfo = 'Reporte anónimo';
        if (!report.anonymous) {
            // Mostrar solo inicial del nombre y dominio del email por privacidad
            const nameParts = report.name.split(' ');
            const firstName = nameParts[0];
            const initial = firstName.charAt(0) + '.';
            
            const emailParts = report.email.split('@');
            const emailDomain = emailParts[1];
            
            contactInfo = `${initial} - ${emailDomain}`;
        }
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${reportType}</td>
            <td>${report.location}</td>
            <td>${shortDesc}</td>
            <td>${contactInfo}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Descargar CSV actualizado (LOPD compliant)
function downloadCSV() {
    if (reportsData.length === 0) {
        showNotification('No hay datos para descargar.', 'warning');
        return;
    }
    
    // Confirmar que el usuario tiene permiso para descargar datos
    if (!confirm('ATENCIÓN: Va a descargar datos personales protegidos por la LOPD.\n\nSolo debe descargar estos datos si es personal autorizado de Ghost Diving Levante y para fines legítimos.\n\n¿Confirma que tiene autorización para acceder a estos datos?')) {
        return;
    }
    
    // Crear contenido CSV con todos los datos (para administradores)
    const headers = [
        'ID Reporte', 'Fecha creación', 'Anónimo', '¿Encontró red?', 
        'Lugar', 'Fecha hallazgo', 'Descripción', 'Foto', 'Vídeo',
        'Nombre', 'Teléfono', 'Email', 'Método contacto',
        'Acepta política', 'Acepta información', 'Acepta uso multimedia'
    ];
    
    const csvContent = [
        headers.join(','),
        ...reportsData.map(report => [
            report.reportId,
            new Date(report.timestamp).toLocaleString('es-ES'),
            report.anonymous ? 'Sí' : 'No',
            `"${report.foundNet}"`,
            `"${report.location}"`,
            report.date,
            `"${report.description.replace(/"/g, '""')}"`,
            report.photo,
            report.video,
            report.anonymous ? 'ANÓNIMO' : `"${report.name}"`,
            report.anonymous ? 'NO PROPORCIONADO' : `"${report.phone}"`,
            report.anonymous ? 'NO PROPORCIONADO' : report.email,
            report.contactMethod,
            report.lopd1,
            report.lopd2 || 'No',
            report.lopd3 || 'No'
        ].join(','))
    ].join('\n');
    
    // Crear y descargar archivo
    const blob = new Blob(['\uFEFF' + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `reportes_ghost_diving_${today}_LOPD.csv`;
    link.innerHTML = 'Descargando...';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Registrar la descarga por temas de auditoría LOPD
    const downloadLog = {
        timestamp: new Date().toISOString(),
        action: 'download_csv',
        file: `reportes_ghost_diving_${today}_LOPD.csv`,
        recordCount: reportsData.length
    };
    
    let auditLog = JSON.parse(localStorage.getItem('lopdAuditLog') || '[]');
    auditLog.push(downloadLog);
    localStorage.setItem('lopdAuditLog', JSON.stringify(auditLog));
    
    showNotification('Archivo CSV descargado correctamente. Esta acción ha sido registrada en el log de auditoría LOPD.', 'success');
}

// Inicialización actualizada
document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha por defecto como hoy
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('date')) {
        document.getElementById('date').value = today;
        document.getElementById('date').max = today;
    }
    
    // Cargar estadísticas solo en index.html
    if (document.getElementById('totalReports')) {
        loadStats();
        
        // Configurar opción anónima
        setupAnonymousOption();
        
        // Manejo del formulario
        const form = document.getElementById('reportForm');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
        
        // Manejo del modal
        const modal = document.getElementById('reportsModal');
        const openModalBtns = document.querySelectorAll('#viewReportsBtn, .view-reports-link');
        const closeModalBtn = document.querySelector('.close-modal');
        
        openModalBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                openModal();
            });
        });
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }
        
        // Cerrar modal al hacer clic fuera
        if (modal) {
            window.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }
        
        // Botón para descargar CSV
        const downloadBtn = document.getElementById('downloadCSV');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', downloadCSV);
        }
        
        // Búsqueda en reportes
        const searchInput = document.getElementById('searchReports');
        if (searchInput) {
            searchInput.addEventListener('input', filterReports);
        }
    }
    
    // Efectos visuales en campos del formulario
    const formInputs = document.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
    
    // Añadir enlace para política de cookies
    const cookiesLink = document.getElementById('cookiesLink');
    if (cookiesLink) {
        cookiesLink.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Este sitio solo utiliza cookies técnicas necesarias para su funcionamiento. No utilizamos cookies de seguimiento.', 'info');
        });
    }
});
