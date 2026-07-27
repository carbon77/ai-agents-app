import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { ConversationsGroupBy } from "../../types/users";

export function GroupBySelector({
  value,
  onChange,
}: {
  value: ConversationsGroupBy;
  onChange: (value: ConversationsGroupBy) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSelect = (next: ConversationsGroupBy) => {
    onChange(next);
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        color="inherit"
        size="small"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        endIcon={<ExpandMoreIcon />}
        sx={{ justifyContent: "space-between", color: "text.secondary" }}
      >
        {value === "none" ? "Group: None" : "Group: By Date"}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          selected={value === "none"}
          onClick={() => handleSelect("none")}
        >
          None
        </MenuItem>
        <MenuItem
          selected={value === "date"}
          onClick={() => handleSelect("date")}
        >
          By date
        </MenuItem>
      </Menu>
    </>
  );
}
