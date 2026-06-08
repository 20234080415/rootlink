import { ApiError, API_ERROR_CODES, assertUuid } from "@/server/api";
import { prisma } from "@/server/db/prisma";
import {
  buildRelationshipGraph,
  findShortestKinshipPath,
  getNeighbors,
  uniqueMembers,
} from "@/server/relationship-inference/inference-engine";
import type {
  Gender,
  InferredRelationships,
  KinshipMember,
  KinshipStep,
  RelationshipGraph,
  RelationshipPathResult,
} from "@/server/relationship-inference/kinship-types";

const STEP_LABELS: Record<KinshipStep, string> = {
  parent: "父母",
  child: "子女",
  spouse: "配偶",
  sibling: "兄弟姐妹",
};

type PathRule = {
  signature: string;
  resolve: (context: PathContext) => string;
};

type PathContext = {
  from: KinshipMember;
  to: KinshipMember;
  memberPath: KinshipMember[];
  steps: KinshipStep[];
};

const PATH_RULES: PathRule[] = [
  { signature: "parent", resolve: ({ to }) => parentLabel(to.gender) },
  { signature: "child", resolve: ({ to }) => childLabel(to.gender) },
  { signature: "spouse", resolve: () => "配偶" },
  { signature: "sibling", resolve: ({ to }) => siblingLabel(to.gender) },
  {
    signature: "parent>parent",
    resolve: ({ memberPath }) => grandparentLabel(memberPath[1], memberPath[2]),
  },
  {
    signature: "parent>sibling",
    resolve: ({ memberPath }) => parentSiblingLabel(memberPath[1], memberPath[2]),
  },
  {
    signature: "parent>sibling>child",
    resolve: ({ from, memberPath }) =>
      cousinLabel(from, memberPath[1], memberPath[2], memberPath[3]),
  },
  {
    signature: "sibling>child",
    resolve: ({ to }) => nephewNieceLabel(to.gender),
  },
];

function signature(steps: KinshipStep[]) {
  return steps.join(">");
}

function isMale(gender: Gender) {
  return gender === "MALE";
}

function isFemale(gender: Gender) {
  return gender === "FEMALE";
}

function parentLabel(gender: Gender) {
  if (isMale(gender)) return "父亲";
  if (isFemale(gender)) return "母亲";
  return "父母";
}

function childLabel(gender: Gender) {
  if (isMale(gender)) return "儿子";
  if (isFemale(gender)) return "女儿";
  return "子女";
}

function siblingLabel(gender: Gender) {
  if (isMale(gender)) return "兄弟";
  if (isFemale(gender)) return "姐妹";
  return "兄弟姐妹";
}

function grandparentLabel(parent: KinshipMember, grandparent: KinshipMember) {
  if (isMale(parent.gender) && isMale(grandparent.gender)) return "祖父";
  if (isMale(parent.gender) && isFemale(grandparent.gender)) return "祖母";
  if (isFemale(parent.gender) && isMale(grandparent.gender)) return "外祖父";
  if (isFemale(parent.gender) && isFemale(grandparent.gender)) return "外祖母";
  return "祖父母";
}

function parentSiblingLabel(parent: KinshipMember, relative: KinshipMember) {
  if (isMale(parent.gender) && isMale(relative.gender)) {
    if (parent.birthYear && relative.birthYear) {
      return relative.birthYear < parent.birthYear ? "伯伯" : "叔叔";
    }
    return "伯叔";
  }
  if (isMale(parent.gender) && isFemale(relative.gender)) return "姑姑";
  if (isFemale(parent.gender) && isMale(relative.gender)) return "舅舅";
  if (isFemale(parent.gender) && isFemale(relative.gender)) return "阿姨";
  return "伯叔姑舅姨";
}

function cousinLabel(
  self: KinshipMember,
  parent: KinshipMember,
  parentSibling: KinshipMember,
  cousin: KinshipMember
) {
  const prefix =
    isMale(parent.gender) && isMale(parentSibling.gender) ? "堂" : "表";
  const older =
    self.birthYear && cousin.birthYear ? cousin.birthYear < self.birthYear : null;

  if (isMale(cousin.gender)) {
    return `${prefix}${older === false ? "弟" : "兄"}`;
  }
  if (isFemale(cousin.gender)) {
    return `${prefix}${older === false ? "妹" : "姐"}`;
  }

  return `${prefix}兄弟姐妹`;
}

function nephewNieceLabel(gender: Gender) {
  if (isMale(gender)) return "侄子/外甥";
  if (isFemale(gender)) return "侄女/外甥女";
  return "侄甥";
}

function resolvePathLabel(context: PathContext) {
  const sig = signature(context.steps);
  const rule = PATH_RULES.find((item) => item.signature === sig);
  return rule?.resolve(context) ?? "亲属";
}

function toRelative(member: KinshipMember, label: string, path: string[]) {
  return {
    ...member,
    label,
    path,
  };
}

function getStepMembers(graph: RelationshipGraph, fromId: string, step: KinshipStep) {
  return getNeighbors(graph, fromId)
    .filter((edge) => edge.step === step)
    .map((edge) => graph.members.get(edge.to))
    .filter((member): member is KinshipMember => Boolean(member));
}

function getParents(graph: RelationshipGraph, memberId: string) {
  return getStepMembers(graph, memberId, "parent");
}

function getChildren(graph: RelationshipGraph, memberId: string) {
  return getStepMembers(graph, memberId, "child");
}

function getSpouses(graph: RelationshipGraph, memberId: string) {
  return getStepMembers(graph, memberId, "spouse");
}

