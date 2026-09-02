from app.db.mongodb import get_database


async def create_indexes():
    db = get_database()
 
    # TENANT INDEXES
 
    # Used by:
    # GET /api/tenants
    # Find all active tenants and sort by created_at.
    await db.tenants.create_index(
        [
            ("is_active", 1),
            ("created_at", -1),
        ],
        name="tenants_active_created_at",
    )

    # Used by:
    # GET /api/tenants/archived
    # Find all archived tenants and sort by updated_at.
    await db.tenants.create_index(
        [
            ("is_active", 1),
            ("updated_at", -1),
        ],
        name="tenants_archived_updated_at",
    )

    # Used for room-based lookups.
    # Multiple tenants are allowed in the same room.
    await db.tenants.create_index(
        [
            ("room", 1),
            ("is_active", 1),
        ],
        name="tenants_room_active",
    )

    # Used when looking up a tenant's active status.
    await db.tenants.create_index(
        [
            ("is_active", 1),
        ],
        name="tenants_is_active",
    )

    # RECEIPT INDEXES

    # Used when checking whether a receipt already exists
    # for a tenant and rent month.
    await db.receipts.create_index(
        [
            ("tenant_id", 1),
            ("rent_month", 1),
            ("status", 1),
        ],
        name="receipts_tenant_month_status",
    )

    # Used by:
    # GET /api/receipts
    # Sort receipts by newest first.
    await db.receipts.create_index(
        [
            ("created_at", -1),
        ],
        name="receipts_created_at",
    )

    # Used when retrieving all receipts belonging to a tenant.
    await db.receipts.create_index(
        [
            ("tenant_id", 1),
            ("created_at", -1),
        ],
        name="receipts_tenant_created_at",
    )

    # Receipt numbers must be unique.
    await db.receipts.create_index(
        [
            ("receipt_number", 1),
        ],
        unique=True,
        name="receipts_receipt_number_unique",
    )

     # COUNTERS INDEX

    print("MongoDB indexes created successfully.")