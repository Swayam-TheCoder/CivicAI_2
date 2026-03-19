import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";
import DashboardScreen from "./screens/DashboardScreen";
import IssuesScreen from "./screens/IssuesScreen";
import ReportScreen from "./screens/ReportScreen";
import AuthScreen from "./screens/AuthScreen";
import ToastContainer from "./components/common/Toast";

function AppShell() {
  const { user, ready } = useAuth();
  const [activeNav, setActiveNav]   = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);

  // Show nothing until auth is initialised
  if (!ready) return null;

  // Not logged in → show auth screen (public routes: dashboard, issues still work read-only)
  if (!user && activeNav !== "dashboard" && activeNav !== "issues") {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <Header activeNav="login" setActiveNav={setActiveNav} />
        <div style={{ flex: 1, overflow: "hidden" }}>
          <AuthScreen />
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeNav) {
      case "dashboard":
        return <DashboardScreen selectedId={selectedId} setSelectedId={setSelectedId} />;
      case "issues":
        return <IssuesScreen selectedId={selectedId} setSelectedId={setSelectedId} setActiveNav={setActiveNav} />;
      case "report":
        if (!user) return <AuthScreen />;
        return <ReportScreen setActiveNav={setActiveNav} />;
      default:
        return <DashboardScreen selectedId={selectedId} setSelectedId={setSelectedId} />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header activeNav={activeNav} setActiveNav={setActiveNav} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

        <main style={{
          flex: 1,
          padding: 14,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}>
          {renderScreen()}
        </main>
      </div>

      <Footer />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
