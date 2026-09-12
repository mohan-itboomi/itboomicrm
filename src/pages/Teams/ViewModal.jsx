import { Box, Divider, Typography } from "@mui/material";

const fields = ["name", "teamLead", "members", "status"];

const valueOf = (value) => {
	if (Array.isArray(value)) {
		return value.length ? value.map((item) => (typeof item === "object" ? item.name || item.email || item._id : item)).join(", ") : "—";
	}

	if (value && typeof value === "object") {
		return value.name || value.email || value._id || "—";
	}

	return value || "—";
};

export default function TeamsViewModal({ record }) {
	return (
		<Box sx={{ p: 1 }}>
			<Typography variant="h6">Team information</Typography>
			<Divider sx={{ my: 2 }} />
			{fields.map((field) => (
				<Box
					key={field}
					sx={{ display: "grid", gridTemplateColumns: "minmax(120px, 0.45fr) 1fr", gap: 2, py: 1.1 }}
				>
					<Typography color="text.secondary" sx={{ textTransform: "capitalize" }}>
						{field}
					</Typography>
					<Typography sx={{ wordBreak: "break-word" }}>
						{valueOf(record?.[field])}
					</Typography>
				</Box>
			))}
		</Box>
	);
}