function getSiblings(graph: RelationshipGraph, memberId: string) {
  const directSiblings = getStepMembers(graph, memberId, "sibling");
  const parentSiblings = getParents(graph, memberId).flatMap((parent) =>
    getChildren(graph, parent.id).filter((child) => child.id !== memberId)
  );

  return uniqueMembers([...directSiblings, ...parentSiblings]);
}

async function loadFamilyGraph(familyId: string) {
  assertUuid(familyId, "familyId");

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    select: { id: true },
  });

  if (!family) {
    throw new ApiError(API_ERROR_CODES.NOT_FOUND, "家族不存在。", 404, {
      familyId: "未找到对应家族。",
    });
  }

  const [members, relationships] = await Promise.all([
    prisma.member.findMany({
      where: { familyId },
      select: {
        id: true,
        fullName: true,
        gender: true,
        birthDate: true,
        avatarUrl: true,
      },
    }),
    prisma.relationship.findMany({
      where: { familyId },
      select: {
        subjectMemberId: true,
        objectMemberId: true,
        relationshipType: true,
      },
    }),
  ]);

  return buildRelationshipGraph({ members, relationships });
}

export async function inferRelationships(
  familyId: string,
  memberId: string
): Promise<InferredRelationships> {
  assertUuid(memberId, "memberId");

  const graph = await loadFamilyGraph(familyId);
  const self = graph.members.get(memberId);

  if (!self) {
    throw new ApiError(API_ERROR_CODES.NOT_FOUND, "成员不存在。", 404, {
      memberId: "未找到此家族中的成员。",
    });
  }

  const parents = getParents(graph, memberId);
  const siblings = getSiblings(graph, memberId);
  const spouses = getSpouses(graph, memberId);

  const grandparents = parents.flatMap((parent) =>
    getParents(graph, parent.id).map((grandparent) =>
      toRelative(grandparent, grandparentLabel(parent, grandparent), [
        memberId,
        parent.id,
        grandparent.id,
      ])
    )
  );

  const parentSiblings = parents.flatMap((parent) =>
    getSiblings(graph, parent.id).map((relative) => ({
      parent,
      relative,
    }))
  );

  const unclesAndAunts = parentSiblings.map(({ parent, relative }) =>
    toRelative(relative, parentSiblingLabel(parent, relative), [
      memberId,
      parent.id,
      relative.id,
    ])
  );

  const cousins = parentSiblings.flatMap(({ parent, relative }) =>
    getChildren(graph, relative.id)
      .filter((child) => child.id !== memberId)
      .map((child) =>
        toRelative(child, cousinLabel(self, parent, relative, child), [
          memberId,
          parent.id,
          relative.id,
          child.id,
        ])
      )
  );

  return {
    memberId,
    father: parents
      .filter((parent) => isMale(parent.gender))
      .map((parent) => toRelative(parent, "父亲", [memberId, parent.id])),
    mother: parents
      .filter((parent) => isFemale(parent.gender))
      .map((parent) => toRelative(parent, "母亲", [memberId, parent.id])),
    spouse: spouses.map((spouse) =>
      toRelative(spouse, "配偶", [memberId, spouse.id])
    ),
    brothers: siblings
      .filter((sibling) => isMale(sibling.gender))
      .map((sibling) => toRelative(sibling, "兄弟", [memberId, sibling.id])),
    sisters: siblings
      .filter((sibling) => isFemale(sibling.gender))
      .map((sibling) => toRelative(sibling, "姐妹", [memberId, sibling.id])),
    grandparents: uniqueMembers(grandparents),
    uncles: uniqueMembers(
      unclesAndAunts.filter((relative) => isMale(relative.gender))
    ),
    aunts: uniqueMembers(
      unclesAndAunts.filter((relative) => isFemale(relative.gender))
    ),
    cousins: uniqueMembers(cousins),
    nephews: [],
    nieces: [],
  };
}

export async function resolveRelationshipPath(input: {
  familyId: string;
  fromMemberId: string;
  toMemberId: string;
}): Promise<RelationshipPathResult> {
  assertUuid(input.fromMemberId, "fromMemberId");
  assertUuid(input.toMemberId, "toMemberId");

  const graph = await loadFamilyGraph(input.familyId);
  const from = graph.members.get(input.fromMemberId);
  const to = graph.members.get(input.toMemberId);

  if (!from || !to) {
    throw new ApiError(API_ERROR_CODES.NOT_FOUND, "成员不存在。", 404, {
      memberId: "未找到此家族中的成员。",
    });
  }

  if (from.id === to.id) {
    return {
      path: [from.id],
      memberPath: [from],
      steps: [],
      relationshipLabel: "本人",
    };
  }

  const path = findShortestKinshipPath({
    graph,
    fromMemberId: from.id,
    toMemberId: to.id,
    maxDepth: 4,
  });

  if (!path) {
    return {
      path: [from.id, to.id],
      memberPath: [from, to],
      steps: [],
      relationshipLabel: "暂未推导出关系",
    };
  }

  const memberPath = path.memberPath
    .map((id) => graph.members.get(id))
    .filter((member): member is KinshipMember => Boolean(member));
  const relationshipLabel = resolvePathLabel({
    from,
    to,
    memberPath,
    steps: path.steps,
  });

  return {
    path: buildDisplayPath(memberPath, path.steps, relationshipLabel),
    memberPath,
    steps: path.steps,
    relationshipLabel,
  };
}

function buildDisplayPath(
  members: KinshipMember[],
  steps: KinshipStep[],
  finalLabel: string
) {
  const output: string[] = [];

  members.forEach((member, index) => {
    if (index === 0) {
      output.push(member.id);
      return;
    }

    output.push(index === members.length - 1 ? finalLabel : STEP_LABELS[steps[index - 1]]);
    output.push(member.id);
  });

  return output;
}
