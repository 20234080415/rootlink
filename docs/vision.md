# RootLink Vision

## Product vision

RootLink is a family memory and relationship workspace. It helps a family build a shared, multi-generation graph while preserving biographies, life events, evidence sources, and the identity of the person who recorded each item.

V1 is deliberately practical: it should let one family create a trustworthy family space, add and connect members, record stories on behalf of relatives, and browse the result as both a graph and a timeline.

## Why RootLink exists

Family information is usually scattered across chat histories, paper notes, photo folders, and the memories of a few relatives. Existing genealogy tools often optimize for historical research, while ordinary families also need:

- a simple way to capture living family knowledge;
- first-class support for recording on behalf of elders or relatives;
- clear provenance for facts and stories;
- a visual graph that remains connected to editable member records;
- privacy and permissions that work at family, member, and content level.

## V1 outcome

RootLink V1 should deliver two implementation-ready foundations:

1. A PostgreSQL/Prisma relational model centered on `User`, `Family`, `Member`, `Relationship`, `Biography`, and `TimelineEvent`.
2. A responsive web application covering onboarding, family creation, member CRUD, proxy recording, relationship graph browsing/editing, biography editing, timeline events, and avatar upload.

## Product principles

- **Family-scoped by default.** Every domain request is evaluated in a family context.
- **People are nodes; relationships are explicit edges.** Relationship metadata and direction must be preserved.
- **Proxy recording is a primary workflow.** The product must not assume every represented family member has an account.
- **Provenance is part of the data.** Source, creator, updater, and maintenance role travel with content.
- **Self-ownership is scoped.** A claimed member can maintain their own page without automatically gaining broad family administration rights.
- **The graph is a view, not the database.** Graph nodes and edges are produced from normalized domain records.
- **Operational simplicity first.** Use standard REST, Prisma migrations, explicit seed data, and PostgreSQL-native backup tools.

## V1 scope

### Included

- Local account registration and sign-in baseline
- One primary family context per user
- Family creation and settings
- Member directory and member profiles
- Parent, spouse, and sibling relationships
- Biography and timeline event records
- Self, proxy, guardian, family-admin, and archivist maintenance roles
- Family, admin-only, and maintainer-only visibility
- Interactive relationship graph
- Avatar image upload
- Demo seed family for development and product review

### Deferred

- Multi-family membership and invitations beyond the V1 baseline
- Automated genealogy inference
- GEDCOM import/export
- Rich media galleries beyond avatars
- Public family pages
- Native mobile applications
- Real-time collaborative editing
- Advanced historical evidence reconciliation

## Success criteria

- A new user can create a family and complete proxy-recording onboarding.
- An editor can create a member, biography, timeline events, and relationships without direct database work.
- The graph accurately renders the family and opens the corresponding member record.
- Symmetric relationships are stored once in canonical form; directed parent relationships preserve direction.
- Every write is family-scoped and permission-checked.
- A seeded 20-member, four-generation family can be loaded for a complete demo.
- Backups can be restored into a fresh database during a documented restore drill.

## Design assumptions

The design assumptions for this report are intentionally narrow so that Codex can implement V1 without drifting into V2 or V3. The scope remains the six requested entities only. Authentication is unspecified, so the schema below uses a minimal local-auth baseline (email, password_hash) without locking you into a specific hosting or auth vendor. The permission model is intentionally simple: family-level roles for broad access, plus member/content-level provenance fields to support 代写 and guardian-driven recording. The system assumes one primary family per user in V1, even though future versions may allow multi-family membership.

## References

- [Prisma relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)
- [Prisma many-to-many relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations)
- [Prisma referential actions](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions)
- [Prisma schema reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [Prisma development and production migrations](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production)
- [Prisma seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding)
- [React Flow concepts](https://reactflow.dev/learn/concepts/terms-and-definitions)
- [ReactFlow component](https://reactflow.dev/api-reference/react-flow)
- [PostgreSQL pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
- [PostgreSQL continuous archiving and PITR](https://www.postgresql.org/docs/current/continuous-archiving.html)

[1]: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations
[2]: https://reactflow.dev/learn/concepts/terms-and-definitions
[3]: https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production
[4]: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations
[5]: https://www.prisma.io/docs/orm/reference/prisma-schema-reference
[6]: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations
[7]: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions
[8]: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding
[9]: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations
[10]: https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production
[11]: https://www.prisma.io/docs/orm/reference/prisma-schema-reference
[12]: https://www.postgresql.org/docs/current/app-pgdump.html
[13]: https://www.postgresql.org/docs/current/continuous-archiving.html
[14]: https://reactflow.dev/learn/concepts/terms-and-definitions
[15]: https://reactflow.dev/api-reference/react-flow
