import {
  FormControl,
  InputLabel,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { getChatModels } from "../api";
import { ChatModel } from "../types/agents";

function describeChatModel(model: ChatModel) {
  const features =
    model.supported_features.length > 0
      ? model.supported_features
          .map((feature) => feature.replaceAll("_", " "))
          .join(", ")
      : "standard chat";

  return `${model.owner} · ${features}`;
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

  const groupedModels = useMemo(() => {
    return models.reduce<Record<string, ChatModel[]>>((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    }, {});
  }, [models]);

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
        if (items.length > 0) {
          setSelectedModel(selectedModel ?? items[0]);
        }
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
        onChange={(e) => handleModelChange(e.target.value)}
      >
        {Object.entries(groupedModels).map(([provider, providerModels]) => [
          <ListSubheader key={provider}>{provider}</ListSubheader>,
          ...providerModels.map((model) => (
            <MenuItem key={model.model_id} value={model.model_id}>
              <ListItemText
                primary={model.name}
                secondary={describeChatModel(model)}
              />
            </MenuItem>
          )),
        ])}
      </Select>
    </FormControl>
  );
};
