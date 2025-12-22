import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  useColorModes
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilSun, cilMoon, cilContrast } from '@coreui/icons'
import { Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import showSwal from '../../../utils/swalCustom'

const Login = () => {
  const navigate = useNavigate()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const [credentials, setCredentials] = useState({ userId: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (sessionStorage.getItem('adminToken')) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.id]: e.target.value })
    setError('')
  }

  const handleLogin = async () => {
    if (!credentials.userId || !credentials.password) {
      showSwal({
        icon: 'warning',
        title: 'Missing Credentials',
        text: 'Please enter both User ID and Password'
      })
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5001/api/admin/login', {
        userId: credentials.userId,
        password: credentials.password
      })

      if (response.data.token) {
        sessionStorage.setItem('adminToken', response.data.token)
        navigate('/dashboard')
      }
    } catch (err) {
      console.error("Login Check Error:", err)
      showSwal({
        icon: 'error',
        title: 'Login Failed',
        text: err.response?.data?.message || 'Invalid User ID or Password'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center position-relative">
      <style>{`
        .form-control:focus, .input-group-text:focus {
          box-shadow: none !important;
          border-color: var(--cui-border-color) !important;
        }
      `}</style>

      {/* Theme Toggler Top Right */}
      <div className="position-absolute top-0 end-0 m-3">
        <CDropdown placement="bottom-end">
          <CDropdownToggle
            caret={false}
            color="secondary"
            variant="ghost"
            className="rounded-circle p-0 d-flex align-items-center justify-content-center border"
            style={{ width: '40px', height: '40px' }}
          >
            {colorMode === 'dark' ? (
              <CIcon icon={cilMoon} size="lg" />
            ) : colorMode === 'auto' ? (
              <CIcon icon={cilContrast} size="lg" />
            ) : (
              <CIcon icon={cilSun} size="lg" />
            )}
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem
              active={colorMode === 'light'}
              className="d-flex align-items-center"
              as="button"
              type="button"
              onClick={() => setColorMode('light')}
            >
              <CIcon className="me-2" icon={cilSun} size="lg" /> Light
            </CDropdownItem>
            <CDropdownItem
              active={colorMode === 'dark'}
              className="d-flex align-items-center"
              as="button"
              type="button"
              onClick={() => setColorMode('dark')}
            >
              <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
            </CDropdownItem>
            <CDropdownItem
              active={colorMode === 'auto'}
              className="d-flex align-items-center"
              as="button"
              type="button"
              onClick={() => setColorMode('auto')}
            >
              <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </div>

      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
            <CCard className="p-4 shadow-lg border-0 rounded-4">
              <CCardBody>
                <CForm>
                  <div className="text-center mb-5">
                    <h2 className="text-primary fw-bold mb-2">Admin Portal</h2>
                    <h5 className="text-body-secondary">Student Result Management System</h5>
                    <p className="text-muted small">Sign in to manage the platform</p>
                  </div>

                  {/* Error Alert Removed (replaced by Swal) */}

                  <CInputGroup className="mb-4">
                    <CInputGroupText className="bg-transparent text-body">
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="User ID"
                      autoComplete="username"
                      id="userId"
                      value={credentials.userId}
                      onChange={handleChange}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText className="bg-transparent text-body">
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      autoComplete="new-password"
                      id="password"
                      value={credentials.password}
                      onChange={handleChange}
                      className="border-end-0"
                    />
                    <CInputGroupText
                      className="bg-transparent border-start-0 text-body"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'transparent'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </CInputGroupText>
                  </CInputGroup>

                  <CRow>
                    <CCol xs={12}>
                      <CButton
                        color="primary"
                        className="px-4 w-100 fw-bold py-2 rounded-3 shadow-sm"
                        onClick={handleLogin}
                        disabled={loading}
                        style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
                      >
                        {loading ? 'LOGGING IN...' : 'LOG IN'}
                      </CButton>
                    </CCol>
                  </CRow>

                  <div className="mt-5 text-center text-muted small">
                    <p className="mb-0">&copy; 2024 Student Result Management System.</p>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
