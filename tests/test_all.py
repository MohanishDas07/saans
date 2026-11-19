"""
Unified Test Runner for SAANS Engine and API Test Suites.
"""

import sys
import unittest


def run_all_tests():
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Discover engine tests
    suite_engine = loader.discover("tests/engine", pattern="test_*.py")
    # Discover api tests
    suite_api = loader.discover("tests/api", pattern="test_*.py")
    # Discover evaluation harness tests
    suite_eval = loader.discover("tests/eval", pattern="test_*.py")

    suite.addTests(suite_engine)
    suite.addTests(suite_api)
    suite.addTests(suite_eval)

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)


if __name__ == "__main__":
    run_all_tests()
