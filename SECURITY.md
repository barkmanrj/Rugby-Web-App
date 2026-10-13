# Security notes

Review of `index.html`, October 2026. The app is a single static page with no
server code, no third-party scripts and no player data.

## Built-in protections

- **No code injection from plays:** every piece of text from a play (names, captions, roles, labels) is inserted as plain text (`textContent`), never as HTML.
- **Strict play checks:** a play is only accepted with known fields, valid positions, spots on the pitch and backward passes. Lengths are limited (name 80, caption 400, roles 200, labels 40), as are counts (30 steps, 20 markings, 200,000 characters of pasted text). Icon size and view are held to safe ranges. Saved plays are checked again every time they load.
- **Only checked fields are stored:** saves write only allowed fields, never the raw pasted text, so unknown keys and `__proto__` tricks are dropped.
- **No third-party requests:** fonts are embedded in the page. The page has a Content Security Policy that blocks loading anything from other sites.
- **No secrets:** the page contains no keys or passwords. The coach login is deliberately not a page password, because page source is public.
- **Errors are shown, never hidden:** load failures and hidden (invalid) saved plays are reported. Nothing is logged to the console.

## On claude.ai

- Coaches are Claude accounts with **Editor** access. The play library's access rules let only editors write, and only editors can read the change history. The coach screen in the page only shows or hides buttons; the access rules are what actually block changes.
- Coach login lasts one browser tab and ends after 30 minutes without activity.
- Replaced and deleted plays are copied to a coaches-only history, tagged with the coach's account ID (not name).
- Share the page with named people (players as **Viewer**, coaches as **Editor**), and keep the public link off so the playbook stays private.

## On GitHub

- **Who can change plays:** only people with write access to the repository. Protect the `main` branch (Settings → Branches) and require the **Check plays** workflow to pass before merging.
- **Privacy:** GitHub Pages on a free plan is public. For a private playbook, use a private repository with a paid plan that supports private Pages, or host elsewhere with sign-in (below).
- **Repository settings:** turn on Dependabot alerts and secret scanning (Settings → Code security), and use two-factor authentication on every account with write access.
- The workflow runs with read-only permissions (`permissions: contents: read`).

## If hosted on AWS

- Private S3 bucket served only through CloudFront (Origin Access Control). HTTPS only, with HSTS. Send the Content Security Policy as a response header instead of a meta tag, and add `frame-ancestors 'none'`.
- Coach sign-in with Amazon Cognito (a `coaches` group, MFA on). Saves go through API Gateway with a Cognito authorizer to a Lambda that re-runs the same play checks before writing to DynamoDB.
- DynamoDB with KMS encryption, point-in-time recovery, and least-privilege IAM roles.
- AWS WAF with managed rules and a rate limit on saves. CloudTrail on, plus GuardDuty and Security Hub.
- Log account IDs and actions only, never names or tokens. Keep any future keys in Secrets Manager.
- The users are minors: collect no player data, add no analytics, and review COPPA if any players are under 13.
