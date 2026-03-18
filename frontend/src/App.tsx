import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ScrollToTop } from './components/ScrollToTop'
import { AppShell } from './layouts/AppShell'
import { AboutPage } from './pages/AboutPage'
import { AdminClaimsPage } from './pages/AdminClaimsPage'
import { AdminItemsPage } from './pages/AdminItemsPage'
import { AdminItemReviewPage } from './pages/AdminItemReviewPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { BrowseItemsPage } from './pages/BrowseItemsPage'
import { ContactPage } from './pages/ContactPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { ItemDetailPage } from './pages/ItemDetailPage'
import { LoginPage } from './pages/LoginPage'
import { MyAssetsPage } from './pages/MyAssetsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { QrScanPage } from './pages/QrScanPage'
import { ReportFoundPage } from './pages/ReportFoundPage'
import { ReportLostPage } from './pages/ReportLostPage'
import { SignupPage } from './pages/SignupPage'
import { useAuthStore } from './stores/authStore'
import { AdminRoute } from './components/AdminRoute'

export default function App() {
  const location = useLocation()
  const hydrateUser = useAuthStore((s) => s.hydrateUser)

  useEffect(() => {
    hydrateUser()
  }, [hydrateUser])

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowseItemsPage />} />
            <Route path="/items/:id" element={<ItemDetailPage />} />

            <Route
              path="/report/lost"
              element={
                <ProtectedRoute>
                  <ReportLostPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/found"
              element={
                <ProtectedRoute>
                  <ReportFoundPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/assets"
              element={
                <ProtectedRoute>
                  <MyAssetsPage />
                </ProtectedRoute>
              }
            />

            <Route path="/qr/:token" element={<QrScanPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminClaimsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/claims"
              element={
                <AdminRoute>
                  <AdminClaimsPage />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/items"
              element={
                <AdminRoute>
                  <AdminItemsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/items/:id"
              element={
                <AdminRoute>
                  <AdminItemReviewPage />
                </AdminRoute>
              }
            />

            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  )
}
