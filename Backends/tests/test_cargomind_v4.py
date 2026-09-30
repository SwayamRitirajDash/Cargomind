import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_control_tower_summary():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/control-tower/summary")
        assert response.status_code == 200
        data = response.json()
        assert "active_shipments" in data
        assert "network_health_score" in data
        assert data["active_shipments"] > 0


@pytest.mark.asyncio
async def test_health_score():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health-score")
        assert response.status_code == 200
        data = response.json()
        assert "overall_health_score" in data
        assert len(data["components"]) >= 5


@pytest.mark.asyncio
async def test_routing_route():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "origin": "Guwahati Hub",
            "origin_lat": 26.1445,
            "origin_lng": 91.7362,
            "destination": "Tezpur Sub-Hub",
            "destination_lat": 26.6528,
            "destination_lng": 92.7926,
            "vehicle_type": "reefer_truck",
            "temp_class": "chilled",
        }
        response = await ac.post("/api/routing/route", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "primary_route" in data
        assert len(data["alternatives"]) >= 2
        assert data["primary_route"]["distance_km"] > 0


@pytest.mark.asyncio
async def test_fleet_pool_and_assign():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/fleet/pool")
        assert response.status_code == 200
        vehicles = response.json()
        assert len(vehicles) >= 3

        # Test assign
        assign_resp = await ac.post("/api/fleet/assign?weight_kg=800&volume_m3=4.0&temp_class=chilled")
        assert assign_resp.status_code == 200
        assign_data = assign_resp.json()
        assert "best_match" in assign_data


@pytest.mark.asyncio
async def test_dynamic_eta_predict():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "shipment_id": "CM-2026-001842",
            "current_lat": 26.15,
            "current_lng": 91.75,
            "dest_lat": 26.65,
            "dest_lng": 92.79,
            "temp_class": "chilled",
        }
        response = await ac.post("/api/eta/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "sla_breach_predicted" in data
        assert len(data["explainable_causes"]) > 0


@pytest.mark.asyncio
async def test_consolidation_and_pricing():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        cons_resp = await ac.post("/api/consolidation/find")
        assert cons_resp.status_code == 200
        clusters = cons_resp.json()
        assert len(clusters) > 0
        assert clusters[0]["estimated_savings_inr"] > 0

        # Pricing quote
        pricing_payload = {
            "origin": "Shillong",
            "destination": "Guwahati",
            "weight_kg": 850.0,
            "volume_m3": 4.2,
            "temp_class": "chilled",
            "urgency": "normal",
            "is_mountain_terrain": True,
            "is_consolidated": True,
        }
        price_resp = await ac.post("/api/pricing/quote", json=pricing_payload)
        assert price_resp.status_code == 200
        p_data = price_resp.json()
        assert p_data["final_freight_price"] > 0
        assert p_data["consolidation_discount"] > 0


@pytest.mark.asyncio
async def test_digital_passport_and_certificate():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        pass_resp = await ac.get("/api/shipments/CM-2026-001842/passport")
        assert pass_resp.status_code == 200
        passport = pass_resp.json()
        assert passport["integrity_score"] > 80.0

        cert_resp = await ac.get("/api/shipments/CM-2026-001842/certificate")
        assert cert_resp.status_code == 200
        cert = cert_resp.json()
        assert "verifications" in cert


@pytest.mark.asyncio
async def test_crossdock_and_energy():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        cd_resp = await ac.post("/api/crossdock/optimize", json={"hub_id": "HUB-GHY-01"})
        assert cd_resp.status_code == 200
        cd_data = cd_resp.json()
        assert cd_data["total_docks_active"] >= 3

        energy_resp = await ac.get("/api/hubs/HUB-GHY-01/energy")
        assert energy_resp.status_code == 200
        energy_data = energy_resp.json()
        assert energy_data["battery_level_pct"] > 50


@pytest.mark.asyncio
async def test_river_and_carbon():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        multi_payload = {
            "origin": "Tezpur",
            "destination": "Guwahati",
            "weight_kg": 1500.0,
            "temp_class": "chilled",
        }
        multi_resp = await ac.post("/api/network/multimodal-compare", json=multi_payload)
        assert multi_resp.status_code == 200
        multi_data = multi_resp.json()
        assert len(multi_data["options"]) >= 4

        carbon_resp = await ac.get("/api/carbon/shipment/CM-2026-001842")
        assert carbon_resp.status_code == 200
        assert carbon_resp.json()["co2_abated_kg"] > 0


@pytest.mark.asyncio
async def test_disruption_and_digital_twin():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        disrupt_payload = {
            "corridor_name": "NH-27",
            "closure_duration_hours": 8.0,
            "reason": "Flash Floods",
        }
        disrupt_resp = await ac.post("/api/disruptions/simulate-v2", json=disrupt_payload)
        assert disrupt_resp.status_code == 200
        d_data = disrupt_resp.json()
        assert len(d_data["mitigations"]) >= 3

        twin_payload = {
            "rain_intensity_pct": 65.0,
            "traffic_congestion_pct": 45.0,
            "ambient_temp_c": 36.0,
            "fuel_price_per_litre": 95.0,
            "road_capacity_pct": 75.0,
            "hub_capacity_pct": 70.0,
        }
        twin_resp = await ac.post("/api/digital-twin/simulate", json=twin_payload)
        assert twin_resp.status_code == 200
        twin_data = twin_resp.json()
        assert twin_data["sla_compliance_pct"] > 0


@pytest.mark.asyncio
async def test_emergency_and_voice():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        emg_payload = {
            "incident_type": "refrigeration_failure",
            "severity": "CRITICAL",
            "location": "NH-27 KM Marker 182",
            "gps_lat": 26.2,
            "gps_lng": 92.1,
            "cargo_weight_kg": 2500.0,
            "temp_class": "chilled",
            "current_temp": 8.5,
            "target_temp": 4.0,
        }
        emg_resp = await ac.post("/api/emergency/report", json=emg_payload)
        assert emg_resp.status_code == 200
        assert "nearest_cold_hub" in emg_resp.json()

        # Voice command
        voice_payload = {
            "voice_text": "Road band hai kya karun",
            "language": "hi",
        }
        voice_resp = await ac.post("/api/voice/command", json=voice_payload)
        assert voice_resp.status_code == 200
        assert "response_text" in voice_resp.json()


@pytest.mark.asyncio
async def test_ulip_and_audit():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        ulip_resp = await ac.get("/api/integrations/ulip/status")
        assert ulip_resp.status_code == 200
        assert ulip_resp.json()["ulip_gateway_status"] == "ONLINE_AUTHENTICATED"

        audit_resp = await ac.get("/api/audit/timeline")
        assert audit_resp.status_code == 200
        assert len(audit_resp.json()) >= 6
