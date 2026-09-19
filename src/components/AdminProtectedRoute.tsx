import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import type { ReactNode } from "react";


interface AdminProtectedRouteProps {
    children: ReactNode;
}


function AdminProtectedRoute({
    children,
}: AdminProtectedRouteProps) {

    const {
        user,
        isAuthenticated,
    } = useAuth();


    if (!isAuthenticated) {

        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );

    }


    if (user?.role !== "admin") {

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );

    }


    return children;
}


export default AdminProtectedRoute;