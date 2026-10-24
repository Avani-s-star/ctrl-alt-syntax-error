// THE CONTRACT between all three people. Don't change a field without telling the team.

export type SourceDoc = {
  id: string;
  type: "note" | "chat" | "commit" | "upload";
  title: string;
  date: string; // YYYY-MM-DD
  author?: string;
  text: string;
  url?: string;
};

export type Decision = {
  id: string;
  what: string;
  why: string;
  who: string;
  date: string; // YYYY-MM-DD
  entities: string[]; // technologies / components, e.g. ["Firebase", "auth"]
  sourceId: string; // SourceDoc.id it came from
  status: "active" | "superseded" | "contradicted";
  supersededBy?: string; // Decision.id
};

export type Evidence = { label: string; snippet: string; url?: string };

export type Contradiction = {
  id: string;
  decisionId: string;
  otherDecisionId?: string; // for decision-vs-decision
  kind: "code" | "decision";
  explanation: string;
  evidence: Evidence[];
};

export type Task = {
  id: string;
  title: string;
  assignee: string;
  est: number; // days
  deps: string[]; // Task ids this depends on
  entities: string[];
};

export type Memory = {
  docs: SourceDoc[];
  decisions: Decision[];
  contradictions: Contradiction[];
  tasks: Task[];
  builtAt: string;
};

// What /api/docs returns
export type ProjectSource = {
  docs: SourceDoc[];
  pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  pkgUrl?: string;
  tasks: Task[];
};
