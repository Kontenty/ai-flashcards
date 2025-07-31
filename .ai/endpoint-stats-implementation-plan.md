# API Endpoint Implementation Plan: Statistics Endpoints

## 1. Endpoint Overview

This document outlines the implementation plan for two new REST API endpoints designed to provide statistical data to users:

- `GET /stats/tags`: Retrieves the number of flashcards per tag for the authenticated user.
- `GET /stats/performance`: Calculates and returns the user's overall flashcard review performance.

These endpoints will provide data for dashboard visualizations and user progress tracking.

## 2. Request Details

### GET /stats/tags

- **HTTP Method**: GET
- **URL Structure**: `/api/stats/tags`
- **Parameters**: None. The user is identified via the session.
- **Request Body**: None.

### GET /stats/performance

- **HTTP Method**: GET
- **URL Structure**: `/api/stats/performance`
- **Parameters**: None. The user is identified via the session.
- **Request Body**: None.

## 3. Utilized Types

The following DTOs (Data Transfer Objects) will be created in `src/types/dashboard.ts`:

```typescript
// src/types/dashboard.ts

export interface TagWithCountDto {
  tag: string;
  count: number;
}

export interface PerformanceStatsDto {
  totalReviewed: number;
  correctPercent: number;
}
```

## 4. Response Details

### GET /stats/tags

- **Success (200 OK)**:
  ```json
  [
    { "tag": "TypeScript", "count": 42 },
    { "tag": "Astro", "count": 18 }
  ]
  ```
  - **Content-Type**: `application/json`
  - **Body**: An array of `TagWithCountDto` objects.

### GET /stats/performance

- **Success (200 OK)**:
  ```json
  {
    "totalReviewed": 150,
    "correctPercent": 88.5
  }
  ```
  - **Content-Type**: `application/json`
  - **Body**: A `PerformanceStatsDto` object.

### Common Error Responses

- **401 Unauthorized**: Returned if the request is made without a valid session cookie.
- **500 Internal Server Error**: Returned for any unexpected server-side errors.

## 5. Data Flow

1.  A request hits the Astro endpoint (`/pages/api/stats/[endpoint].ts`).
2.  Astro middleware verifies the user's session. If invalid, it returns a `401`. The `user_id` is available in `Astro.locals.user.id`.
3.  The endpoint calls the corresponding method in a new `StatsService` (`src/lib/services/stats.service.ts`), passing the `user_id`.
4.  **`StatsService.getTagStats`**:
    - Executes a SQL query against the Supabase database.
    - The query joins `flashcards`, `flashcard_tags`, and `tags` tables.
    - It groups by `tags.name` and counts `flashcards.id`, filtering by the `user_id`.
5.  **`StatsService.getPerformanceStats`**:
    - Executes a SQL query against the `reviews` table (assumption based on `session.ts`).
    - The query counts the total number of entries for the `user_id`.
    - It also calculates the percentage of entries where `outcome` is `'correct'`.
6.  The service method returns the data as a DTO to the endpoint.
7.  The endpoint serializes the DTO to JSON and returns it with a `200 OK` status.

## 6. Security Considerations

- **Authentication**: All endpoints must be protected and require an authenticated user. This will be enforced by Astro middleware checking for a valid Supabase session.
- **Authorization (Data Segregation)**: All database queries within `StatsService` must be strictly filtered by `user_id`. This prevents users from accessing each other's statistics. The existing RLS policies on `flashcards` and `flashcard_tags` provide a second layer of defense.
- **Input Validation**: Not applicable as there are no input parameters.

## 7. Error Handling

- **Service Layer**: The `StatsService` methods will use `try...catch` blocks to handle potential database errors.
- **Logging**: Any caught errors will be logged using the existing `LogService`.
- **API Layer**: Endpoints will wrap service calls in `try...catch`. On error, they will log the issue and return a generic `500 Internal Server Error` response with a JSON body: `{ "message": "An unexpected error occurred." }`.

## 8. Performance Considerations

- **Database Queries**: The statistical queries can become slow with a large number of flashcards and reviews.
  - Ensure all queried columns involving `user_id` are indexed.
  - The queries should be optimized for performance.
- **Caching**:
  - The results of these endpoints are good candidates for caching.
  - A caching layer (e.g., using `CacheService` with Redis or an in-memory cache) can be implemented.
  - For `GET /stats/tags`, the cache can be invalidated whenever a flashcard's tags are modified.
  - For `GET /stats/performance`, the cache can be invalidated after each review session.

## 9. Implementation Steps

1.  **Create DTOs**: Add `TagWithCountDto` and `PerformanceStatsDto` to `src/types/dashboard.ts`.
2.  **Create `StatsService`**:
    - Create the file `src/lib/services/stats.service.ts`.
    - Implement `getTagStats(userId: string): Promise<Result<TagWithCountDto[], Error>>`. This method will contain the SQL query to count flashcards per tag.
    - Implement `getPerformanceStats(userId: string): Promise<Result<PerformanceStatsDto, Error>>`. This will query the assumed `reviews` table.
3.  **Create API Endpoint for Tags**:
    - Create the file `src/pages/api/stats/tags.ts`.
    - Implement the `GET` handler.
    - Call `StatsService.getTagStats` and return the result.
    - Ensure `prerender = false` is exported.
4.  **Create API Endpoint for Performance**:
    - Create the file `src/pages/api/stats/performance.ts`.
    - Implement the `GET` handler.
    - Call `StatsService.getPerformanceStats` and return the result.
    - Ensure `prerender = false` is exported.
5.  **Unit Tests**:
    - Add unit tests for `StatsService` to verify the logic and correctness of the database queries using mocked data.
6.  **E2E Tests**:
    - Add Playwright tests to simulate a user logging in and hitting the new endpoints.
    - Assert that the response has the correct shape and status code.
