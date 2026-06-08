# RootLink API

The V1 API is family-scoped REST over JSON. It uses stable IDs, predictable resources, a consistent success envelope, and a consistent structured error envelope. The graph endpoint returns React Flow-shaped nodes and edges so the client does not reconstruct domain relationships independently.

The API design below is intentionally family-scoped and boring in the best sense of the word: predictable REST routes, JSON request and response bodies, stable IDs, and uniform error objects. The graph route returns data already shaped for React Flow so the client does not waste time on repetitive adaptation logic.

## Response envelope

```json
{
  "data": {},
  "meta": {}
}
```

## Error envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request payload is invalid.",
    "fieldErrors": {
      "fullName": "Full name is required."
    }
  }
}
```

## Endpoint summary

| Method | Path | Purpose |
| --- | --- | --- |
| POST | /api/v1/auth/register | Create account |
| POST | /api/v1/auth/login | Create session |
| POST | /api/v1/families | Create family |
| GET | /api/v1/families/:familyId | Read family dashboard summary |
| GET | /api/v1/families/:familyId/graph | Read graph payload |
| POST | /api/v1/families/:familyId/members | Create member |
| GET | /api/v1/families/:familyId/members/:memberId | Read member detail |
| PATCH | /api/v1/families/:familyId/members/:memberId | Edit member core fields |
| PUT | /api/v1/families/:familyId/members/:memberId/biography | Upsert biography |
| POST | /api/v1/families/:familyId/members/:memberId/timeline-events | Create timeline event |
| POST | /api/v1/families/:familyId/relationships | Create graph edge |
| DELETE | /api/v1/families/:familyId/relationships/:relationshipId | Remove graph edge |
| POST | /api/v1/uploads/avatar-url | Request signed avatar upload target |
| POST | /api/v1/families/:familyId/members/:memberId/avatar | Commit uploaded avatar |

## Example contract for creating a family

```http
POST /api/v1/families
Content-Type: application/json
```

```json
{
  "name": "Tang Demo Family",
  "slug": "tang-demo-family",
  "description": "Demo family space for RootLink V1."
}
```

```json
{
  "data": {
    "family": {
      "id": "8de7f8c9-9fd8-4dd4-9f21-3a568c3c7f57",
      "slug": "tang-demo-family",
      "name": "Tang Demo Family",
      "description": "Demo family space for RootLink V1.",
      "createdAt": "2026-06-08T09:00:00.000Z"
    },
    "currentUserRole": "OWNER"
  },
  "meta": {}
}
```

## Example contract for creating a member

```http
POST /api/v1/families/:familyId/members
Content-Type: application/json
```

```json
{
  "fullName": "Tang Jianguo",
  "gender": "MALE",
  "birthDate": "1958-09-24",
  "deathDate": null,
  "bioShort": "Second son of Tang Wenhao; completed military service before starting family life.",
  "maintenanceRole": "PROXY",
  "source": "INTERVIEW",
  "claimedByUserId": null
}
```

```json
{
  "data": {
    "member": {
      "id": "1e5de7a3-3e0d-45b2-b64a-9345dfc19a59",
      "familyId": "8de7f8c9-9fd8-4dd4-9f21-3a568c3c7f57",
      "fullName": "Tang Jianguo",
      "gender": "MALE",
      "birthDate": "1958-09-24",
      "deathDate": null,
      "avatarUrl": null,
      "bioShort": "Second son of Tang Wenhao; completed military service before starting family life.",
      "maintenanceRole": "PROXY",
      "source": "INTERVIEW",
      "claimedByUserId": null,
      "createdAt": "2026-06-08T09:10:00.000Z",
      "updatedAt": "2026-06-08T09:10:00.000Z"
    }
  },
  "meta": {}
}
```

## Example contract for creating a relationship

```http
POST /api/v1/families/:familyId/relationships
Content-Type: application/json
```

```json
{
  "subjectMemberId": "parent-member-uuid",
  "objectMemberId": "child-member-uuid",
  "relationshipType": "PARENT_OF",
  "startDate": null,
  "endDate": null,
  "isPrimary": true,
  "source": "FAMILY_MEMORY"
}
```

```json
{
  "data": {
    "relationship": {
      "id": "7b245c14-0dc9-4466-a04b-84b018685ff6",
      "familyId": "8de7f8c9-9fd8-4dd4-9f21-3a568c3c7f57",
      "subjectMemberId": "parent-member-uuid",
      "objectMemberId": "child-member-uuid",
      "relationshipType": "PARENT_OF",
      "startDate": null,
      "endDate": null,
      "isPrimary": true,
      "source": "FAMILY_MEMORY",
      "createdAt": "2026-06-08T09:15:00.000Z"
    }
  },
  "meta": {}
}
```

## Validation contract for duplicate or invalid relationships

```json
{
  "error": {
    "code": "RELATIONSHIP_DUPLICATE",
    "message": "This relationship already exists in canonical form.",
    "fieldErrors": {
      "subjectMemberId": "Duplicate edge.",
      "objectMemberId": "Duplicate edge."
    }
  }
}
```

```json
{
  "error": {
    "code": "RELATIONSHIP_SELF_LOOP",
    "message": "A member cannot be related to themselves with this relationship type.",
    "fieldErrors": {
      "subjectMemberId": "Invalid self-loop.",
      "objectMemberId": "Invalid self-loop."
    }
  }
}
```

## Example contract for biography upsert

```http
PUT /api/v1/families/:familyId/members/:memberId/biography
Content-Type: application/json
```

```json
{
  "contentMd": "Tang Jianguo grew up in Shandong and often talks about how military service shaped his discipline...",
  "source": "INTERVIEW",
  "maintenanceRole": "PROXY",
  "visibility": "FAMILY"
}
```

```json
{
  "data": {
    "biography": {
      "id": "b8b619d6-7b13-4d41-8eb4-6bdb0fbdc8e3",
      "memberId": "1e5de7a3-3e0d-45b2-b64a-9345dfc19a59",
      "contentMd": "Tang Jianguo grew up in Shandong and often talks about how military service shaped his discipline...",
      "source": "INTERVIEW",
      "maintenanceRole": "PROXY",
      "visibility": "FAMILY",
      "updatedAt": "2026-06-08T09:20:00.000Z"
    }
  },
  "meta": {}
}
```

## Example contract for graph payload

```http
GET /api/v1/families/:familyId/graph
Accept: application/json
```

```json
{
  "data": {
    "family": {
      "id": "8de7f8c9-9fd8-4dd4-9f21-3a568c3c7f57",
      "name": "Tang Demo Family"
    },
    "nodes": [
      {
        "id": "member-uuid-1",
        "type": "memberNode",
        "position": { "x": 0, "y": 0 },
        "data": {
          "memberId": "member-uuid-1",
          "fullName": "Tang Wenhao",
          "avatarUrl": null,
          "birthYear": 1932,
          "deathYear": 2011,
          "maintenanceRole": "ARCHIVIST",
          "bioShort": "Family elder and early migration anchor."
        }
      }
    ],
    "edges": [
      {
        "id": "relationship-uuid-1",
        "source": "parent-member-uuid",
        "target": "child-member-uuid",
        "type": "smoothstep",
        "data": {
          "relationshipId": "relationship-uuid-1",
          "relationshipType": "PARENT_OF",
          "isPrimary": true
        }
      }
    ]
  },
  "meta": {
    "layoutEngine": "dagre",
    "generatedAt": "2026-06-08T09:25:00.000Z"
  }
}
```

## Example contract for avatar upload

Because V1 supports avatar images only, a two-step upload keeps the API clean and storage-agnostic.

```http
POST /api/v1/uploads/avatar-url
Content-Type: application/json
```

```json
{
  "fileName": "avatar.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 284392
}
```

```json
{
  "data": {
    "objectKey": "families/8de7f8c9/members/1e5de7a3/avatar.jpg",
    "uploadUrl": "SIGNED_UPLOAD_URL",
    "publicUrl": "PUBLIC_ASSET_URL",
    "expiresInSec": 900
  },
  "meta": {}
}
```

After the client uploads the binary to uploadUrl, commit it to the member record:

```http
POST /api/v1/families/:familyId/members/:memberId/avatar
Content-Type: application/json
```

```json
{
  "objectKey": "families/8de7f8c9/members/1e5de7a3/avatar.jpg",
  "publicUrl": "PUBLIC_ASSET_URL"
}
```

```json
{
  "data": {
    "member": {
      "id": "1e5de7a3-3e0d-45b2-b64a-9345dfc19a59",
      "avatarUrl": "PUBLIC_ASSET_URL",
      "updatedAt": "2026-06-08T09:30:00.000Z"
    }
  },
  "meta": {}
}
```

## Cross-cutting contract rules

- Verify the authenticated user's family access before every family-scoped read or write.
- Verify that all referenced members belong to the route's `familyId`.
- Normalize symmetric relationship pairs before duplicate checks and persistence.
- Return field-level validation errors where the client can act on a specific control.
- Use ISO 8601 timestamps and `YYYY-MM-DD` date-only values.
- Do not commit an avatar URL to a member until the binary upload has succeeded.

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
