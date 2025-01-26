import { createBrowserRouter} from "react-router-dom";
import Home from '../pages/Home';
import Login from '../pages/Login';
import PageError from '../pages/pageError';

const router = createBrowserRouter([
    {
      path: "/",
      element:  <Home />,
      errorElement: <PageError />
    },
    {
      path: "/login",
      element:  <Login />,
      errorElement: <PageError />
    },
    // {
    //   path: "/A-propos",
    //   element:     < About />,
    //   errorElement: <PageError />
    // },
    // {
    //   name: "logement",
    //   path: "/logement/:logementId",
    //   element:     <LogementPage/>,
    //   errorElement: <PageError />
    // },
    {
      name: "pageError",
      path: "/error",
      element: <PageError />
    },
  ]);
  
export default router