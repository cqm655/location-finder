import {createBrowserRouter, RouterProvider,} from "react-router";

import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./App.css"
import {Map} from "./components/map/map.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            {
                path: "map",
                element: <Map/>
            }
        ]
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router}/>,
);