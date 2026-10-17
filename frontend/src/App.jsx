import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import MainLayout from './components/MainLayout';

// Context
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Shared Pages
import AIPage from './pages/AIPage';
import SearchPage from './pages/SearchPage';
import ToolSelectionPage from './pages/ToolSelectionPage';
import HistoryPage from './pages/HistoryPage';
import AccountPage from './pages/AccountPage';
import Home from './pages/Home';
// import Gideon from './pages/gideon'; // Disabled - requires MediaPipe

// Diary tool
import DiaryDashboard from './tools/diary/pages/DiaryDashboard';
import DiaryEditor    from './tools/diary/pages/DiaryEditor';

// Todo tool
import TodoDashboard from './tools/todo/pages/TodoDashboard';

// Calendar tool
import CalendarDashboard from './tools/calendar/pages/CalendarDashboard';

// Event Planner tool
import PlannerDashboard from './tools/event-planner/pages/PlannerDashboard';
import ProjectDetail from './tools/event-planner/pages/ProjectDetail';

// Notes tool
import NotesDashboard from './tools/notes/pages/NotesDashboard';
import NoteEditor    from './tools/notes/pages/NoteEditor';

// Vault tool
import VaultDashboard from './tools/vault/pages/VaultDashboard';
import VaultEditor from './tools/vault/pages/VaultEditor';

// Compass tool
import CompassDashboard from './tools/compass/pages/CompassDashboard';

// Calculator tool
import CalculatorDashboard from './tools/calculator/pages/CalculatorDashboard';

// Dropzone tool
import DropZoneDashboard from './tools/dropzone/pages/DropZoneDashboard';

// QRStudio tool
import QRStudioDashboard from './tools/qrstudio/pages/QRStudioDashboard';

// Life Tracker tool
import LifeTrackerDashboard from './tools/lifetracker/pages/LifeTrackerDashboard';

// Media Tracker tool
import MediaDashboard from './tools/media/pages/MediaDashboard.jsx';

// Promise Tracker tool
import PromiseTrackerDashboard from './tools/promise-tracker/pages/PromiseTrackerDashboard';

// Timetable tool
import TimetableDashboard from './tools/timetable/pages/TimetableDashboard';

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Landing */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Main Layout */}
          <Route element={<MainLayout />}>
            {/* Main Navigation */}
            <Route path="/home" element={<Home />} />
            <Route path="/ai" element={<AIPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/tools" element={<ToolSelectionPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/account" element={<AccountPage />} />
            {/* <Route path="/gideon" element={<Gideon />} /> */} {/* Disabled - requires MediaPipe */}

            {/* Diary tool */}
            <Route path="/tools/diary" element={<DiaryDashboard />} />
            <Route path="/tools/diary/entry/:id?" element={<DiaryEditor />} />

            {/* Todo tool */}
            <Route path="/tools/todo" element={<TodoDashboard />} />

            {/* Calendar tool */}
            <Route path="/tools/calendar" element={<CalendarDashboard />} />

            {/* Event Planner tool */}
            <Route path="/tools/planner" element={<PlannerDashboard />} />
            <Route path="/tools/planner/project/:id" element={<ProjectDetail />} />

            {/* Notes tool */}
            <Route path="/tools/notes" element={<NotesDashboard />} />
            <Route path="/tools/notes/edit/:id?" element={<NoteEditor />} />

            {/* Vault tool */}
            <Route path="/tools/vault" element={<VaultDashboard />} />
            <Route path="/tools/vault/edit/:id?" element={<VaultEditor />} />

            {/* Compass tool */}
            <Route path="/tools/compass" element={<CompassDashboard />} />

            {/* Calculator tool */}
            <Route path="/tools/calculator" element={<CalculatorDashboard />} />

            {/* Dropzone tool */}
            <Route path="/tools/dropzone" element={<DropZoneDashboard />} />

            {/* QRStudio tool */}
            <Route path="/tools/qrstudio" element={<QRStudioDashboard />} />

            {/* Life Tracker tool */}
            <Route path="/tools/lifetracker" element={<LifeTrackerDashboard />} />

            {/* Media Tracker tool */}
            <Route path="/tools/media" element={<MediaDashboard />} />
            <Route path="/tools/media/group/:parentId" element={<MediaDashboard />} />

            {/* Promise Tracker tool */}
            <Route path="/tools/promise" element={<PromiseTrackerDashboard />} />

            {/* Timetable tool */}
            <Route path="/tools/timetable" element={<TimetableDashboard />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
    </LanguageProvider>
  );
}
