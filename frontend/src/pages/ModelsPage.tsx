import { useEffect, useMemo, useState } from 'react';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SearchIcon from '@mui/icons-material/Search';
import { Alert, Box, Card, CardContent, Chip, CircularProgress, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { getModels } from '../api';
import { Shell } from '../components/Shell';
import { ChatModel } from '../types/agents';

type ModelTypeFilter = 'all' | ChatModel['model_type'];

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function describeModel(model: ChatModel) {
  const features = model.supported_features.length > 0 ? model.supported_features.join(', ') : 'standard generation';
  return `${model.name} is a ${model.model_type.replaceAll('_', ' ')} model from ${model.owner} on ${model.provider}. It supports ${features}.`;
}

function getModelTypeLabel(modelType: ModelTypeFilter) {
  return modelType === 'all' ? 'All' : modelType.replaceAll('_', ' ');
}

function matchesSearch(model: ChatModel, searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (!normalizedSearch) return true;
  return [model.model_id, model.name, model.owner, model.provider, model.model_type, ...model.supported_features]
    .some((value) => value.toLowerCase().includes(normalizedSearch));
}

export function ModelsPage() {
  const [models, setModels] = useState<ChatModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modelTypeFilter, setModelTypeFilter] = useState<ModelTypeFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const modelTypeFilters = useMemo<ModelTypeFilter[]>(() => ['all', ...Array.from(new Set(models.map((model) => model.model_type)))], [models]);
  const filteredModels = useMemo(
    () => models.filter((model) => (modelTypeFilter === 'all' || model.model_type === modelTypeFilter) && matchesSearch(model, searchTerm)),
    [models, modelTypeFilter, searchTerm],
  );

  useEffect(() => {
    getModels().then(setModels).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  return (
    <Shell>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3" fontWeight={800}>Available models</Typography>
          <Typography color="text.secondary">Browse model capabilities, context windows, and supported features.</Typography>
        </Box>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Search models"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
          <ToggleButtonGroup
            exclusive
            color="primary"
            value={modelTypeFilter}
            onChange={(_, value: ModelTypeFilter | null) => value && setModelTypeFilter(value)}
            aria-label="Model type filter"
            sx={{ alignSelf: { xs: 'stretch', md: 'center' }, flexWrap: 'wrap' }}
          >
            {modelTypeFilters.map((modelType) => (
              <ToggleButton key={modelType} value={modelType} aria-label={`Show ${getModelTypeLabel(modelType)} models`}>
                {getModelTypeLabel(modelType)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && filteredModels.length === 0 && <Alert severity="info">No models match your search.</Alert>}
        {!loading && !error && (
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3}>
            {filteredModels.map((model, index) => (
              <Card key={`${model.model_id}-${model.model_type}-${index}`} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 2, bgcolor: 'action.hover' }}>
                      <PsychologyIcon color="primary" />
                    </Box>
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      <Chip label={model.model_type.replaceAll('_', ' ')} size="small" color="primary" />
                      <Chip label={`Provider: ${model.provider}`} size="small" variant="outlined" />
                    </Stack>
                  </Stack>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>{model.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{model.model_id}</Typography>
                  <Typography sx={{ mt: 2 }}>{describeModel(model)}</Typography>
                  <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
                    <Chip label={`Context: ${formatNumber(model.context_window)}`} size="small" />
                    <Chip label={`Max output: ${formatNumber(model.max_completion_tokens)}`} size="small" />
                    {model.supported_features.map((feature) => <Chip key={feature} label={feature.replaceAll('_', ' ')} size="small" variant="outlined" />)}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Stack>
    </Shell>
  );
}
