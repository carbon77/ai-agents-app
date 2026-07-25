import logging
from typing import Dict

from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.language_models import BaseChatModel

from app.routers.ai_models import AI_MODELS

load_dotenv()

logger = logging.getLogger(__name__)


class ChatModelRegistry:

    def __init__(self):
        self.models: Dict[str, BaseChatModel] = {}

    def get(self, model_id: str):
        if model_id not in self.models:
            self.models[model_id] = self._create(model_id)
        return self.models[model_id]

    def _create(self, model_id: str):
        for metadata in AI_MODELS:
            logger.info(f"Creating model: {metadata}")
            if metadata.model_id == model_id:
                model_name = f"{metadata.provider}:{metadata.model_id}"
                model = init_chat_model(model_name)
                logger.info(f"Chat model created: %s", model_name)
                return model
        logger.error(f"Model with id=%s not found", model_id)
        raise KeyError(f"Model with id {model_id} not found")


chat_model_registry = ChatModelRegistry()
