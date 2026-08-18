from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status

from app.db.mongodb import get_database


def serialize_tenant(document):
    return {
        "id": str(document["_id"]),
        "name": document["name"],
        "room": document["room"],
        "rent": document["rent"],
        "sharing": document["sharing"],
        "rent_month": document["rent_month"],
        "mobile": document["mobile"],
        "email": document.get("email"),
        "is_active": document["is_active"],
        "created_at": document["created_at"],
        "updated_at": document["updated_at"],
    }


def validate_object_id(tenant_id: str):
    if not ObjectId.is_valid(tenant_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tenant ID.",
        )

    return ObjectId(tenant_id)


async def create_tenant(data):
    db = get_database()

    now = datetime.now(timezone.utc)

    document = {
        **data.model_dump(),
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.tenants.insert_one(document)

    created = await db.tenants.find_one(
        {"_id": result.inserted_id}
    )

    return serialize_tenant(created)

async def get_active_tenants():
    db = get_database()

    cursor = db.tenants.find(
        {"is_active": True}
    ).sort("created_at", -1)

    tenants = []

    async for document in cursor:
        tenants.append(serialize_tenant(document))

    return tenants


async def get_archived_tenants():
    db = get_database()

    cursor = db.tenants.find(
        {"is_active": False}
    ).sort("updated_at", -1)

    tenants = []

    async for document in cursor:
        tenants.append(serialize_tenant(document))

    return tenants


async def get_tenant(tenant_id: str):
    db = get_database()

    object_id = validate_object_id(tenant_id)

    tenant = await db.tenants.find_one(
        {"_id": object_id}
    )

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found.",
        )

    return serialize_tenant(tenant)


async def update_tenant(tenant_id: str, data):
    db = get_database()

    object_id = validate_object_id(tenant_id)

    tenant = await db.tenants.find_one(
        {"_id": object_id}
    )

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found.",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        return serialize_tenant(tenant)

    update_data["updated_at"] = datetime.now(timezone.utc)

    await db.tenants.update_one(
        {"_id": object_id},
        {"$set": update_data},
    )

    updated = await db.tenants.find_one(
        {"_id": object_id}
    )

    return serialize_tenant(updated)

async def deactivate_tenant(tenant_id: str):
    db = get_database()

    object_id = validate_object_id(tenant_id)

    tenant = await db.tenants.find_one(
        {"_id": object_id}
    )

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found.",
        )

    await db.tenants.update_one(
        {"_id": object_id},
        {
            "$set": {
                "is_active": False,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    updated = await db.tenants.find_one(
        {"_id": object_id}
    )

    return serialize_tenant(updated)


async def restore_tenant(tenant_id: str):
    db = get_database()

    object_id = validate_object_id(tenant_id)

    tenant = await db.tenants.find_one(
        {"_id": object_id}
    )

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found.",
        )

    # existing_room = await db.tenants.find_one(
    #     {
    #         "_id": {"$ne": object_id},
    #         "room": tenant["room"],
    #         "is_active": True,
    #     }
    # )

    # if existing_room:
    #     raise HTTPException(
    #         status_code=status.HTTP_409_CONFLICT,
    #         detail=(
    #             f"Room {tenant['room']} is currently occupied "
    #             "by another active tenant."
    #         ),
    #     )

    await db.tenants.update_one(
        {"_id": object_id},
        {
            "$set": {
                "is_active": True,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    updated = await db.tenants.find_one(
        {"_id": object_id}
    )

    return serialize_tenant(updated)


async def delete_tenant(tenant_id: str):
    db = get_database()

    object_id = validate_object_id(tenant_id)

    result = await db.tenants.delete_one(
        {"_id": object_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found.",
        )

    return {
        "message": "Tenant permanently deleted."
    }