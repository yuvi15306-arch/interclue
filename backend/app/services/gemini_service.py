import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.question_repository import QUESTION_BANK, get_random_questions, get_questions

logger = logging.getLogger(__name__)

INTERVIEW_TYPE_CATEGORIES = {
    "Technical": ["Technical", "Programming Fundamentals", "DBMS and SQL", "DSA", "Web Development and APIs", "OS and Networks"],
    "Behavioral": ["Behavioral"],
    "HR": ["HR"],
    "Situational": ["Behavioral"],
    "Aptitude": ["Programming Fundamentals", "DSA"],
    "Project": ["Project"],
    "Mixed": ["Programming Fundamentals", "DBMS and SQL", "DSA", "Web Development and APIs", "OS and Networks", "Project", "HR", "Behavioral"],
}


def resolve_question_category(interview_type: str, index: int = 0, requested: Optional[str] = None) -> str:
    itype = (interview_type or "Mixed").strip()
    if requested and requested != "Mixed" and requested != "All":
        return requested
    if itype in INTERVIEW_TYPE_CATEGORIES and itype != "Mixed":
        cats = INTERVIEW_TYPE_CATEGORIES[itype]
        return cats[index % len(cats)]
    mix = INTERVIEW_TYPE_CATEGORIES["Mixed"]
    return mix[index % len(mix)]


# Fallback questions mapped to categories and roles
FALLBACK_QUESTIONS = {
    "Programming Fundamentals": [q["question_text"] for q in QUESTION_BANK if q["category"] == "Programming Fundamentals"][:15],
    "DBMS and SQL": [q["question_text"] for q in QUESTION_BANK if q["category"] == "DBMS and SQL"][:15],
    "DSA": [q["question_text"] for q in QUESTION_BANK if q["category"] == "DSA"][:15],
    "Web Development and APIs": [q["question_text"] for q in QUESTION_BANK if q["category"] == "Web Development and APIs"][:15],
    "OS and Networks": [q["question_text"] for q in QUESTION_BANK if q["category"] == "OS and Networks"][:15],
    "Project": [q["question_text"] for q in QUESTION_BANK if q["category"] == "Project"][:15],
    "HR": [q["question_text"] for q in QUESTION_BANK if q["category"] == "HR"][:15],
    "Behavioral": [q["question_text"] for q in QUESTION_BANK if q["category"] == "Behavioral"][:15],
    "Frontend Developer": [q["question_text"] for q in QUESTION_BANK if q["category"] in ["Web Development and APIs", "Programming Fundamentals"]][:15],
    "Backend Developer": [q["question_text"] for q in QUESTION_BANK if q["category"] in ["DBMS and SQL", "OS and Networks", "Project"]][:15],
    "Full Stack Developer": [q["question_text"] for q in QUESTION_BANK if q["category"] in ["Web Development and APIs", "DBMS and SQL", "Project"]][:15],
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
        clean_text = re.sub(r"^```(?:json)?\s*", "", clean_text)
        clean_text = re.sub(r"\s*```$", "", clean_text)
        match = re.search(r"(\{.*\})", clean_text, re.DOTALL)
        if match:
            clean_text = match.group(1)
        return json.loads(clean_text)

    def _generate_json(self, prompt: str, temperature: float = 0.5) -> Optional[Dict[str, Any]]:
        if not self.client_available:
            return None
        model_name = settings.GEMINI_MODEL
        if not model_name or "tts" in model_name.lower():
            model_name = "gemini-1.5-flash"
        try:
            model = self.genai.GenerativeModel(model_name)
            try:
                response = model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json", "temperature": temperature},
                )
            except Exception as e:
                logger.info(f"Retrying Gemini generation without response_mime_type: {e}")
                response = model.generate_content(prompt)

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
        Generate a realistic, insightful interview question for the selected role and category.
        """
        locked_category = resolve_question_category(interview_type, requested=category)
        prev = previous_questions or []
        avoid = "\n".join(f"- {q}" for q in prev[-8:]) if prev else "None yet."

        prompt = f"""You are a Principal Engineer and seasoned Technical Hiring Manager conducting an interview for the role of '{role}'.
Selected Candidate Difficulty: {difficulty}
Question Category: {locked_category}
Interview Track: {interview_type}

