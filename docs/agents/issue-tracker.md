# Issue tracker: Local Markdown

Issues and specs live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`.
- Specs live at `.scratch/<feature-slug>/spec.md`.
- Implementation tickets live at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`, one file per ticket.
- Record triage state in a `Status:` line near the top, using the roles in `triage-labels.md`.
- Append conversation under a `## Comments` heading.

## Publishing and fetching

To publish, create the appropriate spec or ticket file using these conventions.
To fetch a ticket, read its referenced file.

## Wayfinding operations

- Map: `.scratch/<effort>/map.md`, containing Notes, Decisions-so-far, and Fog.
- Child tickets: `.scratch/<effort>/issues/NN-<slug>.md`.
- Record ticket type in `Type:`: `research`, `prototype`, `grilling`, or `task`.
- For wayfinding tickets, use `Status: open`, `claimed`, or `resolved`.
- Record dependencies in `Blocked by: NN, NN`. A ticket is unblocked when all listed tickets are resolved.
- Select the lowest-numbered open, unblocked, unclaimed ticket.
- Claim it by saving `Status: claimed` before starting work.
- Resolve it by appending an `## Answer`, setting `Status: resolved`, and adding a gist plus link to the map's Decisions-so-far.
