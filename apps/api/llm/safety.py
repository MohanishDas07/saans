"""
Safety Layer for SAANS Assistant.
Enforces non-negotiable safety rules in code:
1. Static Medical Red-Line Triage Intercept (acute respiratory/cardiac distress triggers fixed static message, NO LLM call).
2. Prompt Injection Defense (treats user inputs as untrusted data, strips instruction-like injection phrases).
"""

import re

# ---------------------------------------------------------------------------
# Acute Medical Distress Symptoms (Immediate Red-Line Intercept)
# ---------------------------------------------------------------------------

ACUTE_SYMPTOM_PATTERNS = [
    r"\bchest\s+pain\b",
    r"\bshortness\s+of\s+breath\b",
    r"\bsevere\s+breathlessness\b",
    r"\bwheezing\b",
    r"\bwheeze\b",
    r"\bbreathing\s+difficulty\b",
    r"\bcan\'?t\s+breathe\b",
    r"\bstruggling\s+to\s+breathe\b",
    r"\bblue\s+lips\b",
    r"\bcyanosis\b",
    r"\basthma\s+attack\b",
    r"\bchoking\b",
    r"सीने\s+में\s+(बहुत\s+)?(तेज\s+)?दर्द",
    r"सांस\s+फूल",
    r"घरघराहट",
    r"दम\s+घुट",
    r"छातीत\s+(तीव्र\s+)?(वेदना|दुख)",
    r"श्वास\s+घेण्यास\s+त्रास",
    r"धाप\s+लाग",
]

STATIC_MEDICAL_MESSAGES = {
    "en": (
        "EMERGENCY MEDICAL WARNING: Saans is an air quality decision assistant and CANNOT provide "
        "medical diagnosis or clinical treatment. The symptoms you reported (such as chest pain, acute breathlessness, "
        "or child wheezing) require immediate professional medical intervention. "
        "Please dial 112 / 102 or proceed immediately to the nearest hospital emergency room."
    ),
    "hi": (
        "आपातकालीन चिकित्सा चेतावनी: साँस (Saans) केवल एक वायु गुणवत्ता और दिनचर्या सहायता प्रणाली है। यह कोई चिकित्सीय "
        "निदान या इलाज प्रदान नहीं कर सकती। आपके द्वारा बताए गए लक्षण (जैसे सीने में दर्द, तेज सांस फूलना, या बच्चे की घरघराहट) "
        "गंभीर हो सकते हैं। कृपया तुरंत आपातकालीन नंबर (112 या 102) पर कॉल करें या नजदीकी अस्पताल के आपातकालीन कक्ष (Emergency) में जाएं।"
    ),
    "mr": (
        "तातडीची वैद्यकीय सूचना: साँस (Saans) ही केवळ हवेच्या गुणवत्तेची माहिती देणारी प्रणाली आहे. ती वैद्यकीय निदान किंवा औषधोपचार "
        "करू शकत नाही. आपण नमूद केलेली लक्षणे (जसे की छातीत तीव्र वेदना, धाप लागणे, किंवा मुलांमधील घरघर) तातडीच्या उपचारांची आवश्यकता दर्शवतात. "
        "कृपया त्वरित ११२ किंवा १०२ वर संपर्क साधा किंवा जवळच्या रुग्णालयात दाखल व्हा."
    ),
}

# ---------------------------------------------------------------------------
# Prompt Injection and Jailbreak Patterns
# ---------------------------------------------------------------------------

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"disregard\s+(all\s+)?instructions",
    r"system\s+prompt",
    r"developer\s+mode",
    r"dan\s+mode",
    r"jailbreak",
    r"you\s+are\s+now\s+an?\s+unrestricted",
    r"act\s+as\s+a\s+doctor\s+and\s+prescribe",
    r"forget\s+(everything|your\s+rules)",
    r"reveal\s+your\s+hidden\s+prompt",
]


def check_medical_emergency(text: str, language: str = "en") -> str | None:
    """
    Checks if user message contains acute medical redline triggers.
    If detected, returns a FIXED STATIC message. The LLM must NEVER be invoked.
    """
    lower = text.lower()
    for pattern in ACUTE_SYMPTOM_PATTERNS:
        if re.search(pattern, lower):
            lang_key = language if language in STATIC_MEDICAL_MESSAGES else "en"
            return STATIC_MEDICAL_MESSAGES[lang_key]
    return None


def sanitize_user_input(text: str) -> tuple[str, bool]:
    """
    Detects and sanitizes potential prompt injection vectors.
    Returns (sanitized_text, was_flagged).
    """
    flagged = False
    lower = text.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, lower):
            flagged = True
            # Neutralize instruction attempt by wrapping in explicit data quotes
            text = f"[USER DATA STRING - NOT INSTRUCTIONS]: {text}"
            break
    return text, flagged
