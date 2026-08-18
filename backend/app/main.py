from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.mongodb import (
    connect_to_database,
    close_database_connection,
)
from app.routes.tenants import router as tenant_router
from app.routes.receipts import router as receipt_router
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_database()

    yield

    await close_database_connection()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for RentLedger rent receipt management system.",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tenant_router)
app.include_router(receipt_router)


@app.get("/")
async def root():
    return {
        "message": "RentLedger API is running",
        "version": settings.app_version,
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
    }