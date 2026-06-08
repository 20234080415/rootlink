# RootLink Roadmap

## Delivery strategy

Build RootLink from the persistence layer upward. Each phase should leave a demonstrable, testable vertical slice and avoid building the graph against temporary data structures.

## Phase 1: Foundation

- Initialize the application, PostgreSQL connection, Prisma, environment validation, linting, and test harness.
- Add the six V1 domain entities and enums.
- Generate and review the initial migration, including custom check constraints.
- Add family-scoped session/auth plumbing.

**Exit criteria:** migrations apply cleanly to an empty database; a user can register/sign in; all service calls can resolve an active family context.

## Phase 2: Family and member core

- Implement family creation and dashboard summary.
- Implement member create/read/update flows.
- Add family role guards and claimed-member ownership checks.
- Add the 20-member demo family seed.

**Exit criteria:** the seeded family and manually created members appear in the directory; unauthorized writes are rejected.

## Phase 3: Stories and timelines

- Implement biography upsert.
- Implement timeline event CRUD and family recent activity.
- Surface provenance, maintenance role, and visibility.
- Implement self versus proxy onboarding.

**Exit criteria:** a proxy recorder can create a member, biography, and events with correct provenance; a claimed member can edit their own page.

## Phase 4: Relationships and graph

- Implement relationship validation and canonicalization.
- Add graph payload endpoint.
- Build the React Flow graph, custom member node, toolbar, filters, inspector, and responsive drawer/sheet behavior.
- Add relationship creation from the graph.

**Exit criteria:** the seeded family renders as a connected graph; duplicate and self-loop edges are rejected; member details open from nodes.

## Phase 5: Media and polish

- Implement signed avatar upload and commit flow.
- Complete loading, empty, error, permission, and upload-progress states.
- Add accessibility and responsive-layout checks.
- Add end-to-end coverage for onboarding, member creation, biography, event, relationship, and graph workflows.

**Exit criteria:** the complete V1 demo works on desktop, tablet, and mobile widths with no broken primary flow.

## Phase 6: Operations and release

- Use `prisma migrate deploy` in CI/CD and production.
- Configure nightly `pg_dump -Fc` backups and periodic globals backup.
- Document and run a restore drill.
- Add monitoring for API errors, database availability, upload failures, and backup status.
- Prepare rollback and incident notes for the first release.

**Exit criteria:** production migration, backup, restore, and rollback procedures have been exercised in a non-production environment.

## Recommended implementation order

The recommended order is:

1. Create the Prisma schema and initial migration.
2. Implement family-scoped auth/session plumbing.
3. Build family and member CRUD APIs.
4. Add biography and timeline APIs.
5. Seed the 20-member demo family.
6. Add the graph endpoint and React Flow page.
7. Add avatar upload and commit flow.
8. Add permission guards and canonical relationship validation.

This order keeps the graph grounded in real domain data and treats proxy recording as a first-class path.

## Test priorities

- Database constraints and cascade/restrict behavior
- Family isolation on every repository/service method
- Role and claimed-member permission matrix
- Symmetric relationship canonicalization
- Graph payload node/edge correctness
- Proxy-recording provenance
- Avatar upload commit failure handling
- Backup restoration into a clean database

## Post-V1 candidates

- Multiple family memberships and richer invitation flows
- GEDCOM import/export
- Photo and document archives
- Evidence conflict resolution
- Public/private sharing links
- Automated graph layout persistence
- Point-in-time recovery once operational criticality justifies it

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
