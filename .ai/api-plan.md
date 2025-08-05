# REST API Plan

This document outlines the REST API for the 10xFlashCards application, based on the database schema, product requirements, and tech stack.

## 1. Resources

- **Flashcards**: Represents individual flashcards. Corresponds to the `flashcards` table.
- **Tags**: Represents tags used to categorize flashcards. Corresponds to the `tags` table.
- **Reviews**: Represents the user's review sessions and individual card reviews based on the SM-2 algorithm. This is a logical resource that interacts with the `flashcards` and `flashcard_reviews` tables and the `process_flashcard_review` database function.
- **Statistics**: Represents user performance and content-related data, derived from database views like `daily_review_stats`.

## 2. Endpoints

### Authentication (Supabase Auth)

- Method: POST
  Path: /auth/register
  Description: Register a new user with email, password, and RODO acceptance
  Request JSON:
- Method: POST
  Path: /auth/login
  Description: Login a user with email, password
  Request JSON:
- Method: POST
  Path: /auth/logout
  Description: Logout a user
  Request JSON:
  Endpoints are managed by Supabase Auth.

---

### Flashcards

#### List Flashcards

- **Method**: `GET`
- **Path**: `/api/flashcards`
- **Description**: Retrieves a paginated list of the user's flashcards. Supports filtering by tags, full-text search, and sorting.
- **Query Parameters**:
  - `page` (integer, default: 1): The page number for pagination.
  - `pageSize` (integer, default: 20): The number of items per page.
  - `tags` (string[], comma-separated UUIDs): Filters flashcards that have all the specified tags.
  - `search` (string): Performs a full-text search on the `front` and `back` fields.
  - `orderBy` (string, e.g., `created_at:desc`): Sorts the results. To get the 5 newest cards, use `orderBy=created_at:desc` and `pageSize=5`.
- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "front": "string",
        "back": "string",
        "next_review_date": "date",
        "tags": [{ "id": "uuid", "name": "string" }]
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 100,
      "totalPages": 5
    }
  }
  ```

#### Create Flashcard

- **Method**: `POST`
- **Path**: `/api/flashcards`
- **Description**: Creates a new flashcard.
- **Request JSON**:
  ```json
  {
    "front": "string",
    "back": "string",
    "tagIds": ["uuid"]
  }
  ```
- **Response `201 Created`**: The newly created flashcard object.
  ```json
  {
    "id": "uuid",
    "front": "string",
    "back": "string",
    "next_review_date": "date",
    "tags": [{ "id": "uuid", "name": "string" }]
  }
  ```
- **Errors**:
  - `400 Bad Request`: Validation errors (e.g., missing fields, length constraints).

#### Get Single Flashcard

- **Method**: `GET`
- **Path**: `/api/flashcards/{id}`
- **Description**: Retrieves a single flashcard by its ID.
- **Response `200 OK`**:
  ```json
  {
    "id": "uuid",
    "front": "string",
    "back": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "tags": [{ "id": "uuid", "name": "string" }]
  }
  ```
- **Errors**:
  - `404 Not Found`: If the flashcard does not exist or the user is not authorized to view it.

#### Update Flashcard

- **Method**: `PUT`
- **Path**: `/api/flashcards/{id}`
- **Description**: Updates the content or tags of an existing flashcard.
- **Request JSON**:
  ```json
  {
    "front": "string",
    "back": "string",
    "tagIds": ["uuid"]
  }
  ```
- **Response `200 OK`**: The updated flashcard object.
- **Errors**:
  - `400 Bad Request`: Validation errors.
  - `404 Not Found`: If the flashcard does not exist.

#### Delete Flashcard

- **Method**: `DELETE`
- **Path**: `/api/flashcards/{id}`
- **Description**: Deletes a flashcard.
- **Response `204 No Content`**.
- **Errors**:
  - `404 Not Found`: If the flashcard does not exist.

---

### AI Generation

#### Generate Flashcard Suggestions

- **Method**: `POST`
- **Path**: `/api/flashcards/generate`
- **Description**: Generates flashcard suggestions from a given text using an AI service. These suggestions are not persisted until manually created via `POST /api/flashcards`.
- **Request JSON**:
  ```json
  {
    "text": "string"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "suggestions": [{ "front": "string", "back": "string" }]
  }
  ```
- **Errors**:
  - `400 Bad Request`: If the text exceeds the character limit (5000 chars).
  - `429 Too Many Requests`: If rate limits are exceeded.
  - `502 Bad Gateway`: If the external AI service fails.

---

### Tags

#### List Tags

- **Method**: `GET`
- **Path**: `/api/tags`
- **Description**: Retrieves a list of all tags created by the user. Supports searching.
- **Query Parameters**:
  - `search` (string): Filters tags by name.
- **Response `200 OK`**:
  ```json
  [{ "id": "uuid", "name": "string" }]
  ```

#### Create Tag

- **Method**: `POST`
- **Path**: `/api/tags`
- **Description**: Creates a new tag.
- **Request JSON**:
  ```json
  { "name": "string" }
  ```
- **Response `201 Created`**: The newly created tag object.
- **Errors**:
  - `400 Bad Request`: Validation errors (e.g., name too long).
  - `409 Conflict`: If a tag with the same name already exists for the user.

#### Update Tag

- **Method**: `PUT`
- **Path**: `/api/tags/{id}`
- **Description**: Updates a tag's name.
- **Request JSON**:
  ```json
  { "name": "string" }
  ```
- **Response `200 OK`**: The updated tag object.
- **Errors**:
  - `404 Not Found`: If the tag does not exist.
  - `409 Conflict`: If renaming to a name that already exists.

#### Delete Tag

- **Method**: `DELETE`
- **Path**: `/api/tags/{id}`
- **Description**: Deletes a tag. The `ON DELETE CASCADE` constraint in the database will also remove all associations of this tag with flashcards.
- **Response `204 No Content`**.
- **Errors**:
  - `404 Not Found`: If the tag does not exist.

---

### Reviews (SM-2 Algorithm)

#### Get Review Session

- **Method**: `GET`
- **Path**: `/api/reviews/session`
- **Description**: Fetches a list of flashcards due for review for the current day (`next_review_date <= CURRENT_DATE`).
- **Response `200 OK`**:
  ```json
  {
    "cards": [
      {
        "id": "uuid",
        "front": "string",
        "back": "string"
      }
    ]
  }
  ```
  _Note: If no cards are due, an empty `cards` array is returned._

#### Submit a Flashcard Review

- **Method**: `POST`
- **Path**: `/api/flashcards/{id}/review`
- **Description**: Submits the result of a single flashcard review. This action calls the `process_flashcard_review` database function, which updates the card's SM-2 parameters (`interval`, `ease_factor`, `next_review_date`) and logs the review in the `flashcard_reviews` table.
- **Request JSON**:
  ```json
  {
    "quality": 4
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Review processed successfully."
  }
  ```
- **Errors**:
  - `400 Bad Request`: If `quality` is not an integer between 0 and 5.
  - `404 Not Found`: If the flashcard does not exist.

---

### Statistics

#### Get User Performance Statistics

- **Method**: `GET`
- **Path**: `/api/stats/performance`
- **Description**: Retrieves performance statistics for the user, including daily review stats for the current week. The statistics are derived from the `get_performance_stats` view, which provides total reviews and the percentage of correct answers.
- **Response `200 OK`**:
  ```json
  {
    "total_reviews": 250,
    "correct_percentage": 88.5,
    "daily_stats": [
      {
        "review_date": "date",
        "cards_reviewed": 15,
        "mean_quality": 4.25
      }
    ]
  }
  ```

#### Get Tag Statistics

- **Method**: `GET`
- **Path**: `/api/stats/tags`
- **Description**: Retrieves statistics about tag usage. The response can be customized by the `include` query parameter.
- **Query Parameters**:
  - `include` (string, e.g., `total_tags,by_tag`): A comma-separated list of fields to include in the response. Possible values are `total_tags` and `by_tag`. If omitted, all fields are returned.
- **Response `200 OK`**:
  ```json
  {
    "total_tags": 12,
    "by_tag": [
      {
        "tag_id": "uuid",
        "tag_name": "TypeScript",
        "card_count": 42
      }
    ]
  }
  ```
  _Example: `GET /api/stats/tags?include=total_tags` would return `{"total_tags": 12}`._

## 3. Authentication and Authorization

- **Authentication**: All endpoints (except auth-related ones) require a `Authorization: Bearer <JWT>` header. The JWT is issued by Supabase Auth upon user login/registration.
- **Authorization**: Access control is enforced at the database level using PostgreSQL Row-Level Security (RLS) policies. All queries are automatically scoped to the authenticated user (`auth.uid()`), ensuring users can only access their own data. The API backend passes the user's JWT to Supabase, which handles the RLS enforcement.

## 4. Validation and Business Logic

### Input Validation

- **Flashcard `front`**: Required, max 200 characters.
- **Flashcard `back`**: Required, max 500 characters.
- **Tag `name`**: Required, max 50 characters, unique per user.
- **AI Generation `text`**: Required, max 5000 characters.
- **Review `quality`**: Required, integer between 0 and 5.

### Business Logic

- **AI Suggestions**: Suggestions from `POST /api/flashcards/generate` are transient and not persisted in the database. The user must explicitly create a flashcard from a suggestion using `POST /api/flashcards`.
- **SM-2 Algorithm**: The core SM-2 logic is encapsulated within the `process_flashcard_review(p_flashcard_id, p_quality)` PostgreSQL function. The `POST /api/flashcards/{id}/review` endpoint is a thin wrapper that invokes this function.
- **Tagging**: Assigning tags to a flashcard is handled by creating/deleting records in the `flashcard_tags` join table.
- **Full-Text Search**: The `search` query parameter on `GET /api/flashcards` utilizes the GIN index on the `tsv` column for efficient searching.
- **Rate Limiting**: The `POST /api/flashcards/generate` endpoint should be protected with rate limiting to prevent abuse and manage AI service costs. This will be implemented in the application middleware.
