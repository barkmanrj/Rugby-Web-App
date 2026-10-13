# Rugby Play Animator

Animated rugby union (15s) plays for players to study on their phones and iPads.
Each player is a numbered icon (1–15 for our team, white icons for the opposition).
Players press play or swipe through each step, read the coaching caption, and tap
any number to trace that player's path and see their job.

## What's included

| Area | Plays |
|---|---|
| Attack shape | 1-3-3-1 pod shape · Support lines on a break |
| Defense | Drift defense from a scrum · Defending from a ruck |
| Breakdown | Who joins the ruck (with a 1-2-3 pod) |
| Set pieces & kicks | Lineout catch and drive · Kick-off chase |
| Team plays | Your own plays, from `team-plays.json` |

Every pass in every play goes backwards. A check enforces this (see **Checks** below).

## Files

```
index.html                  The whole app: HTML, CSS, JavaScript and fonts in one file
team-plays.json             Your team's own plays (starts empty)
docs/PLAY-FORMAT.md         How to write a play
docs/example-play.json      A complete example play to copy
tests/check-plays.mjs       Checks every play for forward passes and mistakes
.github/workflows/          Runs the check on GitHub every time you push
SECURITY.md                 Security review notes and hosting guidance
LICENSE-FONTS.txt           License for the embedded Barlow fonts (SIL OFL 1.1)
```

There is no build step and nothing to install. The page loads nothing from other
websites: no libraries, no trackers, no font services.

## Run it on your computer

Open `index.html` in a browser. The standard plays work straight away.

To see plays from `team-plays.json`, the page has to be served rather than opened
as a file (browsers block reading files beside a page opened from disk):

```bash
cd rugby-play-animator
python3 -m http.server 8000
# then open http://localhost:8000
```

## Publish it with GitHub Pages

1. Create a new repository on GitHub and upload these files (keep the folder structure,
   including the hidden `.github` folder).
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
4. After a minute, the site is live at `https://<your-account>.github.io/<repository-name>/`.

Share that link with players. Note that a GitHub Pages site on a free plan is public:
anyone with the link can see your plays. See SECURITY.md for private options.

## Add your team's plays

Plays live in `team-plays.json` as a list:

```json
[
  { "name": "12 crash ball", "frames": [ ... ] },
  { "name": "Lineout to the back", "frames": [ ... ] }
]
```

1. Copy `docs/example-play.json` as a starting point and read `docs/PLAY-FORMAT.md`.
2. Add the play to the list in `team-plays.json` and commit.
3. GitHub runs the play check automatically. A red ✗ on the commit means a play has a
   problem; open the check to see which step and why.
4. Once the check is green, the play appears in the **Team plays** tab.

Only people with write access to the repository can change plays, and GitHub keeps
the full history of every change, so any edit can be undone.

## Two ways to run the app

The same `index.html` runs in two places:

| | On claude.ai (current home) | On GitHub Pages or any web host |
|---|---|---|
| Standard plays | ✓ | ✓ |
| Team plays come from | Shared play library in the page | `team-plays.json` in the repository |
| Coaches add plays | Coach login → Add a play | Edit `team-plays.json` and commit |
| Who can change plays | Claude accounts with Editor access | People with write access to the repo |
| Change history | Kept in the page's play history | Git history |

The coach login and in-page play editor only work on claude.ai, because they rely on
its sign-in and storage. Elsewhere, the Coach area tells coaches to edit
`team-plays.json` instead.

## Checks

```bash
node tests/check-plays.mjs
```

Needs Node.js 18 or newer and nothing else. It checks every built-in play and every
play in `team-plays.json` and fails if:

- a pass goes forward or flat (the catcher must be at least 0.5 m behind the passer)
- a player appears in a later step without a starting spot in step 1
- a player number isn't 1–15 or o1–o15, or a spot is off the pitch
- a play has no name, fewer than 2 steps, more than 30 steps, or no ball in step 1

## Editing the app

Everything is in `index.html`:

- **Colors:** CSS variables at the top of the main `<style>` block. Our team's jersey is `--jersey`; buttons and highlights use `--accent`.
- **Built-in plays:** the `BUILTIN` list in the script. Each play uses the same format as `team-plays.json`.
- **Positions and names:** the `POS` list.

## License

The Barlow and Barlow Condensed fonts embedded in `index.html` are © The Barlow Project
Authors under the SIL Open Font License 1.1 (see `LICENSE-FONTS.txt`).
No license has been chosen for the app's own code yet; add a `LICENSE` file if you
want others to be able to reuse it.
