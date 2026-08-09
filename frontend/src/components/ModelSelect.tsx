import {
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getChatModels } from "../api/agents";
import { ChatModel } from "../types/agents";

function describeChatModel(model: ChatModel) {
  const features =
    model.supported_features.length > 0
      ? model.supported_features
          .map((feature) => feature.replaceAll("_", " "))
          .join(", ")
      : "standard chat";
  return `${model.owner} · ${model.provider} · ${features}`;
}

export const ModelSelect = ({
  selectedModel,
  setSelectedModel,
  setError,
  busy,
}: {
  selectedModel: ChatModel | null;
  setSelectedModel: (model: ChatModel) => void;
  setError: (error: string) => void;
  busy: boolean;
}) => {
  const [models, setModels] = useState<ChatModel[]>([]);

  function handleModelChange(modelId: string) {
    const model = models.find((item) => item.model_id === modelId);
    if (model) {
      setSelectedModel(model);
    }
  }

  useEffect(() => {
    getChatModels()
      .then((items) => {
        setModels(items);
        setSelectedModel((current) => current || items[0] || null);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <FormControl disabled={busy || models.length === 0}>
      <InputLabel id="chat-model-label">Chat model</InputLabel>
      <Select
        labelId="chat-model-label"
        label="Chat model"
        value={selectedModel?.model_id ?? ""}
        renderValue={() => selectedModel?.name ?? "Select model"}
        onChange={(event) => handleModelChange(event.target.value)}
      >
        {models.map((model, index) => (
          <MenuItem key={`${model.model_id}-${index}`} value={model.model_id}>
            <ListItemText
              primary={model.name}
              secondary={describeChatModel(model)}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
