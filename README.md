# 🤖 AI Agents App

> Веб-приложение, в котором можно попробовать в деле разных AI-агентов

[![Python](https://img.shields.io/badge/Python-3.13+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?logo=langchain&logoColor=white)](https://www.langchain.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-agents-1C3C3C)](https://www.langchain.com/langgraph)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📖 О проекте

Платформа для взаимодействия с AI-агентами на базе LLM. Бэкенд построен на FastAPI и LangGraph/LangChain, а агенты используют инструменты (tools) через MCP (Model Context Protocol) для выполнения реальных задач — например, работы с календарём и почтой.

Проект состоит из двух частей:
- **`app/`** — бэкенд на FastAPI, оркестрация агентов на LangGraph
- **`frontend/`** — клиентская часть для взаимодействия с агентами

## ✨ Возможности

- 💬 Чат-интерфейс для общения с AI-агентами
- 🧠 Агенты на LangGraph с поддержкой инструментов через `langchain-mcp-adapters`
- ⚡ Groq в качестве LLM-провайдера
- 🔐 Аутентификация пользователей (JWT + хеширование паролей через Argon2)
- 🐘 PostgreSQL как основное хранилище данных
- 🐳 Готовые Docker-образы и `docker-compose` для локального запуска
- ✅ CI на GitHub Actions

## 🧩 Доступные агенты

| Агент | Описание |
|---|---|
| **Personal Assistant** | Личный помощник, который умеет планировать события в календаре и управлять почтой |

*Список агентов будет пополняться — см. [Roadmap](#-roadmap).*

## 🛠 Технологический стек

**Backend**
- [Python](https://www.python.org/) 3.13+
- [FastAPI](https://fastapi.tiangolo.com/) — веб-фреймворк
- [LangChain](https://www.langchain.com/) & [LangGraph](https://www.langchain.com/langgraph) — построение AI-агентов
- [Groq](https://groq.com/) — LLM-провайдер
- [langchain-mcp-adapters](https://github.com/langchain-ai/langchain-mcp-adapters) — интеграция инструментов через MCP
- [SQLAlchemy](https://www.sqlalchemy.org/) + [psycopg](https://www.psycopg.org/) — работа с PostgreSQL
- [PyJWT](https://pyjwt.readthedocs.io/) + [pwdlib](https://frankie567.github.io/pwdlib/) (Argon2) — аутентификация
- [pytest](https://docs.pytest.org/) — тестирование

**Инфраструктура**
- Docker / Docker Compose
- GitHub Actions (CI)
- [uv](https://github.com/astral-sh/uv) — управление зависимостями Python

## 📂 Структура проекта

```
ai-agents-app/
├── app/                    # Бэкенд: FastAPI + агенты на LangGraph
├── frontend/                # Клиентская часть
├── tests/                   # Тесты
├── .github/workflows/       # CI-пайплайны
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
└── uv.lock
```

## 🚀 Быстрый старт

### Вариант 1: через Docker Compose (рекомендуется)

```bash
git clone https://github.com/carbon77/ai-agents-app.git
cd ai-agents-app

# создайте файл .env и заполните переменные окружения (см. ниже)
cp .env.example .env

docker compose up --build
```

### Вариант 2: локальный запуск бэкенда

Проект использует [uv](https://github.com/astral-sh/uv) для управления зависимостями.

```bash
git clone https://github.com/carbon77/ai-agents-app.git
cd ai-agents-app

# установка зависимостей
uv sync

# запуск сервера разработки
uv run fastapi dev app
```

### Переменные окружения

Для работы приложения потребуются как минимум:

```env
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_jwt_secret_key
DB_NAME=your_db_name
DB_HOST=your_db_host
DB_PORT=your_db_port
DB_USER=your_db_user
DB_PASSWORD=your_db_password

```

## 🧪 Тесты

```bash
uv run pytest
```

## 👤 Автор

**carbon77** — [GitHub](https://github.com/carbon77)

---