Instructions:
1. Generate an authentic, challenging, industry-standard interview question tailored to this role and category.
2. The question should test real-world architectural thinking, core fundamentals, and practical trade-offs.
3. Provide 3-4 specific expected key points that a senior hiring assessor would look for in an ideal answer.

Do NOT repeat any of these previous questions:
{avoid}

Output format MUST be strictly a JSON object:
{{
    "question_text": "The exact interview question",
    "category": "{category}",
    "expected_key_points": [
        "Key point 1 candidate should address",
        "Key point 2 regarding mechanisms or trade-offs",
        "Key point 3 demonstrating practical experience"
    ]
}}
"""
        parsed = self._generate_json(prompt, temperature=0.6)
        if parsed and parsed.get("question_text") and parsed.get("expected_key_points"):
            parsed["category"] = category
            return parsed

        # Repository-backed fallback generation
        prev_set = set(prev)
        pool = [
            q for q in QUESTION_BANK
            if (locked_category.lower() in q["category"].lower() or q["category"].lower() in locked_category.lower())
            and q["question_text"] not in prev_set
        ]
        if not pool:
            pool = [q for q in QUESTION_BANK if q["question_text"] not in prev_set]
        if not pool:
            pool = QUESTION_BANK

        selected = pool[0] if pool else QUESTION_BANK[0]
        return {
            "question_text": selected["question_text"],
            "category": category,
            "expected_key_points": selected.get("expected_key_points", [
                f"Core conceptual foundations of {role}",
                "Structured architectural reasoning and edge-case handling",
                "Awareness of performance trade-offs"
            ])
        }

    def evaluate_response(
        self,
        question_text: str,
        answer_text: str,
        role: str,
        difficulty: str = "Junior",
        category: str = "Technical"
    ) -> Dict[str, Any]:
        """
        Comprehensive Evaluation Prompt:
        Strictly grades candidate answer for accuracy, depth, and communication.
        Never hallucinates praise or high scores for incorrect, evasive, or off-topic responses.
        """
        prompt = f"""You are a Principal Technical Interviewer and strict Hiring Assessor evaluating a candidate for the position of '{role}' ({difficulty} level).

Interview Question:
"{question_text}"
Category: {category}

Candidate's Answer:
\"\"\"{answer_text}\"\"\"

CRITICAL EVALUATION MANDATE:
1. TRUTHFULNESS & ACCURACY FIRST:
   - Carefully verify if the candidate's answer is correct, partially correct, incorrect, or irrelevant.
   - If the candidate's answer is FACTUALLY INCORRECT, GIBBERISH, AN ADMISSION OF NOT KNOWING (e.g. "I don't know", "skip"), OR OFF-TOPIC:
     * YOU MUST NOT GIVE RANDOM HIGH MARKS OR HALLUCINATED PRAISE.
     * Set `is_correct` to false.
     * Set `accuracy_level` to "Incorrect" (or "Irrelevant" if off-topic).
     * Set `technical_score` strictly between 1.0 and 3.5.
     * Set `overall_score` strictly between 1.0 and 3.5.
     * `strengths` must NOT claim they understood the topic! State only: ["Attempted to answer the prompt"] or leave empty.
     * `weaknesses` MUST explicitly highlight the exact technical misconceptions, factual errors, and missed fundamentals.
     * `corrections_and_misconceptions` MUST provide explicit factual corrections for the candidate's errors.
     * `ideal_answer` MUST provide the correct model answer that should have been given.

   - If the candidate's answer is PARTIALLY CORRECT:
     * Set `is_correct` to false.
     * Set `accuracy_level` to "Partially Correct".
     * Set `technical_score` between 4.0 and 6.5.
     * In `strengths`, mention what was factually accurate.
     * In `weaknesses`, specify the missing pieces, edge cases, or misconceptions.
     * Provide `corrections_and_misconceptions` and `ideal_answer`.

   - If the candidate's answer is CORRECT AND ACCURATE:
     * Set `is_correct` to true.
     * Set `accuracy_level` to "Accurate".
     * Set `technical_score` between 7.0 and 10.0 based on depth, trade-off analysis, and clarity.
     * Highlight key strengths, minor areas to polish, and provide `ideal_answer`.

2. EVALUATION METRICS (0.0 to 10.0 floats):
   - `technical_score`: Factual accuracy, depth, algorithm/architecture correctness.
   - `communication_score`: Clarity of expression, professional terminology, structure.
   - `confidence_score`: Definitiveness, avoidance of excessive hedging.
   - `clarity_score`: Directness in addressing the prompt.
   - `overall_score`: Weighted holistic rating.

