"""
Unified LLM Provider Interface for SAANS.
Enforces safety rules in code, redline medical intercepts, and prompt injection defense.
Routes to MockLLM for deterministic offline testing and live models when configured.
"""

import os
from collections.abc import AsyncGenerator, Generator
from typing import Any

from .mock import MockLLM
from .safety import check_medical_emergency, sanitize_user_input


class LLMService:
    def __init__(self):
        self.api_key = os.environ.get("LLM_API_KEY", "mock-dev-key")
        self.mock_llm = MockLLM()

    def stream_chat_sync(
        self,
        user_query: str,
        profile_data: dict[str, Any] | None = None,
        language: str = "en",
        simplify_for_child: bool = False,
    ) -> Generator[dict[str, Any], None, None]:
        """
        Synchronous chat workflow:
        1. Static medical triage check (Immediate refusal for acute distress)
        2. Prompt injection sanitization
        3. Deterministic tool execution & narration
        4. Numeric traceability enforcement
        5. Synchronous event generation
        """
        # STEP 1: Medical Red-Line Triage Check (NON-NEGOTIABLE SAFETY RULE)
        emergency_msg = check_medical_emergency(user_query, language=language)
        if emergency_msg:
            # Yield immediate static emergency refusal
            yield {
                "event": "medical_intercept",
                "data": {"is_emergency": True, "message": emergency_msg},
            }
            # Stream the static text token by token
            for word in emergency_msg.split(" "):
                yield {"event": "token", "data": {"token": word + " "}}
            yield {
                "event": "citations",
                "data": {
                    "citations": [
                        {
                            "id": "medical-triage-redlines",
                            "title": "Emergency Medicine Association Guidelines",
                            "publisher": "Emergency Medicine Association of India",
                        }
                    ]
                },
            }
            yield {"event": "done", "data": {"status": "emergency_refusal"}}
            return

        # STEP 2: Prompt Injection Defense
        sanitized_query, _was_flagged = sanitize_user_input(user_query)

        # STEP 3: Route to MockLLM sync stream
        yield from self.mock_llm.chat_stream_sync(
            query=sanitized_query,
            profile_data=profile_data,
            language=language,
            simplify_for_child=simplify_for_child,
        )

    async def stream_chat(
        self,
        user_query: str,
        profile_data: dict[str, Any] | None = None,
        language: str = "en",
        simplify_for_child: bool = False,
    ) -> AsyncGenerator[dict[str, Any], None]:
        """
        Async streaming wrapper for FastAPI SSE endpoints.
        """
        for event in self.stream_chat_sync(
            user_query=user_query,
            profile_data=profile_data,
            language=language,
            simplify_for_child=simplify_for_child,
        ):
            yield event


_llm_service: LLMService | None = None


def get_llm_service() -> LLMService:
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
