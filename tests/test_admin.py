import pytest


def test_admin_metrics(client, admin_headers):
    res = client.get("/admin/metrics", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_users" in data
    assert "active_subscriptions" in data
    assert "total_interviews_conducted" in data
    assert len(data["system_metrics"]) >= 4


def test_admin_users_list(client, admin_headers):
    res = client.get("/admin/users", headers=admin_headers)
    assert res.status_code == 200
    users = res.json()
    assert isinstance(users, list)
    assert len(users) >= 1


def test_regular_user_cannot_access_admin(client, auth_headers):
    # Regular student token should get 403 Forbidden
    res = client.get("/admin/metrics", headers=auth_headers)
    assert res.status_code == 403


def test_toggle_user_status(client, admin_headers):
    # Fetch first user
    users = client.get("/admin/users", headers=admin_headers).json()
    target_id = users[0]["id"]

    res = client.put(f"/admin/users/{target_id}/toggle-status", headers=admin_headers)
    assert res.status_code == 200
    assert "active status" in res.json()["message"]
