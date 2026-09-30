from typing import List, Dict, Any, Optional
from datetime import datetime
from app.schemas.cargomind_v4 import FleetVehicle, FleetActionRequest


class FleetEngine:
    """
    Fleet Engine managing dynamic vehicle pool, live telemetry, payload/volume capacity matching,
    pickup ETAs, and carrier action workflows.
    """

    def __init__(self):
        self._fleet_pool: List[Dict[str, Any]] = [
            {
                "vehicle_id": "AS-01-EV-4091",
                "carrier_name": "Assam Green Logistics",
                "vehicle_type": "Tata Ace EV Reefer",
                "current_location": "Guwahati Hub",
                "current_lat": 26.1445,
                "current_lng": 91.7362,
                "max_payload_kg": 1200.0,
                "current_payload_kg": 980.0,
                "max_volume_m3": 6.5,
                "current_volume_m3": 5.2,
                "capacity_utilization_pct": 81.6,
                "temp_capability": "chilled",
                "current_temp": 4.2,
                "target_temp": 4.0,
                "fuel_type": "Electric",
                "availability": "available",
                "driver_name": "Biplab Barman",
                "driver_phone": "+91 98540 11223",
                "health_score": 96.0,
                "last_telemetry": datetime.utcnow(),
            },
            {
                "vehicle_id": "AS-07-CD-8832",
                "carrier_name": "Brahmaputra Cold Freight",
                "vehicle_type": "Eicher Pro 2059XP Heavy Reefer",
                "current_location": "Tezpur Sub-Hub",
                "current_lat": 26.6528,
                "current_lng": 92.7926,
                "max_payload_kg": 6500.0,
                "current_payload_kg": 5400.0,
                "max_volume_m3": 24.0,
                "current_volume_m3": 19.8,
                "capacity_utilization_pct": 83.1,
                "temp_capability": "frozen",
                "current_temp": -18.4,
                "target_temp": -18.0,
                "fuel_type": "Diesel BS-VI",
                "availability": "en_route",
                "driver_name": "Ramen Deka",
                "driver_phone": "+91 94350 44556",
                "health_score": 91.5,
                "last_telemetry": datetime.utcnow(),
            },
            {
                "vehicle_id": "ML-05-AB-3319",
                "carrier_name": "Meghalaya Mountain Transit",
                "vehicle_type": "Mahindra Bolero Maxi Camper 4x4",
                "current_location": "Shillong Hub",
                "current_lat": 25.5788,
                "current_lng": 91.8933,
                "max_payload_kg": 1500.0,
                "current_payload_kg": 600.0,
                "max_volume_m3": 8.0,
                "current_volume_m3": 3.2,
                "capacity_utilization_pct": 40.0,
                "temp_capability": "chilled",
                "current_temp": 3.8,
                "target_temp": 4.0,
                "fuel_type": "Diesel 4WD",
                "availability": "available",
                "driver_name": "Khrawbok Marwein",
                "driver_phone": "+91 87941 77889",
                "health_score": 94.0,
                "last_telemetry": datetime.utcnow(),
            },
            {
                "vehicle_id": "AS-14-GH-9012",
                "carrier_name": "Surma Valley Express",
                "vehicle_type": "Ashok Leyland Partner Reefer",
                "current_location": "Silchar Terminal",
                "current_lat": 24.8333,
                "current_lng": 92.7789,
                "max_payload_kg": 4200.0,
                "current_payload_kg": 3750.0,
                "max_volume_m3": 16.0,
                "current_volume_m3": 14.5,
                "capacity_utilization_pct": 89.2,
                "temp_capability": "chilled",
                "current_temp": 4.6,
                "target_temp": 4.0,
                "fuel_type": "Diesel BS-VI",
                "availability": "available",
                "driver_name": "Debojit Paul",
                "driver_phone": "+91 97060 33441",
                "health_score": 88.0,
                "last_telemetry": datetime.utcnow(),
            },
        ]

    def get_fleet_pool(self) -> List[FleetVehicle]:
        return [FleetVehicle(**v) for v in self._fleet_pool]

    def match_vehicle_for_load(
        self,
        weight_kg: float,
        volume_m3: float,
        temp_class: str,
        origin_lat: float,
        origin_lng: float,
    ) -> Dict[str, Any]:
        compatible_vehicles = []
        for v in self._fleet_pool:
            if v["availability"] != "available":
                continue
            # Check temp compatibility
            if temp_class == "frozen" and v["temp_capability"] != "frozen":
                continue
            
            avail_weight = v["max_payload_kg"] - v["current_payload_kg"]
            avail_vol = v["max_volume_m3"] - v["current_volume_m3"]

            if avail_weight >= weight_kg and avail_vol >= volume_m3:
                # Calculate distance from origin
                dist_km = ((v["current_lat"] - origin_lat)**2 + (v["current_lng"] - origin_lng)**2)**0.5 * 111.0
                pickup_eta_min = round(dist_km / 35.0 * 60.0 + 10.0, 0)
                operating_cost = round(dist_km * 18.0 + 800.0, 0)
                new_util = round((v["current_payload_kg"] + weight_kg) / v["max_payload_kg"] * 100.0, 1)

                compatible_vehicles.append({
                    "vehicle": FleetVehicle(**v),
                    "distance_to_pickup_km": round(dist_km, 1),
                    "pickup_eta_minutes": pickup_eta_min,
                    "new_capacity_utilization_pct": new_util,
                    "operating_cost_inr": operating_cost,
                    "risk_score_pct": 12.5 if dist_km < 30 else 24.0,
                })

        compatible_vehicles.sort(key=lambda x: (x["pickup_eta_minutes"], -x["new_capacity_utilization_pct"]))
        return {
            "requested_load": {"weight_kg": weight_kg, "volume_m3": volume_m3, "temp_class": temp_class},
            "best_match": compatible_vehicles[0] if compatible_vehicles else None,
            "all_matches": compatible_vehicles,
        }

    def process_carrier_action(self, vehicle_id: str, action_req: FleetActionRequest) -> Dict[str, Any]:
        for v in self._fleet_pool:
            if v["vehicle_id"] == vehicle_id:
                if action_req.action == "accept":
                    v["availability"] = "assigned"
                    return {"status": "SUCCESS", "message": f"Carrier accepted load for {vehicle_id}", "vehicle_id": vehicle_id}
                elif action_req.action == "reject":
                    v["availability"] = "available"
                    return {"status": "REJECTED", "message": f"Carrier rejected load. Re-matching solver triggered.", "vehicle_id": vehicle_id}
                elif action_req.action == "counter_offer":
                    return {
                        "status": "COUNTER_OFFERED",
                        "counter_price": action_req.counter_price or 5200.0,
                        "message": f"Counter offer submitted for {vehicle_id}",
                        "vehicle_id": vehicle_id,
                    }
                elif action_req.action == "report_unavailable":
                    v["availability"] = "maintenance"
                    return {"status": "UNAVAILABLE", "message": f"Vehicle {vehicle_id} marked as unavailable", "vehicle_id": vehicle_id}
        
        return {"status": "ERROR", "message": "Vehicle not found", "vehicle_id": vehicle_id}


fleet_engine = FleetEngine()
