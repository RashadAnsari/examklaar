-- ============================================================
-- Better Auth core schema
-- ============================================================
-- Generated with `bunx @better-auth/cli generate` against src/lib/auth.ts.
-- Do not hand-edit: regenerate after changing the Better Auth config or plugins
-- and add the diff as a new migration file.
--
-- Note: "user".id is text (Better Auth's default id is a random string, not a
-- uuid), so every user_id column in 0002_app.sql is text as well.

create table "user" (
  "id"            text        not null primary key,
  "name"          text        not null,
  "email"         text        not null unique,
  "emailVerified" boolean     not null,
  "image"         text,
  "createdAt"     timestamptz not null default current_timestamp,
  "updatedAt"     timestamptz not null default current_timestamp
);

create table "session" (
  "id"        text        not null primary key,
  "expiresAt" timestamptz not null,
  "token"     text        not null unique,
  "createdAt" timestamptz not null default current_timestamp,
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId"    text        not null references "user" ("id") on delete cascade
);

create table "account" (
  "id"                    text        not null primary key,
  "accountId"             text        not null,
  "providerId"            text        not null,
  "userId"                text        not null references "user" ("id") on delete cascade,
  "accessToken"           text,
  "refreshToken"          text,
  "idToken"               text,
  "accessTokenExpiresAt"  timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope"                 text,
  "password"              text,
  "createdAt"             timestamptz not null default current_timestamp,
  "updatedAt"             timestamptz not null
);

create table "verification" (
  "id"         text        not null primary key,
  "identifier" text        not null,
  "value"      text        not null,
  "expiresAt"  timestamptz not null,
  "createdAt"  timestamptz not null default current_timestamp,
  "updatedAt"  timestamptz not null default current_timestamp
);

create index "session_userId_idx" on "session" ("userId");
create index "account_userId_idx" on "account" ("userId");
create index "verification_identifier_idx" on "verification" ("identifier");