Return ONLY a JSON object with this exact schema:
{{
  "is_correct": true,
  "accuracy_level": "Accurate",
  "technical_score": 8.5,
  "communication_score": 8.0,
  "confidence_score": 7.5,
  "clarity_score": 8.0,
  "overall_score": 8.0,
  "feedback_summary": "Concise 1-2 sentence executive summary of the response.",
  "strengths": [
    "Specific technical accuracy observed in the answer"
  ],
  "weaknesses": [
    "Specific technical gap, error, or missing trade-off"
  ],
  "corrections_and_misconceptions": [
    "Clarification of any false assumptions or conceptual errors"
  ],
  "ideal_answer": "Complete, correct reference answer demonstrating how a top engineer would answer.",
  "suggestions": [
    "Actionable tip to improve future interview performance"
  ]
}}
"""
        parsed = self._generate_json(prompt, temperature=0.2)
        if parsed:
            required_keys = ["technical_score", "communication_score", "confidence_score", "clarity_score", "overall_score"]
            if all(k in parsed for k in required_keys):
                for k in required_keys:
                    parsed[k] = float(min(10.0, max(0.0, parsed[k])))
                return parsed

        # Intelligent deterministic heuristic evaluator
        return self._heuristic_evaluation(question_text, answer_text, role, difficulty, category)

    def _heuristic_evaluation(
        self,
        question: str,
        answer: str,
        role: str,
        difficulty: str,
        category: str = "Technical"
    ) -> Dict[str, Any]:
        """
        Deterministic heuristic evaluator that detects wrong, evasive, or off-topic answers
        and awards honest low scores with constructive corrections instead of random praise.
        """
        clean_answer = answer.strip().lower()
        words = clean_answer.split()
        word_count = len(words)

        # 1. Detect evasive / admission of ignorance
        evasive_phrases = [
            "don't know", "dont know", "no idea", "not sure", "skip", "pass", "idk",
            "have no clue", "cannot answer", "can't answer", "never heard", "no clue"
        ]
        is_evasive = any(p in clean_answer for p in evasive_phrases)

        # 2. Extract core question tokens (excluding common stopwords)
        stopwords = {
            "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "of", "with",
            "explain", "what", "how", "why", "when", "is", "are", "difference", "between",
            "would", "you", "does", "do", "tell", "about", "describe", "your", "can", "could",
            "this", "that", "these", "those", "have", "has", "from"
        }
        q_tokens = [w.strip("?,.:;\"'") for w in question.lower().split() if len(w) > 3 and w not in stopwords]
        overlap_count = sum(1 for token in q_tokens if token in clean_answer)
        overlap_ratio = overlap_count / max(1, len(q_tokens))

        # Look up ideal reference from question repository
        matching_q = None
        for q in QUESTION_BANK:
            if q["question_text"].strip().lower() == question.strip().lower():
                matching_q = q
                break

        ideal_ref = matching_q.get("ideal_answer") if matching_q else f"A structured response covering the core principles, architecture, and practical trade-offs of {question}."
        expected_points = matching_q.get("expected_key_points", [f"Core fundamentals of {category}", "Real-world trade-offs"]) if matching_q else []

        # Extract concept tokens from ideal reference and expected key points
        concept_tokens = []
        if matching_q:
            combined_ref = (matching_q.get("ideal_answer") or "") + " " + " ".join(matching_q.get("expected_key_points") or [])
            concept_tokens = list(set([
                w.strip("?,.:;\"'()").lower()
                for w in combined_ref.split()
                if len(w) > 3 and w.lower() not in stopwords and w.lower() not in q_tokens
            ]))

        concept_overlap = sum(1 for token in concept_tokens if token in clean_answer) if concept_tokens else overlap_count
        concept_ratio = (concept_overlap / max(1, len(concept_tokens))) if concept_tokens else overlap_ratio

        # Case A: Evasive / Empty / Extremely brief (< 6 words)
        if is_evasive or word_count < 6:
            return {
                "is_correct": False,
                "accuracy_level": "Incorrect",
                "technical_score": 1.5,
                "communication_score": 3.0,
                "confidence_score": 2.0,
                "clarity_score": 3.0,
                "overall_score": 2.1,
                "feedback_summary": "The candidate was unable to provide a substantive technical answer to the question asked.",
                "strengths": ["Answered promptly without stalling."],
                "weaknesses": [
                    "Did not provide an answer demonstrating understanding of the required concept.",
                    f"Missed core principles: {', '.join(expected_points[:2]) if expected_points else 'domain fundamentals'}."
                ],
                "corrections_and_misconceptions": [
                    "Admission of lack of knowledge or answer was too brief to evaluate domain competency."
                ],
                "ideal_answer": ideal_ref,
                "suggestions": [
                    "Review this topic's fundamentals before your next mock session.",
                    "If unsure during an interview, try reasoning aloud from first principles rather than passing."
                ]
            }

        # Case B: Factually incorrect, off-topic, or low concept accuracy (< 20% domain concept match or short weak answer)
        if category not in ["HR", "Behavioral"] and (concept_ratio < 0.20 or overlap_count == 0 or (word_count < 30 and concept_ratio < 0.30)):
            return {
                "is_correct": False,
                "accuracy_level": "Incorrect",
                "technical_score": 2.2,
                "communication_score": 3.8,
                "confidence_score": 3.0,
                "clarity_score": 3.2,
                "overall_score": 2.8,
                "feedback_summary": "The answer contains significant conceptual inaccuracies or fails to demonstrate required technical knowledge.",
                "strengths": ["Communicated in full sentences."],
                "weaknesses": [
                    "The response contains factual errors or misses the foundational mechanisms of the topic.",
                    f"Failed to address critical concepts: {', '.join(expected_points[:3]) if expected_points else 'core mechanisms'}."
                ],
                "corrections_and_misconceptions": [
                    f"The candidate's explanation does not reflect correct domain knowledge for '{question}'. Review the model answer below for the verified engineering explanation."
                ],
                "ideal_answer": ideal_ref,
                "suggestions": [
                    "Pause before answering to verify foundational definitions rather than guessing.",
                    "Focus on the actual mechanisms, data structures, and architectural trade-offs."
                ]
            }

        # Case C: Partially correct (some overlap, moderate depth)
        if concept_ratio < 0.35 or word_count < 35:
            return {
                "is_correct": False,
                "accuracy_level": "Partially Correct",
                "technical_score": 4.5,
                "communication_score": 5.5,
                "confidence_score": 5.0,
                "clarity_score": 5.2,
                "overall_score": 4.8,
                "feedback_summary": "The answer touched upon some relevant keywords but lacked technical depth and thoroughness.",
                "strengths": [
                    "Identified some relevant concepts related to the question.",
                    "Maintained understandable communication."
                ],
                "weaknesses": [
                    "Answer is relatively brief and misses deeper architectural or algorithmic considerations.",
                    f"Could elaborate on: {', '.join(expected_points[:2]) if expected_points else 'trade-offs and edge cases'}."
                ],
                "corrections_and_misconceptions": [
                    "Ensure you substantiate conceptual definitions with concrete mechanisms and operational details."
                ],
                "ideal_answer": ideal_ref,
                "suggestions": [
                    "Structure your answers into 3 parts: Concept Definition -> How it Works Under the Hood -> Concrete Real-World Example."
                ]
            }

        # Case D: Substantive and accurate answer
        clarity_bonus = 0.5 if any(p in answer for p in [".", ",", ";"]) else 0.0
        structure_kws = ["because", "specifically", "for example", "trade-off", "performance", "architecture", "result", "in order to"]
        matched_struct = sum(1 for kw in structure_kws if kw in clean_answer)
        depth_score = min(9.2, 6.5 + (word_count / 40.0) + (matched_struct * 0.3) + clarity_bonus)

        tech_score = round(min(9.5, depth_score), 1)
        comm_score = round(min(9.6, depth_score + 0.2), 1)
        conf_score = round(min(9.2, depth_score - 0.1), 1)
        clarity_score = round(min(9.5, depth_score + 0.1), 1)
        overall = round((tech_score + comm_score + conf_score + clarity_score) / 4.0, 1)

        return {
            "is_correct": True,
            "accuracy_level": "Accurate",
            "technical_score": tech_score,
            "communication_score": comm_score,
            "confidence_score": conf_score,
            "clarity_score": clarity_score,
            "overall_score": overall,
            "feedback_summary": f"Solid, knowledgeable response demonstrating clear understanding of {category}.",
            "strengths": [
                "Demonstrated accurate conceptual understanding of the requested topic.",
                "Used appropriate technical terminology and structured explanation.",
                "Connected concepts to practical implementation considerations."
            ],
            "weaknesses": [
                "Could provide deeper quantitative metrics (e.g. latency, throughput, scale limits).",
                "Consider discussing alternative approaches or trade-offs before settling on your chosen solution."
            ],
            "corrections_and_misconceptions": [],
            "ideal_answer": ideal_ref,
            "suggestions": [
                "Highlight scalability trade-offs to push your answer into the Senior/Principal hire rating.",
                "Anticipate follow-up questions by proactively mentioning how you would monitor or test the solution."
            ]
        }

    def evaluate_resume_ats(self, resume_text: str, target_role: str = "Software Engineer") -> Dict[str, Any]:
        """
        State-of-the-art ATS Resume Evaluator using Gemini 1.5.
        Extracts skills, identifies missing critical keywords, computes an honest ATS score,
        and generates targeted interview questions based on the candidate's real experience.
        """
        prompt = f"""You are a Principal Technical Recruiter and Applicant Tracking System (ATS) Parsing Engine.
