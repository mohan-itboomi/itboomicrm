import { Box, Typography } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useDispatch } from "react-redux";
import { closeModal } from "../Redux/Reducers/modalSlice";
import ReusableButton from "./ReusableButton";

const ConfirmationModal = ({
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
}) => {
  const dispatch = useDispatch();
  const handleClose = () => dispatch(closeModal());
  const handleConfirm = () => {
    onConfirm?.();
    handleClose();
  };

  return (
    <Box
      sx={{
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          mx: "auto",
          mb: 2,
          borderRadius: "50%",
          bgcolor: "warning.light",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <WarningAmberRoundedIcon sx={{ fontSize: 40, color: "warning.dark" }} />
      </Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Confirmation
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {message}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <ReusableButton
          title={cancelText}
          variant="outlined"
          textColor="#475569"
          bg="transparent"
          onClick={handleClose}
        />

        <ReusableButton
          title={confirmText}
          variant="contained"
          color="error"
          onClick={handleConfirm}
        />
      </Box>
    </Box>
  );
};

export default ConfirmationModal;
