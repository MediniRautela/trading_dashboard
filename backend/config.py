"""
Application configuration using Pydantic Settings.
Loads from environment variables with sensible defaults.
"""
from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    
    # Application
    app_name: str = "ARTHA Trading Dashboard"
    app_version: str = "1.0.0"
    debug: bool = False
    environment: Literal["development", "staging", "production"] = "development"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./artha.db"
    # For production PostgreSQL:
    # database_url: str = "postgresql+asyncpg://user:pass@localhost/artha"
    
    # JWT Authentication
    jwt_secret_key: str = "your-super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7
    
    # External APIs
    finnhub_api_key: str = ""
    
    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Rate Limiting
    rate_limit_per_minute: int = 100
    auth_rate_limit_per_minute: int = 10
    
    # Paper Trading
    initial_paper_balance: float = 100000.0  # $100,000 starting balance
    
    # ML Model
    model_checkpoint_path: str = "checkpoints/best_multitask_cnn.pt"
    
    # Frontend URL (for redirects)
    frontend_url: str = "http://localhost:3000"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Export settings instance
settings = get_settings()
