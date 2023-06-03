import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home/Home";
import Navigation from "./components/shared/Navigation/Navigation";
import Authenticate from "./Pages/Authenticate/Authenticate";
import Activate from "./Pages/Activate/Activate";
import Rooms from "./Pages/Rooms/Rooms";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useLoadingWithRefresh } from "./hooks/useLoadingWithRefresh";
import Loader from "./components/shared/Loader/Loader";
import Room from "./Pages/Room/Room";
// const isauth=false;
// const user={
//   activated:false
// }

function App() {
  const { loading } = useLoadingWithRefresh();
  return loading ? (
    <Loader message="loading" />
  ) : (
    <BrowserRouter>
      <Navigation />
      <Routes>
        {/* --------------------------------Guest Section-------------------------------------------------------- */}
        {/* <Route path="/" element={<Home/>} exact/> */}
        <Route
          path="/"
          element={
            <GuestRoute>
              <Home />
            </GuestRoute>
          }
          exact
        />

        {/* <GuestRoute path="/authenticate" element={<Authenticate/>} exact/> */}
        <Route
          path="/authenticate"
          element={
            <GuestRoute>
              <Authenticate />
            </GuestRoute>
          }
          exact
        />
        {/* ------------------------------Semi-protected Area------------------------------------------------------ */}
        <Route
          path="/activate"
          element={
            <SemiProtectedRoute>
              <Activate />
            </SemiProtectedRoute>
          }
          exact
        />

        {/* ----------------------------------Protected Area------------------------------------------------------ */}
        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <Rooms />
            </ProtectedRoute>
          }
          exact
        />

        <Route
          path="/room/:id"
          element={
            <ProtectedRoute>
              <Room />
            </ProtectedRoute>
          }
          exact
        />
      </Routes>
    </BrowserRouter>
  );
}

const GuestRoute = ({ children }) => {
  const { isauth } = useSelector((state) => state.auth);
  return isauth ? <Navigate to="/rooms" /> : children;
};

const SemiProtectedRoute = ({ children, redirectTo }) => {
  const { user, isauth } = useSelector((state) => state.auth);
  return !isauth ? (
    <Navigate to="/" />
  ) : isauth && !user.activated ? (
    children
  ) : (
    <Navigate to="/rooms" />
  );
};

const ProtectedRoute = ({ children, redirectTo }) => {
  const { user, isauth } = useSelector((state) => state.auth);
  return !isauth ? (
    <Navigate to="/" />
  ) : isauth && !user.activated ? (
    <Navigate to="/activate" />
  ) : (
    children
  );
};

export default App;

// {
//   /* <GuestRoute path="/authenticate" element={<Authenticate/>} exact/> */
// }

// // const GuestRoute=({children,...rest})=>{
// //   return(
// //     <Route {...rest}
// //     render={({location})=>{
// //       return isauth?(
// //         <Navigate  to='/rooms'/>
// //       ):(
// //         children
// //       )
// //     }}

// //     ></Route>
// //   )
// // }

// {
//   /* <Route path="/register" element={<Register/>} exact/>
//       <Route path="/login" element={<Login/>} exact/> */
// }
