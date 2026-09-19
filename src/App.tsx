import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCustomers from "./pages/AdminCustomers";
import AdminBillers from "./pages/AdminBillers";
import Payments from "./pages/Payments";
import Dashboard from "./pages/Dashboard";
import AccountDetails from "./pages/AccountDetails";
import Transfer from "./pages/Transfer";
import Loans from "./pages/Loans";
import LoanApplication from "./pages/LoanApplication";
import Cards from "./pages/Cards";
import Transactions from "./pages/Transactions";
import HelpCenter from "./pages/HelpCenter";
import AdminSupport from "./pages/AdminSupport";
import AdminLoans from "./pages/AdminLoans";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AdminProtectedRoute from "./components/AdminProtectedRoute";


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
                         path="/admin/login"
                          element={<AdminLogin />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />


                     {/* ADMINISTRATION */}

                    <Route
                          path="/admin"
                          element={<AdminDashboard />}
                    />


                    <Route
                          path="/admin/customers"
                          element={
                        <AdminProtectedRoute>
                        <AdminCustomers />
                        </AdminProtectedRoute>
                             }
                    />

<Route
    path="/admin/loans"
    element={
        <AdminProtectedRoute>
            <AdminLoans />
        </AdminProtectedRoute>
    }
/>



                    <Route
    path="/admin/billers"
    element={
        <AdminProtectedRoute>
            <AdminBillers />
        </AdminProtectedRoute>
    }
/>

                    <Route
                        path="/admin/support"
                        element={
                            <AdminProtectedRoute>
                                <AdminSupport />
                            </AdminProtectedRoute>
                        }
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
                             path="/dashboard/cards"
                             element={
                               <ProtectedRoute>
                                  <Cards />
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
    path="/dashboard/loans/apply"
    element={
        <ProtectedRoute>
            <LoanApplication />
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
                    

                    <Route
                        path="/dashboard/payments"
                        element={
                            <ProtectedRoute>
                                <Payments />
                            </ProtectedRoute>
                        }
                    />


                   
                 <Route
                    path="/dashboard/transactions"
                    element={
                  <ProtectedRoute>
                 <Transactions />
                 </ProtectedRoute>
                 }
                 />


                <Route
                     path="/dashboard/help"
                     element={
                       <ProtectedRoute>
                          <HelpCenter />
                       </ProtectedRoute>
                }
                />

                    </Routes>

            </AuthProvider>

        </BrowserRouter>
    );
}

export default App;