import io
import re
import logging
from typing import Dict, Any, List, Optional
import pypdf

logger = logging.getLogger(__name__)

COMMON_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "React Native", "Node.js", "FastAPI",
    "Django", "Flask", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker",
    "Kubernetes", "AWS", "GCP", "Azure", "Git", "GitHub", "CI/CD", "GraphQL", "REST API",
    "Java", "Spring Boot", "C++", "C#", "Go", "Rust", "HTML5", "CSS3", "Tailwind CSS",
    "Next.js", "Redux", "Zustand", "Linux", "Terraform", "Pandas", "NumPy", "Scikit-Learn",
    "PyTorch", "TensorFlow", "Figma", "Jira", "Agile", "Microservices", "Kafka", "RabbitMQ",
    "Elasticsearch", "Nginx", "Linux", "CI/CD", "GitHub Actions", "pytest", "Jest"
]

ROLE_KEYWORD_REQUIREMENTS = {
    "Backend Developer": ["FastAPI", "PostgreSQL", "Redis", "Docker", "REST API", "Microservices", "CI/CD", "SQL", "AWS"],
    "Frontend Developer": ["React", "TypeScript", "JavaScript", "CSS3", "HTML5", "Redux", "Next.js", "Tailwind CSS", "Git"],
    "Full Stack Developer": ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "REST API", "Git", "AWS", "Redis"],
    "Python Developer": ["Python", "FastAPI", "Django", "SQL", "Docker", "Git", "pytest", "PostgreSQL", "Redis"],
    "Java Developer": ["Java", "Spring Boot", "SQL", "Microservices", "Docker", "Maven", "PostgreSQL", "Git"],
}


