import { Box, InputAdornment, Paper, Stack } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ReusableInput from "./ReusableInput";
import CustomDropdown from "./CustomDropdown";

export default function ReusableFilterBar({
  search,
  onSearch,
  status,
  onStatus,
  statusOptions = [],
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <ReusableInput
          name="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search records"
          sx={{ minWidth: { sm: 360 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        {statusOptions.length > 0 && (
          <Box sx={{ width: { xs: "100%", sm: 210 } }}>
            <CustomDropdown
              value={status}
              onChange={onStatus}
              placeholder="All statuses"
              options={[
                { label: "All statuses", value: "" },
                ...statusOptions.map((value) => ({ label: value, value })),
              ]}
            />
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
