import {Navigate, Outlet} from "react-router";
import {jwtDecode} from "jwt-decode";

interface JwtPayload {
    exp: number;
}

export const ProtectedRoute = () => {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
        return <Navigate to="/login" replace/>;
    }

    try {
        const decoded = jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() / 1000; // timpul curent în secunde

        if (decoded.exp && decoded.exp < currentTime) {
            sessionStorage.removeItem("access_token");
            return <Navigate to="/login" replace/>;
        }
    } catch {
        sessionStorage.removeItem("access_token");
        return <Navigate to="/login" replace/>;
    }

    return <Outlet/>;
};