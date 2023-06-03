import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isauth: false,
  user: null,
  otp: {
    hash: "",
    phone: "",
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      const data = action.payload;
      state.user = data.user;
      if (data.user === null) {
        state.isauth = false;
      } else {
        state.isauth = true;
      }
    },
    setOtp: (state, action) => {
      const { phone, hash } = action.payload;
      state.otp.phone = phone;
      state.otp.hash = hash;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setAuth, setOtp } = authSlice.actions;

export default authSlice.reducer;
