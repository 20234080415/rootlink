import { createHash } from "node:crypto";
import {
  DataSource,
  FamilyRole,
  Gender,
  MaintenanceRole,
  PrismaClient,
  RelationshipType,
  Visibility,
} from "@prisma/client";

const prisma = new PrismaClient();

const FAMILY_ID = stableUuid("family:tang-demo-family");
const DEMO_PASSWORD_HASH = "dev-only-password-hash";

function stableUuid(input: string) {
  const hash = createHash("sha256").update(input).digest();

  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;

  const hex = hash.subarray(0, 16).toString("hex");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

const users = [
  {
    code: "u_zhiguo",
    email: "tang.zhiguo@example.com",
    displayName: "Tang Zhiguo",
    familyRole: FamilyRole.OWNER,
  },
  {
    code: "u_xiulan",
    email: "li.xiulan@example.com",
    displayName: "Li Xiulan",
    familyRole: FamilyRole.EDITOR,
  },
  {
    code: "u_yuzheng",
    email: "tang.yuzheng@example.com",
    displayName: "Tang Yuzheng",
    familyRole: FamilyRole.EDITOR,
  },
  {
    code: "u_yuxin",
    email: "tang.yuxin@example.com",
    displayName: "Tang Yuxin",
    familyRole: FamilyRole.VIEWER,
  },
] as const;

const members = [
  [
    "M01",
    "Tang Wenhao",
    "1932-03-16",
    "2011-08-02",
    Gender.MALE,
    MaintenanceRole.ARCHIVIST,
    DataSource.FAMILY_MEMORY,
    null,
  ],
  [
    "M02",
    "Zhao Shufang",
    "1935-11-08",
    "2017-01-14",
    Gender.FEMALE,
    MaintenanceRole.ARCHIVIST,
    DataSource.FAMILY_MEMORY,
    null,
  ],
  [
    "M03",
    "Tang Guoqiang",
    "1954-05-02",
    null,
    Gender.MALE,
    MaintenanceRole.SELF,
    DataSource.SELF_REPORTED,
    null,
  ],
  [
    "M04",
    "Tang Jianguo",
    "1958-09-24",
    null,
    Gender.MALE,
    MaintenanceRole.PROXY,
    DataSource.INTERVIEW,
    null,
  ],
  [
    "M05",
    "Liu Meilan",
    "1959-01-17",
    null,
    Gender.FEMALE,
    MaintenanceRole.PROXY,
    DataSource.INTERVIEW,
    null,
  ],
  [
    "M06",
    "Tang Zhiguo",
    "1963-07-11",
    null,
    Gender.MALE,
    MaintenanceRole.SELF,
    DataSource.SELF_REPORTED,
    "u_zhiguo",
  ],
  [
    "M07",
    "Li Xiulan",
    "1965-04-29",
    null,
    Gender.FEMALE,
    MaintenanceRole.SELF,
    DataSource.SELF_REPORTED,
    "u_xiulan",
  ],
  [
    "M08",
    "Tang Xiaomei",
    "1968-12-03",
    null,
    Gender.FEMALE,
    MaintenanceRole.PROXY,
    DataSource.FAMILY_MEMORY,
    null,
  ],
  [
    "M09",
    "Chen Lihua",
    "1956-10-05",
    null,
    Gender.FEMALE,
    MaintenanceRole.PROXY,
    DataSource.INTERVIEW,
    null,
  ],
  [
    "M10",
    "Wang Qiuyun",
    "1969-06-20",
    null,
    Gender.MALE,
    MaintenanceRole.PROXY,
    DataSource.FAMILY_MEMORY,
    null,
  ],
  [
    "M11",
    "Tang Lei",
    "1980-02-13",
    null,
    Gender.MALE,
    MaintenanceRole.PROXY,
    DataSource.FAMILY_MEMORY,
    null,
  ],
  [
    "M12",
    "Tang Na",
    "1983-08-30",
    null,
    Gender.FEMALE,
    MaintenanceRole.PROXY,
    DataSource.FAMILY_MEMORY,
    null,
  ],
  [
    "M13",
    "Tang Hao",
    "1988-01-09",
    null,
    Gender.MALE,
    MaintenanceRole.PROXY,
    DataSource.FAMILY_MEMORY,
    null,
  ],
  [
    "M14",
    "Tang Yue",
    "1992-03-25",
    null,
    Gender.FEMALE,
    MaintenanceRole.PROXY,
    DataSource.FAMILY_MEMORY,
    null,
  ],
  [
    "M15",
    "Tang Yuzheng",
    "1999-07-22",
    null,
    Gender.MALE,
    MaintenanceRole.SELF,
    DataSource.SELF_REPORTED,
    "u_yuzheng",
  ],
  [
    "M16",
    "Tang Yuxin",
    "2002-05-18",
    null,
    Gender.FEMALE,
    MaintenanceRole.SELF,
    DataSource.SELF_REPORTED,
    "u_yuxin",
  ],
  [
    "M17",
    "Lin Wei",
    "2000-09-02",
    null,
    Gender.FEMALE,
    MaintenanceRole.PROXY,
    DataSource.SELF_REPORTED,
    null,
  ],
  [
    "M18",
    "Chen Yiran",
    "2001-11-27",
    null,
    Gender.MALE,
    MaintenanceRole.PROXY,
    DataSource.SELF_REPORTED,
    null,
  ],
  [
    "M19",
    "Tang Chenxi",
    "2024-02-11",
    null,
    Gender.UNKNOWN,
    MaintenanceRole.GUARDIAN,
    DataSource.ADMIN_CREATED,
    null,
  ],
  [
    "M20",
    "Tang Muchen",
    "2025-03-15",
    null,
    Gender.UNKNOWN,
    MaintenanceRole.GUARDIAN,
    DataSource.ADMIN_CREATED,
    null,
  ],
] as const;

const relationships = [
  ["M01", "M02", RelationshipType.SPOUSE_OF, "1953-02-18"],
  ["M01", "M03", RelationshipType.PARENT_OF, null],
  ["M02", "M03", RelationshipType.PARENT_OF, null],
  ["M01", "M04", RelationshipType.PARENT_OF, null],
  ["M02", "M04", RelationshipType.PARENT_OF, null],
  ["M01", "M06", RelationshipType.PARENT_OF, null],
  ["M02", "M06", RelationshipType.PARENT_OF, null],
  ["M01", "M08", RelationshipType.PARENT_OF, null],
  ["M02", "M08", RelationshipType.PARENT_OF, null],
  ["M03", "M09", RelationshipType.SPOUSE_OF, "1979-10-06"],
  ["M03", "M11", RelationshipType.PARENT_OF, null],
  ["M09", "M11", RelationshipType.PARENT_OF, null],
  ["M03", "M12", RelationshipType.PARENT_OF, null],
  ["M09", "M12", RelationshipType.PARENT_OF, null],
  ["M04", "M05", RelationshipType.SPOUSE_OF, "1984-05-19"],
  ["M04", "M13", RelationshipType.PARENT_OF, null],
  ["M05", "M13", RelationshipType.PARENT_OF, null],
  ["M04", "M14", RelationshipType.PARENT_OF, null],
  ["M05", "M14", RelationshipType.PARENT_OF, null],
  ["M06", "M07", RelationshipType.SPOUSE_OF, "1993-02-14"],
  ["M06", "M15", RelationshipType.PARENT_OF, null],
  ["M07", "M15", RelationshipType.PARENT_OF, null],
  ["M06", "M16", RelationshipType.PARENT_OF, null],
  ["M07", "M16", RelationshipType.PARENT_OF, null],
  ["M08", "M10", RelationshipType.SPOUSE_OF, "1999-10-10"],
  ["M15", "M17", RelationshipType.SPOUSE_OF, "2023-09-24"],
  ["M15", "M19", RelationshipType.PARENT_OF, null],
  ["M17", "M19", RelationshipType.PARENT_OF, null],
  ["M16", "M18", RelationshipType.SPOUSE_OF, "2024-01-06"],
  ["M16", "M20", RelationshipType.PARENT_OF, null],
  ["M18", "M20", RelationshipType.PARENT_OF, null],
] as const;

const timelineEvents = [
  ["E01", "M01", "Born in Linqing, Shandong", "1932-03-16"],
  ["E02", "M02", "Born in Linqing, Shandong", "1935-11-08"],
  ["E03", "M01", "Married Zhao Shufang", "1953-02-18"],
  ["E04", "M03", "Born", "1954-05-02"],
  ["E05", "M09", "Born", "1956-10-05"],
  ["E06", "M04", "Born", "1958-09-24"],
  ["E07", "M05", "Born", "1959-01-17"],
  ["E08", "M06", "Born", "1963-07-11"],
  ["E09", "M07", "Born", "1965-04-29"],
  ["E10", "M08", "Born", "1968-12-03"],
  ["E11", "M10", "Born", "1969-06-20"],
  ["E12", "M01", "Moved family from village to county seat", "1972-03-01"],
  ["E13", "M03", "Started work at grain station", "1974-07-01"],
  ["E14", "M04", "Completed military service", "1978-09-01"],
  ["E15", "M03", "Married Chen Lihua", "1979-10-06"],
  ["E16", "M11", "Born", "1980-02-13"],
  ["E17", "M06", "Entered technical secondary school", "1981-09-01"],
  ["E18", "M12", "Born", "1983-08-30"],
  ["E19", "M04", "Married Liu Meilan", "1984-05-19"],
  ["E20", "M13", "Born", "1988-01-09"],
  ["E21", "M06", "Moved to Shenzhen for work", "1988-10-12"],
  ["E22", "M14", "Born", "1992-03-25"],
  ["E23", "M06", "Married Li Xiulan", "1993-02-14"],
  ["E24", "M07", "Started primary school teaching job", "1993-09-01"],
  ["E25", "M03", "Opened family hardware shop", "1994-04-18"],
  ["E26", "M15", "Born", "1999-07-22"],
  ["E27", "M10", "Married Tang Xiaomei", "1999-10-10"],
  ["E28", "M16", "Born", "2002-05-18"],
  ["E29", "M01", "Became clan elder for reunion records", "2003-01-15"],
  ["E30", "M11", "Graduated from university", "2003-07-01"],
  ["E31", "M13", "Started first factory job", "2007-06-15"],
  ["E32", "M01", "Passed away", "2011-08-02"],
  ["E33", "M02", "Passed away", "2017-01-14"],
  ["E34", "M15", "Entered university", "2017-09-01"],
  [
    "E35",
    "M14",
    "Married outside hometown and moved to Hangzhou",
    "2018-10-04",
  ],
  ["E36", "M15", "Started first software internship", "2020-07-01"],
  ["E37", "M16", "Entered university", "2020-09-01"],
  ["E38", "M17", "Born", "2000-09-02"],
  ["E39", "M18", "Born", "2001-11-27"],
  ["E40", "M15", "Married Lin Wei", "2023-09-24"],
  ["E41", "M16", "Married Chen Yiran", "2024-01-06"],
  ["E42", "M19", "Born", "2024-02-11"],
  ["E43", "M20", "Born", "2025-03-15"],
  ["E44", "M06", "Recorded oral family history interview", "2025-04-20"],
  ["E45", "M07", "Wrote letter to younger generation", "2025-05-03"],
  ["E46", "M19", "Added one-year growth milestone", "2025-02-11"],
  ["E47", "M15", "Created RootLink family space", "2026-01-10"],
  ["E48", "M16", "Uploaded first branch photo archive", "2026-01-12"],
  ["E49", "M03", "Approved biography written by nephew", "2026-01-16"],
  ["E50", "M04", "Added military service memory note", "2026-01-18"],
] as const;

const memberSummaries: Record<string, string> = {
  M01: "Family elder who kept early reunion records for the Tang branch.",
  M02: "Remembered as the quiet organizer of household rituals and family meals.",
  M03: "Eldest son of Tang Wenhao, known for steady work and practical advice.",
  M04: "Second son of Tang Wenhao; completed military service before starting family life.",
  M05: "Interview source for several stories about the middle generation.",
  M06: "Moved to Shenzhen for work and later helped digitize family memories.",
  M07: "Primary school teacher who wrote letters for the younger generation.",
  M08: "Youngest daughter of the elder branch, connected to the Wang household.",
  M09: "Spouse of Tang Guoqiang and keeper of many daily-life family stories.",
  M10: "Spouse of Tang Xiaomei and participant in the branch photo archive.",
  M11: "University graduate from the Guoqiang branch.",
  M12: "Daughter of Tang Guoqiang and Chen Lihua.",
  M13: "Son of Tang Jianguo and Liu Meilan.",
  M14: "Daughter of Tang Jianguo and Liu Meilan who later moved to Hangzhou.",
  M15: "Created the RootLink demo family space and maintains his own page.",
  M16: "Uploaded the first branch photo archive and maintains her own page.",
  M17: "Spouse of Tang Yuzheng.",
  M18: "Spouse of Tang Yuxin.",
  M19: "Guardian-maintained child record in the newest generation.",
  M20: "Guardian-maintained child record in the newest generation.",
};

async function main() {
  const userIds = Object.fromEntries(
    users.map((user) => [user.code, stableUuid(`user:${user.code}`)])
  );
  const memberIds = Object.fromEntries(
    members.map(([code]) => [code, stableUuid(`member:${code}`)])
  );

  await prisma.family.deleteMany({
    where: {
      slug: "tang-demo-family",
    },
  });

  await prisma.family.create({
    data: {
      id: FAMILY_ID,
      slug: "tang-demo-family",
      name: "Tang Demo Family",
      description: "Demo family space for RootLink V1.",
    },
  });

  await prisma.user.createMany({
    data: users.map((user) => ({
      id: userIds[user.code],
      email: user.email,
      passwordHash: DEMO_PASSWORD_HASH,
      displayName: user.displayName,
      familyId: FAMILY_ID,
      familyRole: user.familyRole,
      isActive: true,
    })),
  });

  await prisma.family.update({
    where: { id: FAMILY_ID },
    data: {
      createdById: userIds.u_yuzheng,
    },
  });

  await prisma.member.createMany({
    data: members.map(
      ([
        code,
        fullName,
        birthDate,
        deathDate,
        gender,
        maintenanceRole,
        source,
        claimedByUserCode,
      ]) => ({
        id: memberIds[code],
        familyId: FAMILY_ID,
        claimedByUserId: claimedByUserCode ? userIds[claimedByUserCode] : null,
        fullName,
        gender,
        birthDate: date(birthDate),
        deathDate: deathDate ? date(deathDate) : null,
        bioShort: memberSummaries[code],
        maintenanceRole,
        source,
        createdById: userIds.u_yuzheng,
        updatedById: userIds.u_yuzheng,
      })
    ),
  });

  await prisma.relationship.createMany({
    data: relationships.map(
      ([subjectCode, objectCode, relationshipType, startDate]) => {
        const [subjectMemberId, objectMemberId] =
          relationshipType === RelationshipType.PARENT_OF
            ? [memberIds[subjectCode], memberIds[objectCode]]
            : [memberIds[subjectCode], memberIds[objectCode]].sort();

        return {
          id: stableUuid(
            `relationship:${relationshipType}:${subjectMemberId}:${objectMemberId}`
          ),
          familyId: FAMILY_ID,
          subjectMemberId,
          objectMemberId,
          relationshipType,
          startDate: startDate ? date(startDate) : null,
          isPrimary: true,
          source: DataSource.FAMILY_MEMORY,
          createdById: userIds.u_yuzheng,
        };
      }
    ),
  });

  await prisma.biography.createMany({
    data: members.map(([code, fullName, , , , maintenanceRole, source]) => ({
      id: stableUuid(`biography:${code}`),
      familyId: FAMILY_ID,
      memberId: memberIds[code],
      contentMd: `# ${fullName}\n\n${memberSummaries[code]}\n\nThis demo biography is intentionally short and exists to support RootLink V1 development data.`,
      source,
      maintenanceRole,
      visibility: Visibility.FAMILY,
      createdById: userIds.u_yuzheng,
      updatedById: userIds.u_yuzheng,
    })),
  });

  await prisma.timelineEvent.createMany({
    data: timelineEvents.map(([code, memberCode, title, eventDate]) => ({
      id: stableUuid(`timeline-event:${code}`),
      familyId: FAMILY_ID,
      memberId: memberIds[memberCode],
      title,
      eventDate: date(eventDate),
      sortDate: date(eventDate),
      dateLabel: eventDate,
      isApproximate: false,
      source: DataSource.FAMILY_MEMORY,
      maintenanceRole: MaintenanceRole.ARCHIVIST,
      visibility: Visibility.FAMILY,
      createdById: userIds.u_yuzheng,
      updatedById: userIds.u_yuzheng,
    })),
  });

  const [
    familyCount,
    userCount,
    memberCount,
    relationshipCount,
    biographyCount,
    eventCount,
  ] = await Promise.all([
    prisma.family.count({ where: { id: FAMILY_ID } }),
    prisma.user.count({ where: { familyId: FAMILY_ID } }),
    prisma.member.count({ where: { familyId: FAMILY_ID } }),
    prisma.relationship.count({ where: { familyId: FAMILY_ID } }),
    prisma.biography.count({ where: { familyId: FAMILY_ID } }),
    prisma.timelineEvent.count({ where: { familyId: FAMILY_ID } }),
  ]);

  console.log("Seeded RootLink demo data:");
  console.log(`- families: ${familyCount}`);
  console.log(`- users: ${userCount}`);
  console.log(`- members: ${memberCount}`);
  console.log(`- relationships: ${relationshipCount}`);
  console.log(`- biographies: ${biographyCount}`);
  console.log(`- timeline events: ${eventCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
