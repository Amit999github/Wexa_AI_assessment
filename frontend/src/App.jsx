import { Routes, Route } from "react-router-dom";
import TopNav from "./components/TopNav.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import DeveloperProfilePage from "./pages/DeveloperProfilePage.jsx";
import SkillDetailPage from "./pages/SkillDetailPage.jsx";
import ProjectDetailPage from "./pages/ProjectDetailPage.jsx";
import PathFinderPage from "./pages/PathFinderPage.jsx";
import CypherShowcasePage from "./pages/CypherShowcasePage.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-paper">
      <TopNav />
      <main>
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/developers/:id" element={<DeveloperProfilePage />} />
          <Route path="/skills/:name" element={<SkillDetailPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/path" element={<PathFinderPage />} />
          <Route path="/how-it-works" element={<CypherShowcasePage />} />
        </Routes>
      </main>
    </div>
  );
}
