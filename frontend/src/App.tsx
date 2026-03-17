import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ScrollToTop } from './components/ScrollToTop'
import { AppShell } from './layouts/AppShell'
import { AboutPage } from './pages/AboutPage'
import { BrowseItemsPage } from './pages/BrowseItemsPage'
import { ContactPage } from './pages/ContactPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { ItemDetailPage } from './pages/ItemDetailPage'
import { LoginPage } from './pages/LoginPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { ReportFoundPage } from './pages/ReportFoundPage'
import { ReportLostPage } from './pages/ReportLostPage'
import { SignupPage } from './pages/SignupPage'

export default function App() {
  const location = useLocation()

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

            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

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
