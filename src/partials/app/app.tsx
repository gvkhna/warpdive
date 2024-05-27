import {StrictMode} from 'react'
import {SWRConfig} from 'swr'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'

import DashboardPage from '../dashboard/dashboard-page'
import ProjectsPage from '../projects/projects-page'
import NewProjectPage from '../projects/new-project-page'
import AppLayout from './app-layout'
import SettingsPage from '../settings/settings-page'
import AppViewerPage from '../viewer/app-viewer-page'

export default function App() {
  return (
    <StrictMode>
      <SWRConfig
        value={{
          revalidateOnFocus: false, // Do not revalidate when window gains focus
          revalidateOnReconnect: false, // Do not revalidate when the browser regains a network connection
          refreshInterval: 0, // Do not poll at intervals
          revalidateIfStale: false, // Do not revalidate automatically even if the data is considered stale
          revalidateOnMount: true // Only revalidate when components mount
        }}
      >
        <Router>
          <AppLayout>
            <Routes>
              <Route
                path='/app/'
                element={<DashboardPage />}
              />
              <Route
                path='/app/projects/new'
                element={<NewProjectPage />}
              />
              <Route
                path='/app/project/:pid'
                element={<ProjectsPage />}
              />
              <Route
                path='/app/deployment/:pid'
                element={<AppViewerPage />}
              />
              <Route
                path='/app/settings'
                element={<SettingsPage />}
              />
            </Routes>
          </AppLayout>
        </Router>
      </SWRConfig>
    </StrictMode>
  )
}
