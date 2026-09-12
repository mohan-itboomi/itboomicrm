import { Grid } from "@mui/material";
import ReusableButton from "./ReusableButton";
import { theme } from "../Constent/Theme";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../Redux/Reducers/modalSlice";

function ReusbleModalbutton({ AddTitle }) {
  const dispatch = useDispatch();
  const isSubmitting = useSelector(
    (state) => state?.loading?.pendingRequests > 0,
  );
  const handleClose = () => {
    dispatch(closeModal());
  };

  return (
    <Grid
      size={{ xs: 12, md: 3 }}
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
        marginTop: 2,
      }}
    >
      <ReusableButton
        title="Cancel"
        variant="outlined"
        textColor={theme.cancel}
        bg="transparent"
        onClick={handleClose}
        disabled={isSubmitting}
      />
      <ReusableButton
        title={AddTitle}
        type="submit"
        bg={theme?.primarycolor}
        loading={isSubmitting}
        disabled={isSubmitting}
      />
    </Grid>
  );
}

export default ReusbleModalbutton;
