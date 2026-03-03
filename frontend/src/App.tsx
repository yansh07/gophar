import "./App.css";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
// import Dashboard from "./pages/Dashboard";
// import Profile from "./pages/Profile";
import { isUserAuthenticated } from "./utils/auth";

function PublicRoute() {
  if (isUserAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

// function ProtectedRoute() {
//   if (!isUserAuthenticated()) {
//     return <Navigate to="/" replace />;
//   }

//   return <Outlet />;
// }

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
