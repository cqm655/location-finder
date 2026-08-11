import {createBrowserRouter, RouterProvider,} from "react-router";

import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./App.css"
import {Map} from "./components/map/map.tsx";
import LoginPage from "./components/pages/login-page/login-page.tsx";
import {ProtectedRoute} from "./components/protected-route.tsx";

const router = createBrowserRouter([
    {
        element: <ProtectedRoute/>,
        children: [
            {
                path: "/",
                element: <App/>,
                children: [
                    {
                        path: "",
                        element: <Map/>
                    }

                ],
            }
        ]

    },
    {
        path: "/login",
        element: <LoginPage/>
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router}/>,
);
