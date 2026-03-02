import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Welcome from '../pages/Welcome'
import Dashboard from '../pages/Dashboard'
import Playlists from '../pages/Playlists'
import Settings from '../pages/Settings'
import Rotation from '../pages/Rotation'
import Stats from '../pages/Stats'
import Privacy from '../pages/Privacy'
import Profile from '../pages/Profile'
import Admin from '../pages/Admin'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/rotation" element={<Rotation />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
