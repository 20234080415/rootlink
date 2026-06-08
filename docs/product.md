# RootLink Product

## Target users

- **Family owner:** creates the family space, manages roles, and oversees shared records.
- **Family admin/editor:** adds members, relationships, biographies, and events.
- **Self-maintaining member:** claims and edits their own member page.
- **Proxy recorder:** records stories and facts for a relative who does not use RootLink directly.
- **Viewer:** browses the family graph and permitted family content.
- **Archivist/guardian:** maintains records with an explicit maintenance role and source.

## Core jobs

1. Create a family space and choose whether the first records are about the user or another relative.
2. Add family members with optional life dates, avatar, short biography, provenance, and maintenance role.
3. Connect members through parent, spouse, and sibling relationships.
4. Browse the family as a searchable directory, interactive graph, and activity/timeline view.
5. Record long-form biographies and dated or approximate life events.
6. Let represented members claim their own profiles while retaining prior provenance.
7. Keep sensitive drafts limited to family admins or designated maintainers.

## Functional requirements

### Accounts and onboarding

- Register and sign in with email/password for the V1 baseline.
- Create a family with a name, slug, and description.
- Choose `SELF` or `PROXY` recording during onboarding.
- When using proxy mode, capture relationship to the subject, maintenance role, and evidence source.

### Family and member management

- Show family summary, member directory, recent activity, and quick actions.
- Create, view, edit, and search members within the active family.
- Store optional gender, birth/death dates, avatar, short biography, and claim status.
- Support one claimed user per member in V1.

### Relationships

- Support `PARENT_OF`, `SPOUSE_OF`, and `SIBLING_OF`.
- Preserve direction for `PARENT_OF`.
- Canonicalize symmetric spouse and sibling pairs before persistence.
- Reject self-loops and duplicate canonical relationships.
- Ensure both referenced members belong to the active family.

### Biographies and timeline

- Maintain one Markdown biography per member.
- Add member-specific timeline events with exact or approximate dates.
- Show provenance, maintenance role, visibility, creator, and updater.
- Provide a family-wide recent activity feed and a member-specific timeline.

### Graph

- Render members as custom React Flow nodes and relationships as edges.
- Support selection, zoom, pan, fit view, minimap, filters, and a member inspector.
- Open member details from a node.
- Allow relationship creation from the graph when the user has edit permission.

### Avatar upload

- Accept avatar images only in V1.
- Use a signed upload URL followed by a commit request.
- Update `avatar_url` only after storage upload succeeds.

## Permission model

The family role controls broad operations. Claimed-member ownership grants a narrow self-edit override; it does not grant permission to edit other members or manage family roles.

| Layer | Field(s) | Purpose |
| --- | --- | --- |
| Family-wide permission | app_user.family_role | Owner/admin/editor/viewer authorization |
| Member ownership | member.claimed_by_user_id | Lets a logged-in person “own” their own page |
| Provenance | created_by_id, updated_by_id | Tells who actually created or edited a row |
| Recording mode | maintenance_role | Distinguishes self-writing from 代写 and guardian-maintained records |
| Evidence source | source | Distinguishes interview, memory, self-report, import, admin-created |
| Privacy scope | visibility | Family-visible vs admin-only vs maintainer-only |

| Actor | Read graph | Create/edit members | Edit own page | Edit others’ content | Manage family roles |
| --- | --- | --- | --- | --- | --- |
| Owner | Yes | Yes | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes | Yes | Limited |
| Editor | Yes | Yes | Yes | Yes | No |
| Viewer | Yes | No | No by default | No | No |
| Claimed self-member override | Yes | Scoped | Yes | No | No |

## Information architecture

| Route | Purpose | Primary data | Primary actions |
| --- | --- | --- | --- |
| /login | Existing account entry | none | sign in |
| /register | New account entry | none | create account |
| /onboarding | First-run setup | current user state | choose self vs proxy recording |
| /families/new | Create family | user profile | create family, set slug/name |
| /families/:familyId | Family dashboard | family summary, recent timeline, member list | navigate, quick add |
| /families/:familyId/graph | Interactive graph view | members + relationships optimized for graph | inspect nodes, add relationship |
| /families/:familyId/members/new | New member form | family users, optional existing relationships | create member |
| /families/:familyId/members/:memberId | Member detail page | member, biography, timeline, relations | read, edit, upload avatar |
| /families/:familyId/members/:memberId/edit | Member edit form | member | edit identity and proxy settings |
| /families/:familyId/members/:memberId/biography/edit | Focused biography editor | biography row | save biography |
| /families/:familyId/relationships/new | Relationship form/modal route | family members | create graph edge |
| /families/:familyId/settings | Family metadata and role management | family + users | edit family settings |

## Primary workflows

### Create a family and begin proxy recording

1. Register or sign in.
2. Choose proxy recording during onboarding.
3. Enter the represented person's relationship, maintenance role, and source.
4. Create the family.
5. Create the first represented member.
6. Continue to the family dashboard or graph.

### Add and enrich a member

1. Create the member record.
2. Upload and commit an avatar if available.
3. Add or edit the Markdown biography.
4. Add timeline events.
5. Connect the member to existing family members.

### View the graph and add a relationship

1. Open the family graph.
2. Filter or fit the graph to find the relevant members.
3. Select a member and open the inspector.
4. Start relationship creation.
5. Choose the second member and relationship type.
6. Validate family scope, direction, self-loop, and canonical duplication.
7. Save and refresh the graph payload.

## Acceptance criteria

- All domain routes include and verify `familyId`.
- Read-only users cannot see edit controls or mutate records.
- Claimed members can edit their own permitted content.
- Proxy-created content visibly identifies its maintenance role and source.
- Empty, loading, validation-error, upload-progress, and permission-denied states are handled.
- Desktop, tablet, and narrow mobile layouts preserve all primary workflows.

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
