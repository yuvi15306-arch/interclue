import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.data.question_bank_data import list_category_questions

INTERVIEW_TYPE_CATEGORIES = {
    "Technical": ["Technical"],
    "Behavioral": ["Behavioral"],
    "HR": ["HR"],
    "Situational": ["Situational"],
    "Aptitude": ["Aptitude"],
    "Mixed": ["Technical", "Behavioral", "Situational", "HR", "Aptitude"],
}


def resolve_question_category(interview_type: str, index: int = 0, requested: Optional[str] = None) -> str:
    itype = (interview_type or "Mixed").strip()
    if itype != "Mixed":
        return INTERVIEW_TYPE_CATEGORIES.get(itype, [itype])[0]
    if requested and requested in INTERVIEW_TYPE_CATEGORIES and requested != "Mixed":
        return requested
    mix = INTERVIEW_TYPE_CATEGORIES["Mixed"]
    return mix[index % len(mix)]

logger = logging.getLogger(__name__)

# Fallback question bank by role to ensure 100% reliability offline/online
FALLBACK_QUESTIONS = {
    "Frontend Developer": [
        "Explain how React's Virtual DOM works and how reconciliation improves rendering performance compared to direct DOM manipulation.",
        "What are the core differences between CSS Grid and Flexbox, and in what scenarios would you choose one over the other?",
        "How would you optimize the Core Web Vitals (LCP, FID/INP, CLS) of a heavy single-page application?",
        "Describe how you handle state management across deeply nested components in a large frontend application.",
        "Tell me about a time you had to resolve a tricky cross-browser compatibility or performance issue."
    ],
    "Backend Developer": [
        "How do you design an idempotent RESTful API, and why is idempotency crucial for payment and order processing?",
        "Explain the differences between SQL and NoSQL databases. When would you choose PostgreSQL versus MongoDB or Cassandra?",
        "How would you handle database connection pooling and query optimization under high concurrency?",
        "Describe how you implement JWT authentication with secure refresh token rotation and token revoking.",
        "Tell me about a challenging distributed system bug or race condition you encountered and how you solved it."
    ],
    "Full Stack Developer": [
        "Walk me through the architecture of a real-time notification system connecting a mobile/web client with a backend cluster.",
        "How do you approach database migrations in production without causing downtime or schema lockups?",
        "Explain the end-to-end security measures you would take to protect an application from SQL injection, XSS, and CSRF attacks.",
        "How do you decide what business logic belongs in the frontend client versus the backend API?",
        "Describe a project where you had to bridge modern frontend reactive frameworks with complex backend database transactions."
    ],
    "Python Developer": [
        "Explain Python's Global Interpreter Lock (GIL) and how it impacts CPU-bound versus I/O-bound concurrency. How does Python 3.13+ free-threading change this?",
        "What is the difference between `@classmethod`, `@staticmethod`, and instance methods in Python? Give practical examples.",
        "How does Python's garbage collection work, particularly regarding reference counting and cyclical garbage collection?",
        "How do you leverage Python generators and iterators to process large datasets without memory exhaustion?",
        "Describe your approach to profiling and optimizing a slow Python web service."
    ],
    "Java Developer": [
        "Explain the Java Memory Model (Heap, Stack, Metaspace) and how JVM Garbage Collectors (like G1 or ZGC) work.",
        "What is the difference between `synchronized`, `ReentrantLock`, and atomic variables in multi-threaded Java applications?",
        "How does Spring Boot's Dependency Injection and Inversion of Control container manage the lifecycle of beans?",
        "Explain how Java streams and lambdas work under the hood, and potential pitfalls regarding parallel streams.",
        "Tell me about a time you diagnosed a memory leak or CPU spike in a production Java application."
    ],
    "Data Analyst": [
        "How do you determine whether a correlation between two variables implies causation in an A/B testing experiment?",
        "Explain window functions in SQL (such as `ROW_NUMBER()`, `RANK()`, `LEAD()`, `LAG()`) and when you would use them.",
        "How do you handle missing, outlier, or biased data before presenting insights to executive stakeholders?",
        "Describe a data visualization dashboard you created that directly led to a business decision or operational change.",
        "Walk me through how you would calculate Customer Lifetime Value (CLV) and churn rate using transaction logs."
    ],
    "Data Scientist": [
        "How do you combat the curse of dimensionality and overfitting in high-dimensional feature spaces?",
        "Explain the trade-offs between precision and recall, and how you choose an appropriate threshold using ROC-AUC and PR curves.",
        "How do Transformer architectures and self-attention mechanisms differ from traditional recurrent networks like LSTMs?",
        "Describe how you validate machine learning models in production to detect data drift and concept drift.",
        "Tell me about a machine learning model you built from feature engineering to deployment."
    ],
    "Product Manager": [
        "How do you prioritize competing feature requests from enterprise customers, sales teams, and engineering constraints?",
        "Tell me about a product you love. What are two metrics you would track to measure its core value, and what would you improve next?",
        "How do you handle a situation where a major product release fails to meet its primary North Star metric?",
        "Describe how you conduct customer discovery interviews to identify latent unmet user needs.",
        "Walk me through how you define Minimum Viable Product (MVP) scope when time and resources are severely constrained."
    ],
    "UI/UX Designer": [
        "Walk me through your end-to-end design process from problem discovery to developer handoff.",
        "How do you balance aesthetic delight with strict accessibility (WCAG 2.1 AA) guidelines and usability standards?",
        "Describe a time when user testing results contradicted your initial design hypotheses. How did you iterate?",
        "How do you design a scalable design system with clear design tokens, component variants, and auto-layout states?",
        "How do you collaborate with engineering teams when technical constraints restrict ideal UX interactions?"
    ]
}


