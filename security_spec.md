# Cholesterol Tracker - Security Specification

This document details the Zero-Trust security layout, data invariants, and validation cases for our Firebase Firestore instance.

## 1. Data Invariants

- **Isolated Access**: A user is only authorized to read or write their own user profile document `/users/{userId}` where `{userId}` matches their authenticated UID.
- **Sub-Collection Isolation**: A user is only authorized to write, read, or list cholesterol logs under `/users/{userId}/logs/{logId}` if and only if `{userId}` matches their authenticated UID.
- **Server Timestamps**: `createdAt` and `updatedAt` must sync to the system transaction timestamp.
- **Data Boundaries**: Type verification and limits are strictly enforced on client fields (e.g., values must be standard numbers representing blood metrics).

## 2. The "Dirty Dozen" Malicious Payloads Checked by Security Audit

We test the following 12 bypass attempts to verify we block them at the Firestore layer:
1. **Unauthenticated Read Profile**: Request from unregistered user attempting to read profile.
2. **Unauthenticated Write Log**: Unregistered user attempting to save a cholesterol value.
3. **Identity Spoofing Profile**: User `A` trying to write a profile at `/users/B`.
4. **Identity Spoofing Log**: User `A` trying to add a log at `/users/B/logs/log1`.
5. **Malformed Fields In Profiles**: Submitting a user profile without required fields (e.g., missing gender).
6. **Negative Value Lab Ranges**: Attempting to upload total cholesterol < 0 or > 1000.
7. **Bypassing Immutable Keys**: Attempting to modify `createdAt` during a log update.
8. **Junk ID Poisoning**: Trying to write to an ID path structured with extremely large strings containing harmful symbols.
9. **Fake Email Admin Escalation**: Trying to gain admin access with unverified or mock email credentials.
10. **State Shortcutting via Partial Update**: Writing partial values to critical profiles that bypass constraints.
11. **Client-Provided Timestamps**: Supplying historic dates as transaction timestamps instead of server-mandated ones.
12. **Blanket Query Scraping**: Attempting a generic collection group query to retrieve logs from all users.

## 3. Test Runner Definition

The rules file (`firestore.rules`) incorporates validation helpers to address these 12 vectors. We deploy and verify these under Phase 4 and Phase 5 rules.
