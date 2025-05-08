# REST API Plan

## 1. Resources

- Flashcards (`flashcards` table)
- Tags (`tags` table)
- Reviews (`flashcard_tags` as assignment, SM-2 logic stored/updated in `flashcards`)
- Statistics (views: `tag_statistics`, `card_performance`)

## 2. Endpoints

### Authentication (Supabase Auth)

- Method: POST
  Path: /auth/register
  Description: Register a new user with email, password, and RODO acceptance
  Request JSON:
  {
  "email": "string",
  "password": "string",
  "rodo_accepted": true
  }
  Response 201:
  { "user": { "id": "UUID", "email": "string" }, "access_token": "JWT" }
  Errors:
  400 Invalid email/password format or missing RODO

- Method: POST
  Path: /auth/login
  Description: Login user and issue JWT
  Request JSON:
  { "email": "string", "password": "string" }
  Response 200:
  { "access_token": "JWT", "user": { "id": "UUID" } }
  Errors:
  401 Invalid credentials

### Flashcards

- Method: GET
  Path: /flashcards
  Description: List user flashcards with pagination, filtering by tag(s), and full-text search
  Query Parameters:
  page (int, default=1), pageSize (int, default=20), tags (UUID[]), search (string)
  Response 200:
  {
  "items": [ { "id": "UUID", "front": "string", "back": "string", "tags": ["string"], "next_review_date": "date" } ],
  "pagination": { "page": 1, "pageSize": 20, "total": 100 }
  }

- Method: POST
  Path: /flashcards
  Description: Create a new flashcard manually or accept generated AI suggestion
  Request JSON:
  {
  "front": "string (<=200)",
  "back": "string (<=500)",
  "tagIds": ["UUID"]
  }
  Response 201:
  { "id": "UUID", "front": "string", "back": "string", "tags": ["string"], "next_review_date": "date" }
  Errors:
  400 Validation errors (length, missing fields)

- Method: GET
  Path: /flashcards/{id}
  Description: Retrieve single flashcard with tags
  Response 200:
  { "id": "UUID", "front": "string", "back": "string", "tags": ["string"], "created_at": "timestamp", "updated_at": "timestamp" }
  Errors:
  404 Not found or unauthorized

- Method: PUT
  Path: /flashcards/{id}
  Description: Update front/back or tags of a flashcard
  Request JSON: same as POST /flashcards
  Response 200: updated flashcard
  Errors:
  400 Validation errors, 404 Not found

- Method: DELETE
  Path: /flashcards/{id}
  Description: Delete a flashcard
  Response 204 No content
  Errors:
  404 Not found

### AI Generation

- Method: POST
  Path: /flashcards/generate
  Description: Generate up to N flashcards via AI based on input text (≤5000 chars)
  Request JSON:
  { "text": "string (<=5000)" }
  Response 200:
  { "suggestions": [ { "front": "string", "back": "string" } ] }
  Errors:
  400 Text too long, 502 AI service error

### Tags

- Method: GET
  Path: /tags
  Description: List or search global tags
  Query: search (string)
  Response 200: [ { "id": "UUID", "name": "string" } ]

- Method: POST
  Path: /tags
  Description: Create a new tag
  Request JSON: { "name": "string" }
  Response 201: created tag
  Errors: 400 Duplicate name

- Method: PUT
  Path: /tags/{id}
  Description: Update tag name
  Request JSON: { "name": "string" }
  Response 200: updated tag

- Method: DELETE
  Path: /tags/{id}
  Description: Delete tag (cascades removal from flashcards)
  Response 204

### Reviews (SM-2)

- Method: GET
  Path: /reviews/session
  Description: Fetch due flashcards for today's review
  Response 200:
  { "cards": [ { "id": "UUID", "front": "string", "interval": int, "ease_factor": numeric } ] }
  Errors: 204 No cards due

- Method: POST
  Path: /reviews
  Description: Submit review result for a flashcard
  Request JSON:
  { "flashcardId": "UUID", "rating": 0–5 }
  Response 200:
  { "flashcardId": "UUID", "nextReviewDate": "date", "interval": int, "easeFactor": numeric }
  Errors:
  400 Invalid rating, 404 Flashcard not found

### Statistics

- Method: GET
  Path: /stats/tags
  Description: Get number of flashcards per tag
  Response 200: [ { "tag": "string", "count": int } ]

- Method: GET
  Path: /stats/performance
  Description: Get overall correct percentage and counts
  Response 200:
  { "totalReviewed": int, "correctPercent": float }

## 3. Authentication and Authorization

- JWT bearer tokens managed by Supabase Auth
- All /flashcards, /reviews, /stats, /tags (write) endpoints require Authorization: Bearer <token>
- RLS policies on `flashcards` and `flashcard_tags` enforce per-user access (see db-plan.md)

## 4. Validation and Business Logic

- Input constraints:
  • front: non-empty, max 200 chars
  • back: non-empty, max 500 chars
  • AI text input: max 5000 chars
  • rating: integer 0–5
- Business logic:
  • AI suggestions not persisted until POST /flashcards
  • SM-2 algorithm updates `interval`, `ease_factor`, and `next_review_date`
  • Tag assignment updates `flashcard_tags` join table
  • Full-text search leverages GIN index on `tsv`
