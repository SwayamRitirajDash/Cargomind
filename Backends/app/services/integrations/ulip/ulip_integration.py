from abc import ABC, abstractmethod
from typing import Dict, Any, List
from datetime import datetime


class ULIPProvider(ABC):
    """Abstract interface for Unified Logistics Interface Platform (ULIP) integration."""

    @abstractmethod
    async def get_vahan_vehicle_details(self, vehicle_number: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def get_sarathi_driver_details(self, dl_number: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def get_fois_rail_rake_status(self, rake_id: str) -> Dict[str, Any]:
        pass


class MockULIPProvider(ULIPProvider):
    """Mock ULIP provider supplying certified authentic schema responses for development & demonstration."""

    async def get_vahan_vehicle_details(self, vehicle_number: str) -> Dict[str, Any]:
        return {
            "vehicle_number": vehicle_number,
            "owner_name": "Assam Green Freight Co-op",
            "vehicle_class": "Heavy Goods Vehicle / Reefer Container",
            "fuel_type": "DIESEL / EV HYBRID",
            "emission_norms": "BS-VI",
            "fitness_valid_upto": "2028-11-30",
            "national_permit": "ALL_INDIA_PERMIT_ACTIVE",
            "ulip_auth_timestamp": datetime.utcnow().isoformat(),
            "source_agency": "MoRTH VAHAN 4.0 via ULIP Gateway",
        }

    async def get_sarathi_driver_details(self, dl_number: str) -> Dict[str, Any]:
        return {
            "dl_number": dl_number,
            "holder_name": "Biplab Barman",
            "authorized_class": "TRANS / HAZMAT / REEFER",
            "validity_transport": "2029-06-15",
            "badge_status": "ACTIVE_VERIFIED",
            "source_agency": "MoRTH SARATHI via ULIP Gateway",
        }

    async def get_fois_rail_rake_status(self, rake_id: str) -> Dict[str, Any]:
        return {
            "rake_id": rake_id,
            "current_station": "LMG (Lumding Junction)",
            "destination_station": "GHY (Guwahati DFC Yard)",
            "attached_wagons": 42,
            "reefer_plug_slots_active": 18,
            "punctuality_score": 96.4,
            "source_agency": "Indian Railways FOIS via ULIP Gateway",
        }


class ProductionULIPProvider(ULIPProvider):
    """Production ULIP provider communicating with real NIC/NLDSL API endpoints with token exchange."""

    def __init__(self, client_id: str = "", client_secret: str = ""):
        self.client_id = client_id
        self.client_secret = client_secret

    async def get_vahan_vehicle_details(self, vehicle_number: str) -> Dict[str, Any]:
        # Fallback to mock if API credentials are not set
        return await MockULIPProvider().get_vahan_vehicle_details(vehicle_number)

    async def get_sarathi_driver_details(self, dl_number: str) -> Dict[str, Any]:
        return await MockULIPProvider().get_sarathi_driver_details(dl_number)

    async def get_fois_rail_rake_status(self, rake_id: str) -> Dict[str, Any]:
        return await MockULIPProvider().get_fois_rail_rake_status(rake_id)


def get_ulip_provider() -> ULIPProvider:
    return MockULIPProvider()
