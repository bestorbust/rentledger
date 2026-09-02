from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "RentLedger API"
    app_version: str = "1.0.0"

    mongodb_uri: str
    mongodb_database: str = "rentledger"

    frontend_url: str = "http://localhost:5173"

    brevo_api_key: str

    # smtp_host: str = "smtp.gmail.com"
    # smtp_port: int = 587
    # smtp_username: str
    # smtp_password: str
    smtp_from_email: str
    smtp_from_name: str = "Sahana Ladies PG"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()