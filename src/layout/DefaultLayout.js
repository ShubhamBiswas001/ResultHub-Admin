import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'

const DefaultLayout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  const token = sessionStorage.getItem('adminToken')
  if (!token) {
    return null // Or <CSpinner />
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column vh-100 overflow-hidden">
        <AppHeader />
        <div className="body flex-grow-1 overflow-y-auto px-3">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
