import Swal from 'sweetalert2'

const showSwal = (options) => {
    // Check both the attribute and localStorage for robustness
    const isDark = document.documentElement.getAttribute('data-coreui-theme') === 'dark' ||
        localStorage.getItem('coreui-free-react-admin-template-theme') === 'dark'

    const defaultOptions = {
        background: isDark ? '#2b3035' : '#fff', // Matching CoreUI dark card bg
        color: isDark ? 'rgba(255, 255, 255, 0.87)' : '#000',
        confirmButtonColor: '#6261cc', // CoreUI Primary
        cancelButtonColor: '#e55353', // CoreUI Danger
        customClass: {
            popup: 'rounded-4 shadow-lg',
            actions: 'd-flex gap-3', // Add gap between buttons
            confirmButton: 'btn btn-primary text-white rounded-3 px-4',
            cancelButton: 'btn btn-danger text-white rounded-3 px-4'
        },
        buttonsStyling: false // Use CoreUI classes
    }

    return Swal.fire({ ...defaultOptions, ...options })
}

export default showSwal
