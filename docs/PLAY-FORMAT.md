# Play format

A play is a JSON object. `docs/example-play.json` is a complete working example.

## The pitch

Spots are `[across, along]` in meters.

- **Across:** 0 is the left touchline, 70 the right.
- **Along:** 0 is the try line we attack, 22 their 22, 50 halfway, 78 our 22, 100 our own try line.

So when we attack, moving forward means a **smaller** along number.

## Fields

| Field | Required | What it does |
|---|---|---|
| `name` | yes | Play name, up to 80 characters. Saving a play with the same name replaces it. |
| `frames` | yes | The steps, 2 to 30 of them. |
| `focus` | no | One-line summary shown under the name (up to 160 characters). |
| `attack` | no | `"ours"` (default) or `"opp"` when the opposition has the ball. |
| `cat` | no | Which tab: `attack`, `defense`, `breakdown`, `setpiece` or `team` (default). |
| `roles` | no | Each of our players' job, shown when someone taps them: `{"9": "Passes to the pod."}` |
| `marks` | no | Shapes drawn on the pitch (see below), up to 20. |
| `view`, `r` | no | Visible area and icon size. Leave them out and the pitch fits the players automatically. |

## Steps (`frames`)

```json
{ "pos": { "9": [20, 52], "10": [27, 56], "o10": [27, 46] }, "ball": "9", "cap": "Ruck ball. 9 is ready to pass." }
```

- `pos` — players and their spots. **Step 1 must list every player in the play.** Later steps list only the players who move.
- Players are `"1"`–`"15"` for our team and `"o1"`–`"o15"` for the opposition.
- `ball` — who has the ball (`"9"`) or where it is on the ground (`[35, 50]`). Step 1 needs one. Leave it out of later steps if it doesn't change hands.
- `cap` — the coaching caption, up to 400 characters.
- `kick: true` — the ball is kicked this step (drawn in the air).
- `throw: true` — a lineout throw, not a pass.

## Passes must go backwards

When the ball moves to a different player, the catcher must be **at least 1 m behind** the
passer: a bigger along number than the passer when we attack, smaller when the opposition
attacks. Plays that break this rule won't load, and `node tests/check-plays.mjs` reports
the exact step.

In the animation the pass is released halfway through the step, so check where the passer
is at the end of the step, not only where he started.

## Markings (`marks`)

```json
{ "type": "zone",  "x": 35, "y": 48.6, "r": 2.6, "label": "Ruck", "from": 1 }
{ "type": "scrum", "x": 20, "y": 50, "w": 6, "h": 5.5, "label": "Scrum" }
{ "type": "line",  "x1": 0, "y1": 40, "x2": 70, "y2": 40, "label": "Offside line", "from": 2, "to": 3 }
```

`from` and `to` are step numbers counted from 0, and set when the marking is shown. Labels
can be up to 40 characters.
