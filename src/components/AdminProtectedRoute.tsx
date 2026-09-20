import {
    Navigate,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";

import type {
    ReactNode,
} from "react";


interface AdminProtectedRouteProps {
    children: ReactNode;
}


function AdminProtectedRoute({
    children,
}: AdminProtectedRouteProps) {

    const {
        adminUser,
        isAdminAuthenticated,
    } = useAuth();


    /* =====================================
       ADMIN NOT AUTHENTICATED
    ===================================== */

    if (!isAdminAuthenticated) {

        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );
    }


    /* =====================================
       ADMIN SESSION INVALID
    ===================================== */

    if (
        !adminUser ||
        adminUser.role !== "admin"
    ) {

        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );
    }


    return children;
}


export default AdminProtectedRoute;