class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client_available = False
        self._init_client()

    def _init_client(self):
        if self.api_key and self.api_key.strip():
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.genai = genai
                self.client_available = True
                logger.info("Gemini API initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Generative AI client: {e}")
                self.client_available = False
        else:
            logger.info("GEMINI_API_KEY not configured. Using intelligent mock evaluation engine.")

    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        clean_text = text.strip()
        clean_text = re.sub(r"^```json\s*", "", clean_text)
        clean_text = re.sub(r"\s*```$", "", clean_text)
        return json.loads(clean_text)

    def _generate_json(self, prompt: str, temperature: float = 0.5) -> Optional[Dict[str, Any]]:
        if not self.client_available:
            return None
        try:
            model = self.genai.GenerativeModel(settings.GEMINI_MODEL)
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json", "temperature": temperature},
            )
            text = (response.text or "").strip()
            if not text:
                return None
            return self._parse_json_response(text)
        except Exception as e:
            logger.error(f"Gemini JSON generation failed: {e}")
            return None

    def generate_question(
        self,
        role: str,
        difficulty: str = "Junior",
        category: str = "Technical",
        interview_type: str = "Mixed",
        previous_questions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate a realistic interview question for the selected role, difficulty, and interview type.
        """
        locked_category = resolve_question_category(interview_type, requested=category)
        prev = previous_questions or []
        avoid = "\n".join(f"- {q}" for q in prev[-8:]) if prev else "None yet."

        style_guide = {
            "Technical": "Ask a deep technical, architectural, or implementation question specific to the role. No behavioral icebreakers.",
            "Behavioral": "Ask a STAR-style behavioral question about past actions, conflict, ownership, or growth. Do not ask trivia.",
            "HR": "Ask a professional HR / culture-fit question (motivation, career goals, communication, values).",
            "Situational": "Ask a hypothetical on-the-job scenario the candidate must walk through in real time.",
            "Aptitude": "Ask a quantitative reasoning, estimation, complexity, or systems-math question relevant to the role.",
        }.get(locked_category, "Ask a realistic interview question matching the interview style.")

        prompt = f"""You are an expert interviewer hiring for the position of '{role}'.
Selected Difficulty: {difficulty}
Interview Type chosen by the candidate: {interview_type}
Question category you MUST use: {locked_category}

Style rules:
{style_guide}

Do NOT repeat any of these previous questions:
{avoid}

Task:
Generate ONE original, realistic, {difficulty}-level {locked_category} interview question tailored to {role}.
The question must clearly belong to {locked_category}, not a different interview type.

Output MUST be valid JSON in this exact structure:
{{
    "question_text": "The interview question here",
    "category": "{locked_category}",
    "expected_key_points": ["Key point 1 candidate should mention", "Key point 2", "Key point 3"]
}}
"""
        parsed = self._generate_json(prompt, temperature=0.7)
        if parsed and parsed.get("question_text"):
            parsed["category"] = locked_category
            parsed.setdefault("expected_key_points", [
                f"Role-relevant reasoning for {role}",
                f"Clear {locked_category.lower()} structure",
                "Concrete examples or trade-offs",
            ])
            return parsed

        return self._fallback_question(role, locked_category, prev)

    def _fallback_question(self, role: str, category: str, previous_questions: List[str]) -> Dict[str, Any]:
        prev_set = set(previous_questions or [])
        bank = list_category_questions(category, role)
        if category == "Technical":
            bank = FALLBACK_QUESTIONS.get(role, []) + bank
        available = [q for q in bank if q not in prev_set]
        chosen = available[0] if available else (bank[0] if bank else f"Tell me how you approach {category.lower()} work as a {role}.")
        return {
            "question_text": chosen,
            "category": category,
            "expected_key_points": [
                f"Core fundamentals related to {role}",
                f"Structured {category.lower()} reasoning with real-world examples",
                "Awareness of trade-offs, edge cases, and best practices",
            ],
        }

    def analyze_resume(self, resume_text: str, role_hint: str = "Software Engineer") -> Optional[Dict[str, Any]]:
        excerpt = (resume_text or "")[:12000]
        prompt = f"""You are an ATS (Applicant Tracking System) and senior recruiter evaluating a resume for '{role_hint}'.

Resume:
\"\"\"{excerpt}\"\"\"

Score the resume for ATS keyword match, structure, quantified impact, skills density, and role fit.

Return ONLY JSON:
{{
  "ats_score": 82.5,
  "detected_role": "{role_hint}",
  "parsed_skills": ["Python", "React"],
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1"],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2"],
  "generated_questions": [
    "Resume-specific interview question 1",
    "Resume-specific interview question 2",
    "Resume-specific interview question 3",
    "Resume-specific interview question 4",
    "Resume-specific interview question 5"
  ]
}}
ats_score must be a number from 0 to 100.
generated_questions must be specific to claims in this resume, not generic.
"""
        parsed = self._generate_json(prompt, temperature=0.3)
        if not parsed:
            return None
        try:
            parsed["ats_score"] = float(parsed.get("ats_score", 70))
        except (TypeError, ValueError):
            parsed["ats_score"] = 70.0
        parsed["ats_score"] = round(min(98.0, max(20.0, parsed["ats_score"])), 1)
        parsed.setdefault("parsed_skills", [])
        parsed.setdefault("strengths", [])
        parsed.setdefault("weaknesses", [])
        parsed.setdefault("suggestions", [])
        parsed.setdefault("generated_questions", [])
        parsed.setdefault("detected_role", role_hint)
        return parsed

    def evaluate_response(
        self,
        question_text: str,
        answer_text: str,
        role: str,
        difficulty: str = "Junior",
        category: str = "Technical"
    ) -> Dict[str, Any]:
        """
        Evaluation Prompt:
        Evaluate the candidate response and return JSON containing:
        {
          technical_score,
          communication_score,
          confidence_score,
          clarity_score,
          overall_score,
          strengths,
          weaknesses,
          suggestions
        }
        """
        prompt = f"""You are a senior hiring manager and interview coach evaluating a candidate for '{role}' ({difficulty} level).

