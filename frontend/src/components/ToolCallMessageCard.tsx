import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { ToolCall } from "../types/agents";

const ToolCallStatusChip = ({ toolCall }: { toolCall: ToolCall }) => {
  const chipParams = {
    label: "Running",
    icon: <HourglassEmptyIcon />,
    color: "warning",
  };
  if (toolCall.error) {
    chipParams.label = "Error";
    chipParams.icon = <ErrorIcon />;
    chipParams.color = "error";
  }

  if (toolCall.result) {
    chipParams.label = "Complete";
    chipParams.icon = <CheckCircleIcon />;
    chipParams.color = "success";
  }

  return (
    <Chip
      icon={chipParams.icon}
      label={chipParams.label}
      size="small"
      color={chipParams.color}
      variant="outlined"
    />
  );
};

const ToolCallResult = ({ toolCall }: { toolCall: ToolCall }) => {
  if (toolCall.error) {
    return (
      <Alert sx={{ fontFamily: "monospace" }} severity="error">
        {toolCall.error}
      </Alert>
    );
  }
  if (toolCall.result) {
    return (
      <Alert sx={{ fontFamily: "monospace" }} severity="success">
        {toolCall.result}
      </Alert>
    );
  }
  return <LinearProgress sx={{ width: "100%" }} />;
};

export const ToolCallMessageCard = ({ toolCall }: { toolCall: ToolCall }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: "background.paper",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack>
          <Stack
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
            mb={1.5}
          >
            <Stack direction="row" spacing={1} alignItems="center" flex={1}>
              <BuildIcon fontSize="small" color="action" />
              <Typography variant="subtitle2" fontWeight={600}>
                Tool Call
              </Typography>
              <Chip
                label={toolCall.name}
                sx={{
                  fontFamily: "monospace",
                }}
                variant="outlined"
                size="small"
              />
              <ToolCallStatusChip toolCall={toolCall} />
            </Stack>
          </Stack>

          <Box>
            <ToolCallResult toolCall={toolCall} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
