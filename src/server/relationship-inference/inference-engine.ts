import type {
  BaseRelationshipType,
  KinshipMember,
  KinshipStep,
  RelationshipGraph,
  RelationshipGraphEdge,
} from "@/server/relationship-inference/kinship-types";

type RawMember = {
  id: string;
  fullName: string;
  gender: string | null;
  birthDate: Date | null;
  avatarUrl: string | null;
};

type RawRelationship = {
  subjectMemberId: string;
  objectMemberId: string;
  relationshipType: string;
};

function extractYear(value: Date | null) {
  return value ? value.getFullYear() : null;
}

function addEdge(
  edgesByMemberId: Map<string, RelationshipGraphEdge[]>,
  edge: RelationshipGraphEdge
) {
  const edges = edgesByMemberId.get(edge.from) ?? [];
  edges.push(edge);
  edgesByMemberId.set(edge.from, edges);
}

export function buildRelationshipGraph(input: {
  members: RawMember[];
  relationships: RawRelationship[];
}): RelationshipGraph {
  const members = new Map<string, KinshipMember>();
  const edgesByMemberId = new Map<string, RelationshipGraphEdge[]>();

  for (const member of input.members) {
    members.set(member.id, {
      id: member.id,
      fullName: member.fullName,
      gender: member.gender as KinshipMember["gender"],
      birthYear: extractYear(member.birthDate),
      avatarUrl: member.avatarUrl,
    });
  }

  for (const relationship of input.relationships) {
    const type = relationship.relationshipType as BaseRelationshipType;
    const subject = relationship.subjectMemberId;
    const object = relationship.objectMemberId;

    if (!members.has(subject) || !members.has(object)) continue;

    if (type === "PARENT_OF") {
      addEdge(edgesByMemberId, {
        from: object,
        to: subject,
        step: "parent",
        sourceRelationshipType: type,
      });
      addEdge(edgesByMemberId, {
        from: subject,
        to: object,
        step: "child",
        sourceRelationshipType: type,
      });
    }

    if (type === "SPOUSE_OF") {
      addSymmetricEdge(edgesByMemberId, subject, object, "spouse", type);
    }

    if (type === "SIBLING_OF") {
      addSymmetricEdge(edgesByMemberId, subject, object, "sibling", type);
    }
  }

  return {
    members,
    edgesByMemberId,
  };
}

function addSymmetricEdge(
  edgesByMemberId: Map<string, RelationshipGraphEdge[]>,
  left: string,
  right: string,
  step: KinshipStep,
  sourceRelationshipType: BaseRelationshipType
) {
  addEdge(edgesByMemberId, {
    from: left,
    to: right,
    step,
    sourceRelationshipType,
  });
  addEdge(edgesByMemberId, {
    from: right,
    to: left,
    step,
    sourceRelationshipType,
  });
}

export function getNeighbors(graph: RelationshipGraph, memberId: string) {
  return graph.edgesByMemberId.get(memberId) ?? [];
}

export function findShortestKinshipPath(input: {
  graph: RelationshipGraph;
  fromMemberId: string;
  toMemberId: string;
  maxDepth?: number;
}) {
  const maxDepth = input.maxDepth ?? 4;
  const queue: Array<{
    memberId: string;
    memberPath: string[];
    steps: KinshipStep[];
  }> = [
    {
      memberId: input.fromMemberId,
      memberPath: [input.fromMemberId],
      steps: [],
    },
  ];
  const visited = new Set<string>([input.fromMemberId]);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.memberId === input.toMemberId) {
      return current;
    }

    if (current.steps.length >= maxDepth) {
      continue;
    }

    const neighbors = getNeighbors(input.graph, current.memberId);
    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;

      visited.add(edge.to);
      queue.push({
        memberId: edge.to,
        memberPath: [...current.memberPath, edge.to],
        steps: [...current.steps, edge.step],
      });
    }
  }

  return null;
}

export function uniqueMembers<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  const output: T[] = [];

  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    output.push(item);
  }

  return output;
}