class ResumeService:
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        try:
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            return ""

    def analyze_resume_text(self, text: str, role_hint: str = "Software Engineer") -> Dict[str, Any]:
        """
        Analyze resume text using Gemini 1.5 with deep ATS recruitment intelligence.
        Falls back to comprehensive heuristic analysis if Gemini API is offline.
        """
        try:
            from app.services.gemini_service import gemini_service
            if gemini_service.client_available:
                gemini_res = gemini_service.evaluate_resume_ats(text, role_hint)
                if gemini_res and isinstance(gemini_res, dict) and gemini_res.get("ats_score"):
                    return gemini_res
        except Exception as e:
            logger.warning(f"Gemini resume evaluation failed, using heuristic: {e}")

        return self.heuristic_analyze(text, role_hint)

    def _heuristic_analyze(self, text: str, role_hint: str = "Software Engineer") -> Dict[str, Any]:
        return self.heuristic_analyze(text, role_hint)

    def heuristic_analyze(self, text: str, role_hint: str = "Software Engineer") -> Dict[str, Any]:
        """Deep, deterministic heuristic ATS analysis engine."""
        text_lower = text.lower()

        # 1. Detect candidate email and name
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
        contact_email = email_match.group(0) if email_match else None

        lines = [line.strip() for line in text.split("\n") if line.strip()]
        candidate_name = None
        for line in lines[:3]:
            # Name heuristics: 2-3 words, no symbols
            if len(line.split()) in [2, 3] and "@" not in line and not any(char.isdigit() for char in line):
                candidate_name = line
                break

        # 2. Extract detected skills
        detected_skills = []
        for skill in COMMON_SKILLS:
            pattern = r"\b" + re.escape(skill.lower()) + r"\b"
            if re.search(pattern, text_lower):
                detected_skills.append(skill)

        # 3. Detect missing critical keywords based on role
        expected_role_skills = ROLE_KEYWORD_REQUIREMENTS.get(role_hint, ROLE_KEYWORD_REQUIREMENTS["Full Stack Developer"])
        missing_critical = [s for s in expected_role_skills if s.lower() not in text_lower]

        # 4. Standard section presence checks
        has_experience = any(k in text_lower for k in ["experience", "employment", "work history", "work experience"])
        has_education = any(k in text_lower for k in ["education", "university", "college", "degree", "bachelor", "master", "b.s.", "b.tech"])
        has_skills = any(k in text_lower for k in ["skills", "technologies", "tech stack", "technical proficiencies"])
        has_projects = any(k in text_lower for k in ["projects", "personal projects", "portfolio", "key projects"])
        has_metrics = bool(re.search(r"\b(\d+[%kK]|\$\d+|\d+\+?\s*(users|clients|ms|requests|latency|queries|rps))\b", text))
        has_links = "github.com" in text_lower or "linkedin.com" in text_lower

        # 5. Calculate ATS Score breakdown
        formatting_score = 70.0
        keyword_score = 50.0
        impact_score = 50.0

        strengths = []
        weaknesses = []
        suggestions = []

        if has_experience:
            formatting_score += 15.0
            strengths.append("Standard 'Experience' section clearly organized chronologically")
        else:
            weaknesses.append("Missing distinct 'Experience' section heading for ATS parsers")
            suggestions.append("Add a designated 'Work Experience' section with dates and job titles")

        if has_education:
            formatting_score += 10.0
            strengths.append("Academic credentials and educational background recognized")
        else:
            weaknesses.append("Education section not clearly identified by ATS parser")

        if has_skills:
            formatting_score += 5.0

        # Keyword density scoring
        skill_count = len(detected_skills)
        if skill_count >= 8:
            keyword_score = min(96.0, 70.0 + (skill_count * 2.5))
            strengths.append(f"High ATS keyword density ({skill_count} relevant engineering technologies detected)")
        elif skill_count >= 4:
            keyword_score = 65.0
        else:
            keyword_score = 40.0
            weaknesses.append("Low keyword density: fewer than 5 standard industry skills found")
            suggestions.append(f"Incorporate missing core skills for {role_hint}: {', '.join(missing_critical[:4])}")

        # Impact and metrics scoring
        if has_metrics:
            impact_score = 85.0
            strengths.append("Quantifiable metrics and business impact found (percentages, scale, latency)")
        else:
            impact_score = 45.0
            weaknesses.append("Lacks quantifiable impact metrics (e.g., 'improved performance by 35%')")
            suggestions.append("Structure each bullet point using the Google XYZ formula: 'Accomplished [X] measured by [Y] by doing [Z]'")

        if has_links:
            formatting_score = min(98.0, formatting_score + 5.0)
            strengths.append("Contains professional web presence links (GitHub / LinkedIn)")
        else:
            suggestions.append("Include clickable GitHub and LinkedIn profile links in the header")

        # Weighted holistic ATS score
        ats_score = (formatting_score * 0.3) + (keyword_score * 0.4) + (impact_score * 0.3)
        ats_score = round(min(98.0, max(30.0, ats_score)), 1)

        # 6. Generate tailored interview questions based directly on the resume
        generated_questions = self._generate_resume_questions(detected_skills, text, role_hint)

        return {
            "ats_score": ats_score,
            "formatting_score": round(formatting_score, 1),
            "keyword_score": round(keyword_score, 1),
            "impact_score": round(impact_score, 1),
            "candidate_name": candidate_name,
            "contact_email": contact_email,
            "detected_role": role_hint,
            "parsed_skills": detected_skills[:14],
            "missing_critical_keywords": missing_critical[:5],
            "strengths": strengths,
            "weaknesses": weaknesses,
            "suggestions": suggestions,
            "generated_questions": generated_questions
        }

    def _generate_resume_questions(self, skills: List[str], resume_text: str, role: str) -> List[str]:
        skill_sample = ", ".join(skills[:3]) if skills else "your primary tech stack"
        return [
            f"I see you listed {skill_sample} on your resume. Could you describe the most complex technical challenge you solved using these tools?",
            f"Looking at your recent project experience, how did you ensure test coverage, code reliability, and CI/CD automation?",
            f"Can you walk me through the system architecture of the most significant application mentioned in your work history?",
            f"How have you handled performance optimization and scalability bottlenecks in your past {role} work?",
            f"If you were to rebuild the core project listed on your resume from scratch today, what technical decisions would you change and why?"
        ]


resume_service = ResumeService()
