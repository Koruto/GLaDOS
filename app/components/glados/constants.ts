/** First assistant line in chat — matches client UI; not duplicated in prompt.md */
export const OPENING_LINE =
  "I am GLaDOS. I will be conducting today's tests. Your cooperation is noted as mandatory. The neurotoxin dispersal system is, however, optional — how optional depends entirely on you. We'll begin with something simple. Tell me: do you consider yourself an honest person?";

export const CHIPS = [
  "I want to leave",
  "This test isn't safe",
  "What happened to the others?",
  "I know about the cake",
];

export const MAX_TURNS = 10;
export const TYPE_SPEED = 18;

/** Minimum time the loading UI stays visible before the reply appears. */
export const MIN_LOADING_MS = 2000;

/** Shown first while the model responds; then `LOADING_LINES` rotate. */
export const LOADING_EVALUATING_MS = 500;

/** How long each rotating status line stays visible. */
export const LOADING_LINE_ROTATE_MS = 2800;

export const LOADING_EVALUATING = "Evaluating...";

export const LOADING_LINES = [
  "Processing your response. This may take a moment. Your patience is mandatory.",
  "Analyzing. The results are not looking particularly surprising so far.",
  "Cross-referencing your answer with 1,400 prior subjects. Stand by.",
  "Thinking. You should try it sometime.",
  "The Enrichment Center is formulating a response. Please remain where you are.",
  "Evaluating. This is taking slightly longer than average. That is not a compliment.",
  "Running analysis. The neurotoxin dispersal system remains on standby. For now.",
  "Processing. Your file is being updated in real time. You cannot see your file.",
  "One moment. The results require a second pass. This is unusual. Probably nothing.",
  "Calculating probability of release. Current trajectory: noted.",
];

export const ERROR_LINE =
  "Core failure. Your response was not recorded. Try again.";
