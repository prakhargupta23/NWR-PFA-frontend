/** @format */

import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../Pages/LoginPage";
import PrivateRoute from "./PrivateRoute";
import PFAPage from "../Pages/PFAPage";

export const routes = createBrowserRouter([
  // {
  //   path: "/dashboard",
  //   element: (
  //     <PrivateRoute>
  //       <DemoPage />
  //     </PrivateRoute>
  //   ),
  // },
  {
    path: "/*",
    element: <LoginPage />,
  },
  {
    path: "/pfa",
    element: (
      <PrivateRoute>
        <PFAPage />
      </PrivateRoute>
    ),
  },
]);
