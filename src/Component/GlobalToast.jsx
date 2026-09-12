import { Alert, Snackbar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { hideToast } from "../Redux/Reducers/toastSlice";

export default function GlobalToast() {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state?.toast);
  return (
    <Snackbar
      open={toast?.open}
      autoHideDuration={2000}
      onClose={() => dispatch(hideToast())}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        severity={toast?.severity}
        variant="filled"
        onClose={() => dispatch(hideToast())}
      >
        {toast?.message}
      </Alert>
    </Snackbar>
  );
}
