"""
Numeric Traceability Guard.
Verifies that EVERY numeric claim made in an LLM reply originates strictly
from a deterministic tool result or permitted physical constants.
Enforces the cardinal rule: THE LLM NEVER DOES THE MATH.
"""

import re
from typing import Any

# Universal allowed constants (time units, standard constants, emergency numbers)
PERMITTED_UNIVERSAL_NUMBERS = {
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "14",
    "15",
    "20",
    "24",
    "30",
    "40",
    "45",
    "50",
    "60",
    "70",
    "75",
    "85",
    "90",
    "95",
    "99",
    "100",
    "102",
    "112",
    "0.3",
    "2.5",
    "22",
    "250",
    "300",
    "400",
    "450",
    "500",
}


def extract_numbers_from_text(text: str) -> set[str]:
    """Extracts all individual integer and floating point number strings from prose."""
    # Find numbers like 492, 12.5, 65.2%, ₹8,500
    cleaned = text.replace(",", "")
    matches = re.findall(r"\b\d+(?:\.\d+)?\b", cleaned)
    return set(matches)


def extract_numbers_from_object(obj: Any) -> set[str]:
    """Recursively traverses a tool result dict/list/value and collects all numbers."""
    numbers: set[str] = set()

    if isinstance(obj, dict):
        for v in obj.values():
            numbers.update(extract_numbers_from_object(v))
    elif isinstance(obj, (list, tuple, set)):
        for item in obj:
            numbers.update(extract_numbers_from_object(item))
    elif isinstance(obj, (int, float)):
        # Add integer representation and rounded float representation
        numbers.add(str(obj))
        if isinstance(obj, float):
            numbers.add(str(round(obj, 1)))
            numbers.add(str(round(obj, 2)))
            numbers.add(str(round(obj)))
        else:
            numbers.add(f"{obj}.0")
    elif isinstance(obj, str):
        # Extract embedded numbers in strings (e.g. "AQI 492", "300 µg/m³")
        numbers.update(extract_numbers_from_text(obj))

    return numbers


def verify_numeric_traceability(
    llm_reply: str,
    tool_results: list[dict[str, Any]],
    user_context_numbers: set[str] | None = None,
) -> tuple[bool, list[str]]:
    """
    Verifies that all numbers in `llm_reply` are grounded in:
    1. Tool outputs (primary source of truth)
    2. User context (e.g. child age, commute km passed by user)
    3. Permitted physical/literature constants
    Returns (is_valid, list_of_untraceable_numbers).
    """
    reply_numbers = extract_numbers_from_text(llm_reply)

    # Collect ground-truth valid numbers
    ground_truth_numbers = set(PERMITTED_UNIVERSAL_NUMBERS)
    if user_context_numbers:
        ground_truth_numbers.update(user_context_numbers)

    for res in tool_results:
        ground_truth_numbers.update(extract_numbers_from_object(res))

    untraceable = []
    for num_str in reply_numbers:
        try:
            val = float(num_str)
        except ValueError:
            continue

        # Check exact string match or close float match
        matched = False
        if num_str in ground_truth_numbers or str(int(val)) in ground_truth_numbers:
            matched = True
        else:
            # Check numerical tolerance
            for gt in ground_truth_numbers:
                try:
                    if abs(float(gt) - val) < 0.15:
                        matched = True
                        break
                except ValueError:
                    continue

        if not matched:
            untraceable.append(num_str)

    is_valid = len(untraceable) == 0
    return is_valid, untraceable
