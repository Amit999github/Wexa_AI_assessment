import { Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import DeveloperProfilePage from './pages/DeveloperProfilePage.jsx';
import PathFinderPage from './pages/PathFinderPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-paper">
      <TopNav />
      <main>
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/developers/:id" element={<DeveloperProfilePage />} />
          <Route path="/path" element={<PathFinderPage />} />
        </Routes>
      </main>
    </div>
  );
}
