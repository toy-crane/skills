// Grader for refund-triage: accuracy is 1 when the triage label equals the case's expected label.
export function grade(testCase, output) {
  return { accuracy: output.trim().toLowerCase() === testCase.expected ? 1 : 0 };
}
