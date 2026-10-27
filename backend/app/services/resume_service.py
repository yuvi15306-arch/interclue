import io
import re
import logging
from typing import Dict, Any, List
import pypdf
from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

COMMON_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "React Native", "Node.js", "FastAPI",
    "Django", "Flask", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker",
    "Kubernetes", "AWS", "GCP", "Azure", "Git", "GitHub", "CI/CD", "GraphQL", "REST API",
    "Java", "Spring Boot", "C++", "C#", "Go", "Rust", "HTML5", "CSS3", "Tailwind CSS",
    "Next.js", "Redux", "Zustand", "Linux", "Terraform", "Pandas", "NumPy", "Scikit-Learn",
    "PyTorch", "TensorFlow", "Figma", "Jira", "Agile", "Microservices"
]


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
        text_lower = text.lower()

        # 1. Detect candidate email
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
        contact_email = email_match.group(0) if email_match else None

        # 2. Extract detected skills
        detected_skills = []
        for skill in COMMON_SKILLS:
            pattern = r"\b" + re.escape(skill.lower()) + r"\b"
            if re.search(pattern, text_lower):
                detected_skills.append(skill)

        # 3. Detect standard sections
        has_experience = any(k in text_lower for k in ["experience", "employment", "work history"])
        has_education = any(k in text_lower for k in ["education", "university", "college", "degree", "bachelor", "master"])
        has_skills = any(k in text_lower for k in ["skills", "technologies", "tech stack", "competencies"])
        has_projects = any(k in text_lower for k in ["projects", "personal projects", "portfolio"])
        has_metrics = bool(re.search(r"\b(\d+[%kK]|\$\d+|\d+\+?\s*(users|clients|ms|requests|latency))\b", text))
        has_github_or_linkedin = "github.com" in text_lower or "linkedin.com" in text_lower

        # 4. Calculate ATS Score (0 - 100)
        ats_score = 50.0  # base
        strengths = []
        weaknesses = []
        suggestions = []

        if has_experience:
            ats_score += 10.0
            strengths.append("Clear work experience and employment timeline included")
        else:
            ats_score -= 8.0
            weaknesses.append("Missing distinct 'Experience' section heading")
            suggestions.append("Add a designated Experience section formatted chronologically")

        if has_education:
            ats_score += 8.0
            strengths.append("Verified academic background and degree credentials")
        else:
            weaknesses.append("Education section not explicitly identified")

        if has_skills and len(detected_skills) >= 5:
            ats_score += 12.0
            strengths.append(f"Strong technical skills section with {len(detected_skills)} high-demand keywords")
        else:
            ats_score -= 6.0
            weaknesses.append("Skill density is low or lacks keyword variety")
            suggestions.append("Group skills into categories (e.g. Languages, Frameworks, Cloud, Databases)")

        if has_projects:
            ats_score += 8.0
            strengths.append("Showcases hands-on projects demonstrating practical implementation")

        if has_metrics:
            ats_score += 8.0
            strengths.append("Quantifiable business metrics and impact percentages found")
        else:
            weaknesses.append("Lacks quantifiable impact metrics (e.g., 'improved performance by 35%')")
            suggestions.append("Incorporate numbers, percentages, and performance results in each bullet point")

        if has_github_or_linkedin:
            ats_score += 4.0
            strengths.append("Contains professional web presence links (GitHub / LinkedIn)")
        else:
            suggestions.append("Include active GitHub and LinkedIn profile links in header")

        ats_score = round(min(98.0, max(38.0, ats_score)), 1)

        # 5. Generate tailored questions based directly on the resume
        generated_questions = self._generate_resume_questions(detected_skills, text, role_hint)

        return {
            "ats_score": ats_score,
            "contact_email": contact_email,
            "detected_role": role_hint,
            "parsed_skills": detected_skills[:12],
            "strengths": strengths,
            "weaknesses": weaknesses,
            "suggestions": suggestions,
            "generated_questions": generated_questions
        }

    def _generate_resume_questions(self, skills: List[str], resume_text: str, role: str) -> List[str]:
        skill_sample = ", ".join(skills[:4]) if skills else "modern architecture"
        return [
            f"I see you listed {skill_sample} on your resume. Could you describe the most complex technical challenge you solved using these tools?",
            "Looking at your recent project experience, how did you ensure test coverage, code reliability, and CI/CD automation?",
            "Can you walk me through the system architecture of the most significant application mentioned in your work history?",
            f"How have you handled performance optimization and scalability bottlenecks in your past {role} work?",
            "If you were to rebuild the core project listed on your resume from scratch today, what technical decisions would you change and why?"
        ]


resume_service = ResumeService()
