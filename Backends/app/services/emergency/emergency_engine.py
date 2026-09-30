from typing import Dict, Any, List
from datetime import datetime
import uuid
from app.schemas.cargomind_v4 import EmergencyReportRequest, EmergencyReportResponse


class EmergencyEngine:
    """
    Emergency Response & Field Intervention Engine.
    Handles critical breakdown / refrigeration failures / roadblocks in real-time,
    instantly identifying nearest cold storage hubs and backup vehicles for cargo rescue.
    """

    def __init__(self):
        self._active_incidents: List[Dict[str, Any]] = [
            {
                "incident_id": "INC-2026-0891",
                "incident_type": "refrigeration_failure",
                "severity": "CRITICAL",
                "vehicle_id": "AS-14-GH-9012",
                "shipment_id": "CM-2026-001842",
                "location": "NH-27 KM Marker 182 (Near Raha)",
                "cargo_weight_kg": 3200.0,
                "temp_class": "chilled",
                "current_temp": 8.4,
                "target_temp": 4.0,
                "nearest_cold_hub": "Nagaon Pre-Cooling Hub (31 km)",
                "nearest_cold_hub_distance_km": 31.0,
                "nearest_backup_vehicle": "AS-01-EV-4091 (18 km)",
                "nearest_backup_vehicle_distance_km": 18.0,
                "recommended_action": "INITIATE IMMEDIATE CARGO TRANSFER to Backup Vehicle AS-01-EV-4091; Precool Nagaon Hub Dock 01",
                "status": "ACTIVE_DISPATCHED",
                "created_at": datetime.utcnow(),
            }
        ]

    def report_incident(self, req: EmergencyReportRequest) -> EmergencyReportResponse:
        inc_id = f"INC-2026-{uuid.uuid4().hex[:6].upper()}"
        
        # Determine nearest hub and vehicle based on coordinates
        nearest_hub = "Guwahati Central Hub" if req.gps_lat > 26.0 else "Silchar Terminal"
        hub_dist = 28.5
        backup_veh = "AS-01-EV-4091"
        veh_dist = 14.2

        rec_action = f"REROUTE TO {nearest_hub} ({hub_dist}km) OR TRANSFER CARGO TO BACKUP {backup_veh}"
        if "refrigeration" in req.incident_type.lower():
            rec_action = f"TRANSFER {req.cargo_weight_kg}kg CARGO to backup reefer {backup_veh}; Activate emergency coolant injection."

        incident_record = {
            "incident_id": inc_id,
            "incident_type": req.incident_type,
            "severity": req.severity,
            "vehicle_id": req.vehicle_id,
            "shipment_id": req.shipment_id,
            "location": req.location,
            "cargo_weight_kg": req.cargo_weight_kg,
            "temp_class": req.temp_class,
            "current_temp": req.current_temp,
            "target_temp": req.target_temp,
            "nearest_cold_hub": nearest_hub,
            "nearest_cold_hub_distance_km": hub_dist,
            "nearest_backup_vehicle": backup_veh,
            "nearest_backup_vehicle_distance_km": veh_dist,
            "recommended_action": rec_action,
            "status": "ACTIVE",
            "created_at": datetime.utcnow(),
        }
        self._active_incidents.insert(0, incident_record)

        return EmergencyReportResponse(
            incident_id=inc_id,
            incident_type=req.incident_type,
            status="ACTIVE",
            nearest_cold_hub=nearest_hub,
            nearest_cold_hub_distance_km=hub_dist,
            nearest_backup_vehicle=backup_veh,
            nearest_backup_vehicle_distance_km=veh_dist,
            recommended_action=rec_action,
            created_at=incident_record["created_at"],
        )

    def get_active_incidents(self) -> List[Dict[str, Any]]:
        return self._active_incidents


emergency_engine = EmergencyEngine()
