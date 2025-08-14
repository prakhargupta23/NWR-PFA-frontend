/** @format */

import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../Pages/LoginPage";
import PrivateRoute from "./PrivateRoute";
import PFAPage from "../Pages/PFAPage";
import Workshop from "../Pages/Workshop";
import VantaBackground from "../modules/Bird-bg"

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
  {
    path: "/workshop",
    element: (
      <PrivateRoute>
        <Workshop />
      </PrivateRoute>
    ),
  }
]);
