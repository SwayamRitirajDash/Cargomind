from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON, Text
from datetime import datetime
import enum
from app.models.base import Base


class IncidentSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class EmergencyType(str, enum.Enum):
    REFRIGERATION_FAILURE = "refrigeration_failure"
    VEHICLE_BREAKDOWN = "vehicle_breakdown"
    LANDSLIDE = "landslide"
    FLOOD = "flood"
    ACCIDENT = "accident"
    MEDICAL = "medical"
    ROAD_BLOCKAGE = "road_blockage"
    CARGO_DAMAGE = "cargo_damage"


class EPODRecord(Base):
    __tablename__ = "epod_records"

    id = Column(String(64), primary_key=True, index=True)
    shipment_id = Column(String(64), index=True, nullable=False)
    driver_id = Column(String(64), nullable=True)
    recipient_name = Column(String(128), nullable=False)
    recipient_phone = Column(String(32), nullable=True)
    delivered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    gps_lat = Column(Float, nullable=False)
    gps_lng = Column(Float, nullable=False)
    photo_url = Column(String(512), nullable=True)
    signature_data = Column(Text, nullable=True)
    otp_code = Column(String(16), nullable=True)
    otp_verified = Column(Boolean, default=True)
    quantity_confirmed = Column(Float, nullable=True)
    cargo_condition = Column(String(64), default="intact")
    integrity_score = Column(Float, default=95.0)
    notes = Column(Text, nullable=True)


class DigitalPassport(Base):
    __tablename__ = "digital_passports"

    id = Column(String(64), primary_key=True, index=True)
    shipment_id = Column(String(64), unique=True, index=True, nullable=False)
    product_name = Column(String(128), nullable=False)
    origin = Column(String(128), nullable=False)
    destination = Column(String(128), nullable=False)
    target_temperature = Column(Float, nullable=False)
    current_temperature = Column(Float, nullable=False)
    peak_temperature = Column(Float, nullable=False)
    min_temperature = Column(Float, nullable=False)
    transit_duration_hours = Column(Float, default=0.0)
    temperature_excursions = Column(Integer, default=0)
    door_openings = Column(Integer, default=0)
    shock_events = Column(Integer, default=0)
    shelf_life_remaining_pct = Column(Float, default=100.0)
    cold_chain_integrity = Column(String(32), default="GOOD")
    integrity_score = Column(Float, default=95.0)
    qr_code_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ConsolidationGroup(Base):
    __tablename__ = "consolidation_groups"

    id = Column(String(64), primary_key=True, index=True)
    group_name = Column(String(128), nullable=False)
    origin_hub = Column(String(128), nullable=False)
    destination_hub = Column(String(128), nullable=False)
    temp_class = Column(String(32), nullable=False)
    shipment_ids = Column(JSON, default=list)
    total_weight_kg = Column(Float, default=0.0)
    total_volume_m3 = Column(Float, default=0.0)
    vehicle_utilization_pct = Column(Float, default=0.0)
    separate_dispatch_cost = Column(Float, default=0.0)
    consolidated_cost = Column(Float, default=0.0)
    estimated_savings = Column(Float, default=0.0)
    assigned_vehicle_id = Column(String(64), nullable=True)
    status = Column(String(32), default="detected")
    created_at = Column(DateTime, default=datetime.utcnow)


class CrossDockPlan(Base):
    __tablename__ = "crossdock_plans"

    id = Column(String(64), primary_key=True, index=True)
    hub_id = Column(String(64), index=True, nullable=False)
    dock_number = Column(String(32), nullable=False)
    dock_type = Column(String(32), default="chilled")  # frozen, chilled, ambient
    assigned_vehicle_id = Column(String(64), nullable=True)
    shipment_ids = Column(JSON, default=list)
    arrival_time = Column(DateTime, nullable=True)
    departure_time = Column(DateTime, nullable=True)
    handling_time_minutes = Column(Integer, default=30)
    sla_priority = Column(String(32), default="normal")
    status = Column(String(32), default="scheduled")


class HubEnergy(Base):
    __tablename__ = "hub_energies"

    id = Column(String(64), primary_key=True, index=True)
    hub_id = Column(String(64), unique=True, index=True, nullable=False)
    solar_generation_pct = Column(Float, default=70.0)
    battery_level_pct = Column(Float, default=85.0)
    cold_room_load_pct = Column(Float, default=60.0)
    grid_status = Column(String(32), default="ONLINE")
    backup_autonomy_hours = Column(Float, default=14.0)
    energy_risk_level = Column(String(32), default="LOW")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLogEvent(Base):
    __tablename__ = "audit_log_events"

    id = Column(String(64), primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    event_type = Column(String(64), nullable=False)
    shipment_id = Column(String(64), index=True, nullable=True)
    vehicle_id = Column(String(64), nullable=True)
    actor = Column(String(128), default="System")
    location = Column(String(128), nullable=True)
    details = Column(JSON, default=dict)
    temperature = Column(Float, nullable=True)
    verification_method = Column(String(64), nullable=True)


class CarrierSettlement(Base):
    __tablename__ = "carrier_settlements"

    id = Column(String(64), primary_key=True, index=True)
    carrier_id = Column(String(64), index=True, nullable=False)
    shipment_id = Column(String(64), index=True, nullable=False)
    invoice_number = Column(String(64), unique=True, nullable=False)
    base_freight_cost = Column(Float, default=0.0)
    distance_km = Column(Float, default=0.0)
    fuel_surcharge = Column(Float, default=0.0)
    cold_chain_premium = Column(Float, default=0.0)
    mountain_terrain_surcharge = Column(Float, default=0.0)
    consolidation_discount = Column(Float, default=0.0)
    insurance_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    payment_status = Column(String(32), default="PENDING")
    settled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class EmergencyIncident(Base):
    __tablename__ = "emergency_incidents"

    id = Column(String(64), primary_key=True, index=True)
    incident_type = Column(String(64), nullable=False)
    severity = Column(String(32), default="HIGH")
    vehicle_id = Column(String(64), nullable=True)
    shipment_id = Column(String(64), nullable=True)
    location = Column(String(128), nullable=False)
    gps_lat = Column(Float, nullable=True)
    gps_lng = Column(Float, nullable=True)
    cargo_weight_kg = Column(Float, default=0.0)
    temp_class = Column(String(32), default="chilled")
    current_temp = Column(Float, nullable=True)
    target_temp = Column(Float, nullable=True)
    nearest_cold_hub = Column(String(128), nullable=True)
    nearest_cold_hub_distance_km = Column(Float, nullable=True)
    nearest_backup_vehicle = Column(String(64), nullable=True)
    nearest_backup_vehicle_distance_km = Column(Float, nullable=True)
    recommended_action = Column(String(256), nullable=False)
    status = Column(String(32), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
