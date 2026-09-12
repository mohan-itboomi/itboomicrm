import { createSlice } from "@reduxjs/toolkit";

const loadingSlice = createSlice({
  name: "loading",
  initialState: { pendingRequests: 0 },
  reducers: {
    requestStarted: (state) => {
      state.pendingRequests += 1;
    },
    requestFinished: (state) => {
      state.pendingRequests = Math.max(0, state.pendingRequests - 1);
    },
  },
});

export const { requestStarted, requestFinished } = loadingSlice.actions;
export default loadingSlice.reducer;
