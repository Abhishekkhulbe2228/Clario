from  app.core.config import get_settings

settings = get_settings()

print(f"Tavily AI api: {settings.tavily_api_key}")