import { createBrowserRouter} from "react-router-dom";
// import LogementPage from '../pages/LogementP';

import Home from '../pages/Home';
// import About from '../pages/About';

import PageError from '../pages/pageError';

const router = createBrowserRouter([
    {
      path: "/",
      element:  <Home />,
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