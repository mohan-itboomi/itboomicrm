import { Box, IconButton, Tooltip } from "@mui/material";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import { useDispatch } from "react-redux";
import { openModal } from "../Redux/Reducers/modalSlice";

export default function ReusableActionButtons({
  onView,
  onEdit,
  onDelete,
  onPermissions,
  record,
  viewTitle = "Record details",
  viewComponent = "RECORD_DETAILS_MODAL",
  showView = true,
  showEdit = true,
  showDelete = true,
  viewMaxWidth = "md",
}) {
  const dispatch = useDispatch();
  const handleView =
    onView ||
    (() =>
      dispatch(
        openModal({
          title: viewTitle,
          component: viewComponent,
          maxWidth: viewMaxWidth,
          props: { record },
        }),
      ));

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      {onPermissions && (
        <Tooltip title="Permissions">
          <IconButton
            size="small"
            onClick={onPermissions}
            sx={{
              color: "#7C3AED",
              backgroundColor: "#F5F3FF",
              borderRadius: 1.5,
              "&:hover": { backgroundColor: "#EDE9FE" },
            }}
          >
            <AdminPanelSettingsOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {showView && (onView || record) && (
        <Tooltip title="View">
          <IconButton
            size="small"
            onClick={handleView}
            sx={{
              color: "#2563EB",
              backgroundColor: "#EFF6FF",
              borderRadius: 1.5,

              "&:hover": {
                backgroundColor: "#DBEAFE",
                transform: "translateY(-2px)",
              },

              transition: "all 0.2s ease",
            }}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {showEdit && (
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={onEdit}
            sx={{
              color: "#D97706",
              backgroundColor: "#FFFBEB",
              borderRadius: 1.5,

              "&:hover": {
                backgroundColor: "#FEF3C7",
                transform: "translateY(-2px)",
              },

              transition: "all 0.2s ease",
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {showDelete && (
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={onDelete}
            sx={{
              color: "#DC2626",
              backgroundColor: "#FEF2F2",
              borderRadius: 1.5,

              "&:hover": {
                backgroundColor: "#FEE2E2",
                transform: "translateY(-2px)",
              },

              transition: "all 0.2s ease",
            }}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
