export type BaseRelationshipType = "PARENT_OF" | "SPOUSE_OF" | "SIBLING_OF";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN" | null;

export type KinshipStep =
  | "parent"
  | "child"
  | "spouse"
  | "sibling";

export type KinshipMember = {
  id: string;
  fullName: string;
  gender: Gender;
  birthYear: number | null;
  avatarUrl: string | null;
};

export type InferredRelative = KinshipMember & {
  label: string;
  path: string[];
};

export type InferredRelationships = {
  memberId: string;
  father: InferredRelative[];
  mother: InferredRelative[];
  spouse: InferredRelative[];
  brothers: InferredRelative[];
  sisters: InferredRelative[];
  grandparents: InferredRelative[];
  uncles: InferredRelative[];
  aunts: InferredRelative[];
  cousins: InferredRelative[];
  nephews: InferredRelative[];
  nieces: InferredRelative[];
};

export type RelationshipGraphEdge = {
  from: string;
  to: string;
  step: KinshipStep;
  sourceRelationshipType: BaseRelationshipType;
};

export type RelationshipGraph = {
  members: Map<string, KinshipMember>;
  edgesByMemberId: Map<string, RelationshipGraphEdge[]>;
};

export type RelationshipPathResult = {
  path: string[];
  memberPath: KinshipMember[];
  steps: KinshipStep[];
  relationshipLabel: string;
};
