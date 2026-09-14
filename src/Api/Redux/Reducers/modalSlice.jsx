import { createSlice } from "@reduxjs/toolkit";

const callbackRegistry = new Map();
let nextCallbackId = 0;

const registerCallbacks = (props = {}) => Object.fromEntries(
  Object.entries(props).map(([key, value]) => {
    if (typeof value !== "function") return [key, value];
    const callbackId = `modal-callback-${++nextCallbackId}`;
    callbackRegistry.set(callbackId, value);
    return [key, { __modalCallbackId: callbackId }];
  }),
);

const removeCallbacks = (props = {}) => {
  Object.values(props).forEach((value) => {
    if (value?.__modalCallbackId) callbackRegistry.delete(value.__modalCallbackId);
  });
};

const initialState = {
  open: false,
  title: "",
  component: null,
  props: {},
  maxWidth: "md",
};
const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModalState: (state, action) => {
      state.open = true;
      state.title = action.payload.title || "";
      state.component = action.payload.component || null;
      state.props = action.payload.props || {};
      state.maxWidth = action.payload.maxWidth || "md";
    },
    closeModal: (state) => {
      removeCallbacks(state.props);
      state.open = false;
      state.title = "";
      state.component = null;
      state.props = {};
      state.maxWidth = "md";
    },
  },
});

export const { closeModal } = modalSlice.actions;

export const openModal = (payload) => ({
  type: "modal/openModalState",
  payload: { ...payload, props: registerCallbacks(payload.props) },
});

export const resolveModalProps = (props = {}) => Object.fromEntries(
  Object.entries(props).map(([key, value]) => [
    key,
    value?.__modalCallbackId ? callbackRegistry.get(value.__modalCallbackId) : value,
  ]),
);

export default modalSlice.reducer;
