from fastapi import APIRouter, status

from app.schemas.tenant import (
    TenantCreate,
    TenantResponse,
    TenantUpdate,
)
from app.services.tenant_service import (
    create_tenant,
    get_active_tenants,
    get_archived_tenants,
    get_tenant,
    update_tenant,
    deactivate_tenant,
    restore_tenant,
    delete_tenant,
)


router = APIRouter(
    prefix="/api/tenants",
    tags=["Tenants"],
)


@router.post(
    "",
    response_model=TenantResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create(data: TenantCreate):
    return await create_tenant(data)


@router.get(
    "",
    response_model=list[TenantResponse],
)
async def get_active():
    return await get_active_tenants()


@router.get(
    "/archived",
    response_model=list[TenantResponse],
)
async def get_archived():
    return await get_archived_tenants()


@router.get(
    "/{tenant_id}",
    response_model=TenantResponse,
)
async def get_one(tenant_id: str):
    return await get_tenant(tenant_id)


@router.put(
    "/{tenant_id}",
    response_model=TenantResponse,
)
async def update(
    tenant_id: str,
    data: TenantUpdate,
):
    return await update_tenant(
        tenant_id,
        data,
    )


@router.patch(
    "/{tenant_id}/deactivate",
    response_model=TenantResponse,
)
async def deactivate(tenant_id: str):
    return await deactivate_tenant(tenant_id)


@router.patch(
    "/{tenant_id}/restore",
    response_model=TenantResponse,
)
async def restore(tenant_id: str):
    return await restore_tenant(tenant_id)


@router.delete(
    "/{tenant_id}",
)
async def delete(tenant_id: str):
    return await delete_tenant(tenant_id)