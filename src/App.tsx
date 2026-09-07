import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import AccountDetails from "./pages/AccountDetails";
import Transfer from "./pages/Transfer";
import Loans from "./pages/Loans";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";


function App() {

    return (
        <BrowserRouter>

            <AuthProvider>

                <Routes>

                    {/* PUBLIC PAGES */}

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />


                    {/* PROTECTED BANKING AREA */}

                    <Route
    path="/dashboard/accounts/:accountId"
    element={
        <ProtectedRoute>
            <AccountDetails />
        </ProtectedRoute>
    }
/>

                        <Route
                          path="/dashboard/transfers"
                         element={
                              <ProtectedRoute>
                                <Transfer />
                             </ProtectedRoute>
                     }
/>

                         <Route
                          path="/dashboard/loans"
                         element={
                             <ProtectedRoute>
                              <Loans />
                            </ProtectedRoute>
                    }
/>

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                </Routes>

            </AuthProvider>

        </BrowserRouter>
    );
}

export default App;