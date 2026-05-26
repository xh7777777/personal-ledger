---
name: personal-ledger-user
description: Use this skill when helping a Personal Ledger end user with natural-language bookkeeping tasks: recording income or expenses, checking balances and spending, using templates, creating scheduled ledger entries, and exporting the local ledger. It is for operating or explaining the app as a user, not for changing the codebase.
---

# Personal Ledger User Workflow

This skill helps with day-to-day use of the Personal Ledger app. Prefer the running local API. Use direct JSON access only for read-only fallback when the API is unavailable.

## Data Access

- Primary API base: `http://127.0.0.1:4173`.
- Read state with `GET /api/state`.
- Export backup data with `GET /api/state/export`.
- Create transactions with `POST /api/transactions`.
- Create templates with `POST /api/templates`.
- Create scheduled entries with `POST /api/schedules`.
- If the API is unavailable, read `data/state.json` only for lookup/analysis and tell the user scheduled entries may not have been materialized.
- Do not write directly to `data/state.json` unless the user explicitly asks to bypass the API and accepts the risk.

## Safety Rules

- Confirm before any write operation: create, edit, or delete accounts, transactions, templates, or schedules.
- Before writing, restate the exact action: type, amount, account, date/frequency, category, target, and note when present.
- If required details are missing, ask for them before writing.
- For deletes, mention the consequence:
  - deleting a transaction restores the account balance;
  - deleting a template does not affect historical transactions;
  - deleting a schedule does not delete transactions already generated.

## Recording a Transaction

Extract these fields from the user request:

- `type`: `income` or `expense`
- `amount`
- `accountId`: match by account name from `/api/state`
- `date`: default to today if the user says today or omits date
- `category`: default to `未分类` when omitted
- `target`: merchant, person, source, or purpose when provided
- `note`: optional

After confirmation, call `POST /api/transactions` with the payload. Then reload `/api/state` and report the created transaction plus updated account balance.

## Querying and Analysis

For balance, recent transactions, category totals, or date-range questions:

1. Read `/api/state`.
2. Filter transactions by date, type, account, category, target, or note as requested.
3. Sum income and expenses separately; report net as income minus expense.
4. Use stored `currentBalance` for account balance questions.

Keep answers concise and include the date range used.

## Templates and Quick Entry

- Existing templates are in `state.templates`.
- Suggest templates when a requested transaction resembles one.
- To create a template, confirm name, type, amount, account, category, target, and note, then call `POST /api/templates`.
- A template only pre-fills future entries; it never creates transactions by itself.

## Scheduled Entries

Scheduled entries are for automatic recurring income or expense.

Required fields:

- `type`: `income` or `expense`
- `amount`
- `accountId`
- `frequency`: `daily`, `weekly`, or `monthly`
- `startDate`
- `category`: default `未分类`

After confirmation, call `POST /api/schedules`. Explain that due schedules are materialized when the app/API reads state.

## Exporting

For backup/export requests, call `GET /api/state/export` when the API is available. Exporting does not change ledger data.