Analyze the following resume against industry hiring standards for the target role: '{target_role}'.

Resume Text:
\"\"\"{resume_text[:12000]}\"\"\"

Task:
Perform a comprehensive ATS parsing and candidate qualification analysis:
1. `ats_score` (0.0 to 100.0 float): Honest compatibility score based on standard ATS parsers (Workday, Greenhouse, Lever).
   - Penalize missing standard headings, lack of numbers/metrics, low keyword density, or confusing formatting.
   - Reward clear experience progression, strong action verbs, and quantifiable impact (e.g., 'reduced latency by 35%').
2. `parsed_skills`: List of detected programming languages, frameworks, cloud tools, databases, and methodologies.
3. `missing_critical_keywords`: Crucial high-demand technologies or concepts for '{target_role}' that are completely missing from the resume.
4. `strengths`: 3 concrete aspects that make this resume competitive.
5. `weaknesses`: 3 specific ATS flaws, formatting risks, or weak phrasing.
6. `suggestions`: 3 actionable improvements.
7. `generated_questions`: 5 highly specific interview questions rooted directly in the candidate's actual projects and technologies.

Return ONLY a valid JSON object matching this schema:
{{
  "ats_score": 82.5,
  "formatting_score": 85.0,
  "keyword_score": 80.0,
  "impact_score": 78.0,
  "candidate_name": "Extracted Name or null",
  "contact_email": "Extracted email or null",
  "detected_role": "{target_role}",
  "parsed_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"],
  "missing_critical_keywords": ["Kubernetes", "CI/CD", "AWS Lambda"],
  "strengths": [
    "Clear work experience and measurable metrics included",
    "Strong technical skills match for backend development"
  ],
  "weaknesses": [
    "Lacks cloud infrastructure certifications",
    "Some bullet points lack quantifiable business metrics"
  ],
  "suggestions": [
    "Add numbers and percentages to every achievement bullet point",
    "Group technical skills into Languages, Frameworks, Databases, and Cloud"
  ],
  "generated_questions": [
    "Walk me through the system architecture of the FastAPI project mentioned in your experience.",
    "How did you implement Redis caching to achieve the latency reduction stated on your resume?",
    "Tell me about a challenging distributed bug you solved during your software engineering work.",
    "How do you design database schemas to maintain performance under high concurrent writes?",
    "If you were rebuilding the primary project on your resume today, what technical decisions would you change?"
  ]
}}
"""
        parsed = self._generate_json(prompt, temperature=0.3)
        if parsed and "ats_score" in parsed and "parsed_skills" in parsed:
            try:
                parsed["ats_score"] = float(parsed["ats_score"])
            except (TypeError, ValueError):
                parsed["ats_score"] = 75.0
            parsed["ats_score"] = float(min(100.0, max(20.0, parsed["ats_score"])))
            return parsed

        # Fallback to enhanced heuristic evaluation
        from app.services.resume_service import resume_service
        return resume_service.heuristic_analyze(resume_text, target_role)

    def analyze_resume(self, resume_text: str, role_hint: str = "Software Engineer") -> Optional[Dict[str, Any]]:
        """Backwards-compatible alias for resume analysis."""
        return self.evaluate_resume_ats(resume_text, target_role=role_hint)


gemini_service = GeminiService()
