import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell       from "./AppShell";
import IntroScreen    from "./screens/IntroScreen";
import CaptureScreen  from "./screens/CaptureScreen";
import ReviewScreen   from "./screens/ReviewScreen";
import SolutionScreen from "./screens/SolutionScreen";
import SuccessScreen  from "./screens/SuccessScreen";
import HistoryScreen  from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import Cube3Dscreen from "./screens/Cube3Dscreen";
import "./utils/cubeSolver"; 

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/"         element={<IntroScreen />} />
          <Route path="/capture"  element={<CaptureScreen />} />
          <Route path="/cube3d"   element={<Cube3Dscreen />} />
          <Route path="/review"   element={<ReviewScreen />} />
          <Route path="/solution" element={<SolutionScreen />} />
          <Route path="/success"  element={<SuccessScreen />} />
          <Route path="/history"  element={<HistoryScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
