import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./Reducers/modalSlice";
import toastReducer from "./Reducers/toastSlice";
import loadingReducer from "./Reducers/loadingSlice";


export const store = configureStore({
  reducer: {
    modal: modalReducer,
    toast: toastReducer,
    loading: loadingReducer,
  },
});
