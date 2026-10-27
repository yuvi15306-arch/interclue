import pytest


def test_get_subscription_plans(client):
    res = client.get("/subscriptions/plans")
    assert res.status_code == 200
    plans = res.json()
    assert len(plans) >= 2
    plan_ids = [p["id"] for p in plans]
    assert "free" in plan_ids
    assert "pro_monthly" in plan_ids


def test_subscription_status(client, auth_headers):
    res = client.get("/subscriptions/status", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "plan_tier" in data
    assert "daily_interviews_used" in data
    assert "daily_interviews_limit" in data


def test_upgrade_subscription(client, auth_headers):
    upgrade_payload = {
        "plan_tier": "pro_monthly",
        "provider": "google_play",
        "purchase_token": "test_purchase_token_12345"
    }
    res = client.post("/subscriptions/upgrade", json=upgrade_payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["plan_tier"] == "pro_monthly"
    assert "expires_at" in data

    # Verify status changed to pro
    status_res = client.get("/subscriptions/status", headers=auth_headers)
    assert status_res.status_code == 200
    assert status_res.json()["plan_tier"] == "pro_monthly"
    assert status_res.json()["can_use_voice"] is True
    assert status_res.json()["can_use_resume"] is True
