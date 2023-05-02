import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home/Home";
import Navigation from "./components/shared/Navigation/Navigation";
import Authenticate from "./Pages/Authenticate/Authenticate";
import Activate from "./Pages/Activate/Activate";
import Rooms from "./Pages/Rooms/Rooms";
import { useSelector } from "react-redux";
// const isauth=false;
// const user={
//   activated:false
// }

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        {/* --------------------------------Guest Section-------------------------------------------------------- */}
        {/* <Route path="/" element={<Home/>} exact/> */}
        <Route
          path="/"
          element={
            <GuestRoute redirectTo="/rooms">
              <Home />
            </GuestRoute>
          }
          exact
        />

        {/* <GuestRoute path="/authenticate" element={<Authenticate/>} exact/> */}
        <Route
          path="/authenticate"
          element={
            <GuestRoute redirectTo="/rooms">
              <Authenticate />
            </GuestRoute>
          }
          exact
        />
        {/* ------------------------------Semi-protected Area------------------------------------------------------ */}
        <Route
          path="/activate"
          element={
            <SemiProtectedRoute redirectTo="/">
              <Activate />
            </SemiProtectedRoute>
          }
          exact
        />

        {/* ----------------------------------Protected Area------------------------------------------------------ */}
        <Route
          path="/rooms"
          element={
            <ProtectedRoute redirectTo="/">
              <Rooms />
            </ProtectedRoute>
          }
          exact
        />
      </Routes>
    </BrowserRouter>
  );
}

const GuestRoute = ({ children, redirectTo }) => {
  const { isauth } = useSelector((state) => state.auth);
  return isauth ? <Navigate to={redirectTo} /> : children;
};

const SemiProtectedRoute = ({ children, redirectTo }) => {
  const { user, isauth } = useSelector((state) => state.auth);
  return !isauth ? (
    <Navigate to={redirectTo} />
  ) : isauth && !user.activated ? (
    children
  ) : (
    <Navigate to="/rooms" />
  );
};

const ProtectedRoute = ({ children, redirectTo }) => {
  const { user, isauth } = useSelector((state) => state.auth);
  return !isauth ? (
    <Navigate to={redirectTo} />
  ) : isauth && !user.activated ? (
    <Navigate to="/activate" />
  ) : (
    children
  );
};

export default App;

{
  /* <GuestRoute path="/authenticate" element={<Authenticate/>} exact/> */
}

// const GuestRoute=({children,...rest})=>{
//   return(
//     <Route {...rest}
//     render={({location})=>{
//       return isauth?(
//         <Navigate  to='/rooms'/>
//       ):(
//         children
//       )
//     }}

//     ></Route>
//   )
// }

{
  /* <Route path="/register" element={<Register/>} exact/>
      <Route path="/login" element={<Login/>} exact/> */
}
