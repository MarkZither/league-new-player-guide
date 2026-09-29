<!-- BEGIN:nextjs-agent-rules -->
# League New Player Guide - Agent Instructions

## Project

This project is a simple web application designed to help new League of Legends
players choose a champion and understand suitable item builds.

The project is also being used as a learning exercise for a software development
intern. Prefer solutions that are clear, understandable and easy to explain over
unnecessarily sophisticated implementations.

## Technology

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vercel for hosting and deployment
- Git for source control

## Development Principles

Keep the application simple.

Prefer:

- Small, understandable components.
- Strong TypeScript types.
- Clear names over clever abstractions.
- Server components where appropriate.
- Existing framework capabilities over additional dependencies.
- Code that a junior developer can reasonably understand.
- Incremental changes that can be reviewed in a pull request.

Avoid:

- Unnecessary dependencies.
- Premature abstractions.
- Large refactoring unrelated to the requested change.
- Introducing databases, authentication or additional infrastructure unless
  required by a backlog item.
- Hard-coding data that is readily available from the agreed League data source.

## Application Structure

The initial application should support a simple journey:

1. Browse champions.
2. Search or filter champions.
3. Select a champion.
4. View basic champion information.
5. View a recommended item build.

Features should be implemented incrementally. Do not attempt to build the entire
application when working on a single backlog item.

## League Data

Prefer official Riot/League data sources where suitable.

Keep external data access separate from presentation components so that the
source or implementation can be changed without rewriting the UI.

Do not introduce API keys, credentials or secrets into source control.

## UI

The target user is someone new to League of Legends.

The interface should therefore be:

- Simple.
- Visually clear.
- Responsive.
- Easy to navigate.
- Appropriate for someone who does not understand League terminology.

When displaying game-specific terminology, provide sufficient context for a
new player to understand it.

## Testing

New functionality should be testable.

When implementing a backlog item:

1. Consider its acceptance criteria.
2. Implement the smallest change that satisfies them.
3. Run the existing checks and tests.
4. Add or update tests where appropriate.
5. Ensure the application builds successfully before considering the work complete.

## Source Control

Work should correspond to an Azure DevOps backlog item wherever practical.

Keep commits:

- Small.
- Focused.
- Descriptively named.

Do not commit generated build output, credentials, local configuration or secrets.

## Working With This Version of Next.js

This project may use a newer version of Next.js than the agent knows from its
training data.

Before changing Next.js-specific code:

1. Check the installed Next.js version.
2. Read the relevant documentation in `node_modules/next/dist/docs/`.
3. Follow the APIs and conventions documented by the installed version.
4. Heed deprecation notices.
5. Do not assume older Next.js patterns remain valid.

When general knowledge conflicts with the documentation shipped with the
installed framework, the installed documentation takes precedence.

## Before Making a Change

First:

1. Understand the requested backlog item.
2. Inspect the existing implementation.
3. Identify the smallest sensible change.
4. Check relevant local framework documentation where necessary.
5. Explain the intended approach if the change is significant.

Then implement it.

## Definition of Done

A change is complete when:

- The acceptance criteria are satisfied.
- TypeScript compiles without errors.
- Relevant tests pass.
- The application builds successfully.
- No secrets or credentials have been introduced.
- The implementation is understandable and proportionate to the requirement.
<!-- END:nextjs-agent-rules -->
