import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, resolveModalProps } from "../Api/Redux/Reducers/modalSlice";
import modalRegistry from "./modalRegistry";

const GlobalModal = () => {
  const dispatch = useDispatch();

  const {
    open,
    title,
    component,
    props,
    maxWidth = "md",
  } = useSelector((state) => state?.modal);

  const handleClose = () => {
    dispatch(closeModal());
  };
  const Component = modalRegistry[component];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh",
        },
      }}
    >
      {title && (
        <DialogTitle
          component="div"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h5">{title}</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent>{Component && <Component {...resolveModalProps(props)} />}</DialogContent>
    </Dialog>
  );
};

export default GlobalModal;
