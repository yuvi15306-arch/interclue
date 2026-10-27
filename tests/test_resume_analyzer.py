import pytest


def test_resume_analysis(client, auth_headers):
    sample_resume = """
    Jane Doe | Full Stack Engineer
    Email: jane.doe@example.com | linkedin.com/in/janedoe | github.com/janedoe
    
    EXPERIENCE:
    Senior Software Engineer at FinTech Inc (2022 - Present)
    - Architected real-time payment gateway processing 50k transactions/day using FastAPI, Redis, and PostgreSQL.
    - Improved API response times by 40% through redis caching and database indexing.
    - Led a team of 4 engineers using Agile and Git CI/CD workflows.

    SKILLS:
    Python, JavaScript, TypeScript, React, React Native, FastAPI, PostgreSQL, Docker, AWS, Redis.

    EDUCATION:
    B.S. in Computer Science - Tech University (2018 - 2022)
    """

    res = client.post(
        "/resume/analyze",
        data={"resume_text": sample_resume, "role": "Full Stack Developer"},
        headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["ats_score"] > 60.0
    assert "Python" in data["parsed_skills"]
    assert len(data["strengths"]) > 0
    assert len(data["generated_questions"]) >= 3


def test_get_latest_resume(client, auth_headers):
    # 1. Before uploading, /resume/latest returns 404
    empty_res = client.get("/resume/latest", headers=auth_headers)
    assert empty_res.status_code == 404

    # 2. Upload / analyze a resume
    sample = "Alex Candidate\nSkills: React, FastAPI, PostgreSQL, AWS\nExperience: 3 years building web apps."
    client.post(
        "/resume/analyze",
        data={"resume_text": sample, "role": "Full Stack Developer"},
        headers=auth_headers
    )

    # 3. Now /resume/latest returns 200 with the analyzed report
    res = client.get("/resume/latest", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["ats_score"] > 0
    assert "FastAPI" in data["parsed_skills"]
