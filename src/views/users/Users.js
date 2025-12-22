import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { Pencil, Trash2, Ban, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Check, X } from 'lucide-react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableBody,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CTableDataCell,
    CFormSelect,
    CSpinner,
    CBadge,
    CButton,
    CTooltip,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CForm,
    CFormLabel,
    CFormInput,
    CPagination,
    CPaginationItem
} from '@coreui/react'
import axios from 'axios'
import showSwal from '../../utils/swalCustom'
import { useLocation } from 'react-router-dom'

const Users = () => {
    // Add custom styles for hover effect
    const styles = `
        .action-btn:hover {
            transform: scale(1.2);
        }
        .action-btn:hover svg {
            stroke-width: 3px;
        }
        .user-card {
            height: calc(100vh - 260px);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            margin-bottom: 10px !important;
        }
        .user-card-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            padding: 0 !important;
        }
        .pagination-container {
            display: flex;
            justify-content: flex-end;
            margin-top: 0;
            padding: 10px 1.25rem;
        }
        .table-responsive-container {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            position: relative;
            padding: 1rem;
        }
        .sticky-header th {
            position: sticky;
            top: 0;
            z-index: 10;
            background-color: var(--cui-card-bg);
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
    `

    // Inject styles
    useEffect(() => {
        const styleSheet = document.createElement("style")
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)
        return () => {
            document.head.removeChild(styleSheet)
        }
    }, [])

    const location = useLocation()
    const [users, setUsers] = useState([])
    const [filter, setFilter] = useState('all')
    const [roleFilter, setRoleFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(25)

    // Edit Modal State
    const [visible, setVisible] = useState(false)
    const [editingUser, setEditingUser] = useState({
        _id: '',
        name: '',
        email: '',
        role: '',
        studentId: '',
        rollNumber: ''
    })

    useEffect(() => {
        fetchUsers()

        // Setup WebSocket connection
        const socket = io('http://localhost:5001')

        socket.on('connect', () => {
            console.log('Admin connected to WebSocket server')
        })

        socket.on('newUserRegistration', (data) => {
            console.log('New user registered:', data.user)
            // Refresh users list
            fetchUsers()
        })

        socket.on('userRejected', () => {
            fetchUsers()
        })


        socket.on('userDeleted', (data) => {
            console.log('User deleted:', data.user)
            // Refresh users list to remove deleted user from all tabs
            fetchUsers()
        })

        socket.on('disconnect', () => {
            console.log('Admin disconnected from WebSocket server')
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    useEffect(() => {
        const path = location.pathname
        setRoleFilter('all') // Reset role filter on route change
        if (path.includes('/teachers')) {
            setFilter('teacher')
        } else if (path.includes('/students')) {
            setFilter('student')
        } else if (path.includes('/requests')) {
            setFilter('requests')
        } else {
            setFilter('all')
        }
        setCurrentPage(1) // Reset to first page on filter change
    }, [location])

    const fetchUsers = async () => {
        setLoading(true)
        setError(false)
        try {
            // Fetch users from the new admin endpoint
            const response = await axios.get('http://localhost:5001/api/admin/users')
            setUsers(response.data)
        } catch (error) {
            console.error(error)
            setError(true)
            showSwal({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch users'
            })
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(user => {
        // Apply Role Filter first (for Requests and All Pages)
        if (roleFilter !== 'all' && user.role !== roleFilter) return false

        if (filter === 'all') return user.isApproved === true // Only approved users
        if (filter === 'requests') return true // Show all users in requests (pending, approved, rejected)
        if (filter === 'teacher' || filter === 'student') {
            return user.role === filter && user.isApproved === true // Only approved users of that role
        }
        return user.role === filter
    })

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const getBadgeColor = (role) => {
        return role === 'student' ? 'info' : 'success'
    }

    const getApprovalStatus = (user) => {
        if (user.isRejected) {
            return { text: 'Rejected', color: 'danger' }
        } else if (user.isApproved) {
            return { text: 'Approved', color: 'success' }
        } else {
            return { text: 'Waiting for Approval', color: 'warning' }
        }
    }

    const getPageTitle = () => {
        if (filter === 'teacher') return 'Teachers'
        if (filter === 'student') return 'Students'
        if (filter === 'requests') return 'Requests'
        return 'Users'
    }

    const handleAction = async (action, user) => {
        if (action === 'approve') {
            const result = await showSwal({
                title: 'Approve User?',
                text: `Approve ${user.name} as ${user.role}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, approve!',
                cancelButtonText: 'Cancel'
            })

            if (result.isConfirmed) {
                try {
                    await axios.put(`http://localhost:5001/api/admin/users/${user._id}/approve`)
                    setUsers(users.map(u => u._id === user._id ? { ...u, isApproved: true } : u))
                    showSwal({
                        icon: 'success',
                        title: 'Approved!',
                        text: 'User has been approved.'
                    })
                } catch (error) {
                    showSwal({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to approve user'
                    })
                }
            }
        } else if (action === 'reject') {
            const result = await showSwal({
                title: 'Reject User?',
                text: `Reject ${user.name}'s registration?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, reject!',
                cancelButtonText: 'Cancel'
            })

            if (result.isConfirmed) {
                try {
                    await axios.put(`http://localhost:5001/api/admin/users/${user._id}/reject`)
                    setUsers(users.filter(u => u._id !== user._id))
                    showSwal({
                        icon: 'success',
                        title: 'Rejected & Deleted',
                        text: 'User registration has been rejected and deleted.'
                    })
                } catch (error) {
                    showSwal({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to reject user'
                    })
                }
            }
        } else if (action === 'edit') {
            setEditingUser({ ...user })
            setVisible(true)
        } else if (action === 'delete') {
            const result = await showSwal({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            })

            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:5001/api/admin/users/${user._id}`)
                    setUsers(users.filter(u => u._id !== user._id))
                    showSwal({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'User has been deleted.'
                    })
                } catch (error) {
                    showSwal({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete user'
                    })
                }
            }
        } else if (action === 'suspend') {
            showSwal({
                icon: 'info',
                title: 'Feature Pending',
                text: 'Suspend functionality coming soon'
            })
        }
    }

    const handleEditChange = (e) => {
        const { name, value } = e.target
        let finalValue = value

        if (name === 'name') {
            // Capitalize first letter and make rest small
            if (value.length > 0) {
                finalValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
            }
        }

        setEditingUser({ ...editingUser, [name]: finalValue })
    }

    const saveChanges = async () => {
        try {
            await axios.put(`http://localhost:5001/api/admin/users/${editingUser._id}`, editingUser)
            setUsers(users.map(u => u._id === editingUser._id ? editingUser : u))
            setVisible(false)
            showSwal({
                icon: 'success',
                title: 'Success',
                text: 'User updated successfully'
            })
        } catch (error) {
            console.error(error)
            showSwal({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update user'
            })
        }
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4 user-card">
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <strong>{getPageTitle()}</strong>
                        <div className="d-flex gap-3 align-items-center">
                            {/* Rows Per Page Dropdown */}
                            <div className="d-flex align-items-center">
                                <span className="me-2 small text-muted">Rows:</span>
                                <CFormSelect
                                    value={itemsPerPage === 99999 ? 'all' : itemsPerPage}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        setItemsPerPage(val === 'all' ? 99999 : parseInt(val))
                                        setCurrentPage(1) // Reset to first page when changing limit
                                    }}
                                    size="sm"
                                    style={{ width: '70px' }}
                                >
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                    <option value="all">All</option>
                                </CFormSelect>
                            </div>

                            {(filter === 'all' || filter === 'requests') && (
                                <div style={{ width: '200px' }}>
                                    <CFormSelect
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        size="sm"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                    </CFormSelect>
                                </div>
                            )}
                        </div>
                    </CCardHeader>
                    <CCardBody className="user-card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <CSpinner color="primary" />
                            </div>
                        ) : error ? (
                            <div className="text-center py-5 text-danger">
                                unable to fetch data
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive-container">
                                    <CTable hover responsive align="middle">
                                        <CTableHead className="sticky-header">
                                            <CTableRow>
                                                <CTableHeaderCell style={{ width: '20%' }}>Name</CTableHeaderCell>
                                                {filter !== 'student' && (
                                                    <CTableHeaderCell style={{ width: '20%' }}>Email</CTableHeaderCell>
                                                )}
                                                <CTableHeaderCell style={{ width: '12%' }} className="text-center">Role</CTableHeaderCell>
                                                {filter === 'requests' && (
                                                    <CTableHeaderCell style={{ width: '18%' }} className="text-center">Status</CTableHeaderCell>
                                                )}
                                                <CTableHeaderCell style={{ width: '15%' }}>Details</CTableHeaderCell>
                                                <CTableHeaderCell style={{ width: '15%' }} className="text-center">Action</CTableHeaderCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {currentItems.map((user) => (
                                                <CTableRow key={user._id}>
                                                    <CTableDataCell>
                                                        <div className="fw-semibold">{user.name}</div>
                                                        <div className="small text-medium-emphasis">
                                                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </CTableDataCell>
                                                    {filter !== 'student' && (
                                                        <CTableDataCell>{user.email || 'N/A'}</CTableDataCell>
                                                    )}
                                                    <CTableDataCell className="text-center">
                                                        <CBadge color={getBadgeColor(user.role)}>
                                                            {user.role ? user.role.toUpperCase() : 'UNKNOWN'}
                                                        </CBadge>
                                                    </CTableDataCell>
                                                    {filter === 'requests' && (
                                                        <CTableDataCell className="text-center">
                                                            <CBadge color={getApprovalStatus(user).color}>
                                                                {getApprovalStatus(user).text}
                                                            </CBadge>
                                                        </CTableDataCell>
                                                    )}
                                                    <CTableDataCell>
                                                        {user.role === 'student' ? (
                                                            <div>
                                                                <div>Roll: <strong>{user.rollNumber}</strong></div>
                                                            </div>
                                                        ) : (
                                                            /* Teachers might not have specific extra fields to show right now */
                                                            <div className="small text-medium-emphasis">ID: {user.studentId || user._id.slice(-6)}</div>
                                                        )}
                                                    </CTableDataCell>
                                                    <CTableDataCell className="text-center">
                                                        <div className="d-flex justify-content-center gap-3">
                                                            {filter === 'requests' ? (
                                                                !user.isApproved && !user.isRejected ? (
                                                                    <>
                                                                        <CTooltip content="Approve User">
                                                                            <button
                                                                                className="btn btn-link p-0 text-success action-btn"
                                                                                onClick={() => handleAction('approve', user)}
                                                                                style={{ transition: 'all 0.2s', border: 'none', background: 'transparent' }}
                                                                            >
                                                                                <Check size={18} />
                                                                            </button>
                                                                        </CTooltip>
                                                                        <CTooltip content="Reject User">
                                                                            <button
                                                                                className="btn btn-link p-0 text-danger action-btn"
                                                                                onClick={() => handleAction('reject', user)}
                                                                                style={{ transition: 'all 0.2s', border: 'none', background: 'transparent' }}
                                                                            >
                                                                                <X size={18} />
                                                                            </button>
                                                                        </CTooltip>
                                                                        <CTooltip content="Delete User">
                                                                            <button
                                                                                className="btn btn-link p-0 text-danger action-btn"
                                                                                onClick={() => handleAction('delete', user)}
                                                                                style={{ transition: 'all 0.2s', border: 'none', background: 'transparent' }}
                                                                            >
                                                                                <Trash2 size={18} />
                                                                            </button>
                                                                        </CTooltip>
                                                                    </>
                                                                ) : (
                                                                    <CTooltip content="Delete User">
                                                                        <button
                                                                            className="btn btn-link p-0 text-danger action-btn"
                                                                            onClick={() => handleAction('delete', user)}
                                                                            style={{ transition: 'all 0.2s', border: 'none', background: 'transparent' }}
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </button>
                                                                    </CTooltip>
                                                                )
                                                            ) : (
                                                                <>
                                                                    <CTooltip content="Edit User">
                                                                        <button
                                                                            className="btn btn-link p-0 text-info action-btn"
                                                                            onClick={() => handleAction('edit', user)}
                                                                            style={{ transition: 'all 0.2s', border: 'none', background: 'transparent' }}
                                                                        >
                                                                            <Pencil size={18} />
                                                                        </button>
                                                                    </CTooltip>
                                                                    <CTooltip content="Suspend User">
                                                                        <button
                                                                            className="btn btn-link p-0 text-warning action-btn"
                                                                            onClick={() => handleAction('suspend', user)}
                                                                            style={{ transition: 'all 0.2s', border: 'none', background: 'transparent' }}
                                                                        >
                                                                            <Ban size={18} />
                                                                        </button>
                                                                    </CTooltip>
                                                                    <CTooltip content="Delete User">
                                                                        <button
                                                                            className="btn btn-link p-0 text-danger action-btn"
                                                                            onClick={() => handleAction('delete', user)}
                                                                            style={{ transition: 'all 0.2s', border: 'none', background: 'transparent' }}
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </button>
                                                                    </CTooltip>
                                                                </>
                                                            )}
                                                        </div>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <CTableRow>
                                                    <CTableDataCell
                                                        colSpan={filter === 'requests' ? '6' : filter === 'student' ? '4' : '5'}
                                                        className="text-center py-4"
                                                    >
                                                        No Data Found
                                                    </CTableDataCell>
                                                </CTableRow>
                                            )}
                                        </CTableBody>
                                    </CTable>
                                </div>
                            </>
                        )}
                    </CCardBody>
                </CCard>

                {/* Pagination Controls - Outside Card */}
                {filteredUsers.length > 0 && (
                    <div className="pagination-container">
                        <CPagination align="end" aria-label="Page navigation" className="mb-0">
                            <CPaginationItem
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(1)}
                                style={{ cursor: currentPage === 1 ? 'default' : 'pointer' }}
                            >
                                <ChevronsLeft size={16} />
                            </CPaginationItem>
                            <CPaginationItem
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                style={{ cursor: currentPage === 1 ? 'default' : 'pointer' }}
                            >
                                <ChevronLeft size={16} />
                            </CPaginationItem>

                            {(() => {
                                const pages = []
                                for (let i = 1; i <= totalPages; i++) {
                                    if (
                                        i === 1 ||
                                        i === totalPages ||
                                        (i >= currentPage - 1 && i <= currentPage + 1)
                                    ) {
                                        pages.push(i)
                                    } else if (
                                        i === currentPage - 2 ||
                                        i === currentPage + 2
                                    ) {
                                        pages.push('...')
                                    }
                                }

                                // Remove duplicates from '...' logic if any
                                const uniquePages = [...new Set(pages)];

                                return uniquePages.map((page, index) => (
                                    <CPaginationItem
                                        key={index}
                                        active={page === currentPage}
                                        disabled={page === '...'}
                                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                                        style={{ cursor: page === '...' ? 'default' : 'pointer' }}
                                    >
                                        {page}
                                    </CPaginationItem>
                                ))
                            })()}

                            <CPaginationItem
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                                style={{ cursor: currentPage === totalPages ? 'default' : 'pointer' }}
                            >
                                <ChevronRight size={16} />
                            </CPaginationItem>
                            <CPaginationItem
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(totalPages)}
                                style={{ cursor: currentPage === totalPages ? 'default' : 'pointer' }}
                            >
                                <ChevronsRight size={16} />
                            </CPaginationItem>
                        </CPagination>
                    </div>
                )}

                <CModal visible={visible} onClose={() => setVisible(false)}>
                    <CModalHeader>
                        <CModalTitle>Edit User</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <CForm>
                            <div className="mb-3">
                                <CFormLabel>Name</CFormLabel>
                                <CFormInput
                                    type="text"
                                    name="name"
                                    value={editingUser.name}
                                    onChange={handleEditChange}
                                />
                            </div>
                            {editingUser.role === 'teacher' && (
                                <>
                                    <div className="mb-3">
                                        <CFormLabel>Email</CFormLabel>
                                        <CFormInput
                                            type="email"
                                            name="email"
                                            value={editingUser.email}
                                            onChange={handleEditChange}
                                        />
                                    </div>

                                </>
                            )}
                            {editingUser.role === 'student' && (
                                <div className="mb-3">
                                    <CFormLabel>Roll Number</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        name="rollNumber"
                                        value={editingUser.rollNumber}
                                        onChange={handleEditChange}
                                    />
                                </div>
                            )}
                        </CForm>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setVisible(false)}>
                            Close
                        </CButton>
                        <CButton color="primary" onClick={saveChanges}>
                            Save changes
                        </CButton>
                    </CModalFooter>
                </CModal>
            </CCol>
        </CRow >
    )
}

export default Users


