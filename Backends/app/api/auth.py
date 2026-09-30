from uuid import UUID, uuid4
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.auth import create_access_token, decode_token
from app.models.tenant import Tenant, TenantType
from app.schemas.tenant import TenantRead, TenantCreate

router = APIRouter(prefix="/auth", tags=["Auth & Tenants"])

# Predefined demo profiles for instant 1-click login
DEMO_PROFILES = {
    "shipper": {
        "id": UUID("11111111-1111-1111-1111-111111111111"),
        "name": "Assam Tea Logistics Consortium",
        "email": "shipper@cargomind.in",
        "role": TenantType.shipper,
        "region": "Guwahati Hub (North-East Corridor)",
        "gstin": "18AABCA1234F1Z8",
    },
    "carrier": {
        "id": UUID("22222222-2222-2222-2222-222222222222"),
        "name": "Brahmaputra Freight Fleet Services",
        "email": "carrier@cargomind.in",
        "role": TenantType.carrier,
        "region": "Dibrugarh Multi-Modal Depot",
        "gstin": "18XYZAB9876C1Z3",
    },
    "admin": {
        "id": UUID("33333333-3333-3333-3333-333333333333"),
        "name": "North-East Corridor Command HQ",
        "email": "admin@cargomind.in",
        "role": TenantType.admin,
        "region": "HQ Dispur Central Operations",
        "gstin": "18GOVHQ0000A1Z0",
    },
}


class TokenRequest(BaseModel):
    tenant_id: UUID
    role: TenantType = TenantType.shipper


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Email, Username, or Tenant ID")
    password: Optional[str] = Field(None, description="Password (optional in demo mode)")
    role: TenantType = Field(default=TenantType.shipper)


class DemoLoginRequest(BaseModel):
    role: TenantType = Field(default=TenantType.shipper)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    tenant_id: UUID
    role: TenantType
    name: str
    email: Optional[str] = None
    region: Optional[str] = None


class UserProfileResponse(BaseModel):
    tenant_id: UUID
    name: str
    role: TenantType
    email: Optional[str] = None
    region: Optional[str] = None
    created_at: Optional[str] = None


@router.post("/register-tenant", response_model=TenantRead, status_code=status.HTTP_201_CREATED)
async def register_tenant(data: TenantCreate, db: AsyncSession = Depends(get_db)):
    tenant = Tenant(id=uuid4(), name=data.name, type=data.type)
    db.add(tenant)
    await db.commit()
    await db.refresh(tenant)
    return tenant


@router.post("/token", response_model=TokenResponse)
async def get_token(data: TokenRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(Tenant).where(Tenant.id == data.tenant_id)
    result = await db.execute(stmt)
    tenant = result.scalar_one_or_none()

    if not tenant:
        # Auto-create demo tenant if missing
        tenant = Tenant(id=data.tenant_id, name=f"Tenant-{data.tenant_id}", type=data.role)
        db.add(tenant)
        await db.commit()
        await db.refresh(tenant)

    token_data = {"tenant_id": str(tenant.id), "role": tenant.type.value, "name": tenant.name}
    token_str = create_access_token(token_data)

    return TokenResponse(
        access_token=token_str,
        token_type="bearer",
        tenant_id=tenant.id,
        role=tenant.type,
        name=tenant.name,
    )


@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(data: DemoLoginRequest, db: AsyncSession = Depends(get_db)):
    role_key = data.role.value if hasattr(data.role, "value") else str(data.role)
    profile = DEMO_PROFILES.get(role_key, DEMO_PROFILES["shipper"])

    stmt = select(Tenant).where(Tenant.id == profile["id"])
    result = await db.execute(stmt)
    tenant = result.scalar_one_or_none()

    if not tenant:
        tenant = Tenant(id=profile["id"], name=profile["name"], type=profile["role"])
        db.add(tenant)
        await db.commit()
        await db.refresh(tenant)

    token_data = {
        "tenant_id": str(tenant.id),
        "role": tenant.type.value,
        "name": profile["name"],
        "email": profile["email"],
    }
    token_str = create_access_token(token_data)

    return TokenResponse(
        access_token=token_str,
        token_type="bearer",
        tenant_id=tenant.id,
        role=tenant.type,
        name=profile["name"],
        email=profile["email"],
        region=profile["region"],
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Check if identifier matches any demo profile
    for key, prof in DEMO_PROFILES.items():
        if (
            data.identifier.lower() == prof["email"].lower()
            or data.identifier.lower() == key
            or str(prof["id"]) == data.identifier
        ):
            return await demo_login(DemoLoginRequest(role=prof["role"]), db)

    # Check if identifier is a valid UUID
    tenant = None
    try:
        tenant_uuid = UUID(data.identifier)
        stmt = select(Tenant).where(Tenant.id == tenant_uuid)
        result = await db.execute(stmt)
        tenant = result.scalar_one_or_none()
    except (ValueError, TypeError):
        # Search by tenant name
        stmt = select(Tenant).where(Tenant.name == data.identifier)
        result = await db.execute(stmt)
        tenant = result.scalar_one_or_none()

    if not tenant:
        # Create standard tenant for user login
        tenant = Tenant(
            id=uuid4(),
            name=data.identifier if not "@" in data.identifier else data.identifier.split("@")[0].capitalize(),
            type=data.role,
        )
        db.add(tenant)
        await db.commit()
        await db.refresh(tenant)

    token_data = {"tenant_id": str(tenant.id), "role": tenant.type.value, "name": tenant.name}
    token_str = create_access_token(token_data)

    return TokenResponse(
        access_token=token_str,
        token_type="bearer",
        tenant_id=tenant.id,
        role=tenant.type,
        name=tenant.name,
        email=data.identifier if "@" in data.identifier else None,
    )


@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    authorization: Optional[str] = Header(None),
    x_tenant_id: Optional[str] = Header(None),
    x_tenant_role: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    tenant_id_str = None
    role_val = TenantType.shipper
    user_name = "Authenticated Tenant"
    user_email = None

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload = decode_token(token)
            tenant_id_str = payload.get("tenant_id")
            role_val = payload.get("role", TenantType.shipper)
            user_name = payload.get("name", user_name)
            user_email = payload.get("email")
        except Exception:
            pass

    if not tenant_id_str and x_tenant_id:
        tenant_id_str = x_tenant_id
        if x_tenant_role:
            try:
                role_val = TenantType(x_tenant_role)
            except Exception:
                pass

    if not tenant_id_str:
        # Return default guest/demo profile
        return UserProfileResponse(
            tenant_id=DEMO_PROFILES["shipper"]["id"],
            name=DEMO_PROFILES["shipper"]["name"],
            role=DEMO_PROFILES["shipper"]["role"],
            email=DEMO_PROFILES["shipper"]["email"],
            region=DEMO_PROFILES["shipper"]["region"],
        )

    try:
        t_uuid = UUID(tenant_id_str)
        stmt = select(Tenant).where(Tenant.id == t_uuid)
        result = await db.execute(stmt)
        tenant = result.scalar_one_or_none()
        if tenant:
            return UserProfileResponse(
                tenant_id=tenant.id,
                name=tenant.name,
                role=tenant.type,
                email=user_email,
                created_at=tenant.created_at.isoformat() if tenant.created_at else None,
            )
    except Exception:
        pass

    return UserProfileResponse(
        tenant_id=UUID("11111111-1111-1111-1111-111111111111"),
        name=user_name,
        role=role_val if isinstance(role_val, TenantType) else TenantType(role_val),
        email=user_email,
    )

