import pytest


def test_dashboard_and_analytics(client, auth_headers):
    # Test dashboard endpoint
    dash_res = client.get("/dashboard", headers=auth_headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "total_interviews" in dash_data
    assert "average_score" in dash_data
    assert "weekly_progress" in dash_data
    assert "strength_areas" in dash_data
    assert "improvement_areas" in dash_data
    assert len(dash_data["weekly_progress"]) == 7

    # Test analytics endpoint
    analytics_res = client.get("/analytics", headers=auth_headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert "metrics_radar" in analytics_data
    assert "strong_topics" in analytics_data
    assert "weak_topics" in analytics_data
    assert len(analytics_data["strong_topics"]) > 0
