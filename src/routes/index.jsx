import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Welcome from '../pages/Welcome'
import Dashboard from '../pages/Dashboard'
import Playlists from '../pages/Playlists'
import Settings from '../pages/Settings'
import Rotation from '../pages/Rotation'
import Stats from '../pages/Stats'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/rotation" element={<Rotation />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