Interview Question:
"{question_text}"

Candidate's Answer:
"{answer_text}"

Task:
Evaluate the candidate response objectively and provide constructive, professional feedback.
All scores must be numerical floats from 0.0 to 10.0.

Return ONLY a JSON object with this exact schema:
{{
  "technical_score": 8.5,
  "communication_score": 8.0,
  "confidence_score": 7.5,
  "clarity_score": 8.0,
  "overall_score": 8.0,
  "strengths": [
    "Identified the core concept accurately",
    "Structured the response with clear logic"
  ],
  "weaknesses": [
    "Could have included specific metrics or real-world numbers",
    "Briefly missed addressing secondary trade-offs"
  ],
  "suggestions": [
    "Use the STAR method (Situation, Task, Action, Result) for behavioral answers",
    "Mention performance or scalability considerations to demonstrate senior depth"
  ]
}}
"""
        if self.client_available:
            try:
                model = self.genai.GenerativeModel(settings.GEMINI_MODEL)
                response = model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json", "temperature": 0.4}
                )
                text = response.text.strip()
                # Clean code fences if any
                clean_text = re.sub(r"^```json\s*", "", text)
                clean_text = re.sub(r"\s*```$", "", clean_text)
                parsed = json.loads(clean_text)

                # Validate expected keys
                required_keys = ["technical_score", "communication_score", "confidence_score", "clarity_score", "overall_score"]
                if all(k in parsed for k in required_keys):
                    return parsed
            except Exception as e:
                logger.error(f"Gemini evaluate_response API call failed: {e}")

        # Heuristic fallback evaluator
        return self._heuristic_evaluation(question_text, answer_text, role, difficulty)

    def _heuristic_evaluation(self, question: str, answer: str, role: str, difficulty: str) -> Dict[str, Any]:
        """Intelligent heuristic evaluator calculating scores from content depth, structure, and vocabulary."""
        words = answer.strip().split()
        word_count = len(words)

        if word_count < 10:
            return {
                "technical_score": 4.0,
                "communication_score": 4.5,
                "confidence_score": 4.0,
                "clarity_score": 5.0,
                "overall_score": 4.3,
                "strengths": ["Answered promptly"],
                "weaknesses": [
                    "Response is too brief to demonstrate comprehensive domain knowledge",
                    "Missing detailed explanation or concrete architectural context"
                ],
                "suggestions": [
                    "Elaborate on the 'why' behind your decision rather than just giving a short definition",
                    "Give a concrete example from a past project or coursework to illustrate your point"
                ]
            }

        # Calculate score metrics based on length, depth, and structured keywords
        clarity_bonus = 1.0 if any(punct in answer for punct in [".", ",", ";", ":"]) else 0.0
        structure_keywords = ["because", "firstly", "specifically", "for example", "trade-off", "architecture", "result", "performance"]
        matched_keywords = sum(1 for kw in structure_keywords if kw.lower() in answer.lower())

        base_score = min(8.8, 5.5 + (word_count / 35.0) + (matched_keywords * 0.4) + clarity_bonus)
        base_score = round(min(9.6, max(5.0, base_score)), 1)

        tech_score = round(min(9.5, base_score + 0.2), 1)
        comm_score = round(min(9.8, base_score + 0.4 if word_count > 40 else base_score - 0.3), 1)
        conf_score = round(min(9.2, base_score + 0.1), 1)
        clarity_score = round(min(9.5, base_score + 0.3), 1)
        overall_score = round((tech_score + comm_score + conf_score + clarity_score) / 4.0, 1)

        return {
            "technical_score": tech_score,
            "communication_score": comm_score,
            "confidence_score": conf_score,
            "clarity_score": clarity_score,
            "overall_score": overall_score,
            "strengths": [
                f"Demonstrated good conceptual grasp of {role} practices",
                "Communicated ideas with clear progression and professional terminology",
                "Highlighted practical application relevant to the question"
            ],
            "weaknesses": [
                "Could provide deeper quantitative metrics (e.g. latency, throughput, percentages)",
                "Consider discussing alternative approaches or trade-offs before settling on your chosen solution"
            ],
            "suggestions": [
                "Structure technical answers with: Concept Definition -> Architecture / Trade-offs -> Concrete Project Example",
                "Anticipate follow-up interviewer questions by proactively explaining how you would monitor or scale the solution"
            ]
        }


gemini_service = GeminiService()
