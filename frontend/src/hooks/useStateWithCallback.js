// import { useCallback, useEffect, useRef, useState } from "react";

// export const useStateWithCallback = (initialState) => {
//   const [state, setState] = useState(initialState);
//   const cbRef = useRef(null); //Component wont rerender when state changes

//   const updateState = useCallback((newState, cb) => {
//     cbRef.current = cb;
//     setState((prev) => {
//       return typeof newState === "function" ? newState(prev) : newState;
//     });
//   }, []);

//   useEffect(() => {
//     if (cbRef.current) {
//       cbRef.current(state);
//       cbRef.current = null;
//     }
//   }, [state]);

//   return [state, updateState];
// };

import { useState, useRef, useEffect, useCallback } from "react";
export const useStateWithCallback = (initialState) => {
  const [state, setState] = useState(initialState);
  const cbRef = useRef(null);

  //updatestate is my setclients
  const updateState = useCallback((newState, cb) => {
    cbRef.current = cb;

    setState((prev) =>
      typeof newState === "function" ? newState(prev) : newState
    );
  }, []);

  useEffect(() => {
    if (cbRef.current) {
      cbRef.current(state);
      cbRef.current = null;
    }
  }, [state]);

  return [state, updateState];
};

// ------------------------------------------How it works (from stack Overflow)-------------------------------------------
// const App = () => {
//   const [state, setState] = useStateCallback(0);

//   const handleClick = () =>
//     setState(
//       prev => prev + 1,
//       // important: use `s`, not the stale/old closure value `state`
//       s => console.log("I am called after setState, state:", s)
//     );

//   return (
//     <div>
//       <p>Hello Comp. State: {state} </p>
//       <button onClick={handleClick}>Click me</button>
//     </div>
//   );
// }

// function useStateCallback(initialState) {
//   const [state, setState] = useState(initialState);
//   const cbRef = useRef(null);

//   const setStateCallback = useCallback((state, cb) => {
//     cbRef.current = cb;
//     setState(state);
//   }, []);

//   useEffect(() => {
//     if (cbRef.current) {
//       cbRef.current(state);
//       cbRef.current = null;
//     }
//   }, [state]);

//   return [state, setStateCallback];
// }

// ReactDOM.render(<App />, document.getElementById("root"));
