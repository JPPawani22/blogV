import{
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import "./style.scss"
import Register from "./pages/Register";
import Login from "./pages/Login";
import Write from "./pages/Write";
import Single from "./pages/Single";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {  
  return (
    <>
      <Navbar/> 
      <Outlet/>  
      <Footer/>
    </>
  );
};  

const router = createBrowserRouter([
  { 
    path: "/", 
    element: <Layout/>,
    children: [
      {
        path: "/",
        element: <Home/>,
      },
      {
        path: "/post/:id",
        element: <Single/>,
      },
      {
        path: "/write",
        element: <Write/>,
      },
    ]
  },
  { 
    path: "/register", 
    element: <Register/>, 
  },
  { 
    path: "/login", 
    element: <Login/>, 
  },
  
]);


function App() {
  return (
    <div className="app">
      <div className="container">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}


export default App;
