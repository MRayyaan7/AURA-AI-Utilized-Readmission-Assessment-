from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://aura:aura@localhost:5432/aura"
    GOOGLE_API_KEY: Optional[str] = None
    MODEL_VERSION: str = "v1.0.0"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
