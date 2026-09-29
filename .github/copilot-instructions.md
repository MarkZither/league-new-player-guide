# Copilot Instructions

## Project Purpose

This is a one-week intern software development project.

We are building a website that helps new League of Legends players:

- Understand the different lanes and roles.
- Discover champions suitable for each lane.
- Identify beginner-friendly champions.
- View recommended item builds for champions.
- Understand why a champion or item build might be suitable.

The purpose of the project is both to build a useful application and to teach professional software development practices.

Follow the technical Next.js guidance defined in `AGENTS.md`.

## Development Environment

The application is:

- Next.js
- React
- TypeScript
- Hosted on Vercel
- Developed collaboratively using Azure DevOps
- Stored in Git with Azure DevOps as the intern's primary remote

Do not modify Git remotes, Vercel configuration, deployment configuration or credentials unless explicitly asked.

## Project Ownership

The intern is primarily responsible for application development and populating the League of Legends domain data.

This includes:

- Champions
- Lanes and roles
- Beginner suitability
- Champion recommendations
- Item information
- Recommended item builds

Hosting, deployment configuration and Vercel administration are managed by the project owner.

## League Data

Represent League of Legends information as structured data rather than embedding it throughout React components.

Keep separate:

1. Source/domain data
2. Recommendation and business logic
3. User interface and presentation

For example:

    Champion data
        ↓
    Recommendation logic
        ↓
    React components

Do not invent factual League of Legends information.

Distinguish between factual game data and our own beginner recommendations.

## Champion Recommendations

A champion does not have a single fixed lane or item build.

Separate objective champion information from our opinionated recommendations.

A recommendation represents playing a particular champion in a particular lane or role and may contain:

- Beginner suitability
- Difficulty
- Play style
- Recommended item build
- Explanation of why the combination is recommended

Item builds belong to a champion/lane recommendation rather than intrinsically to the champion.

The initial dataset should be deliberately curated rather than attempting to cover every possible champion and lane combination.

The application should favour useful recommendations for new players over exhaustive coverage.

## Scope

This is a one-week project.

Prefer simple, understandable solutions.

Do not introduce unnecessary:

- Databases
- Authentication
- Microservices
- State-management frameworks
- Infrastructure
- Architectural abstractions
- Dependencies

Structured TypeScript or JSON data is perfectly acceptable where it meets the requirement.

Architecture should evolve only when a requirement justifies it.

## Development Workflow

Work should normally follow:

    Azure DevOps PBI / Task
            ↓
    Feature branch
            ↓
    Implement small change
            ↓
    Test locally
            ↓
    Commit
            ↓
    Push to Azure DevOps
            ↓
    Pull Request
            ↓
    Code review
            ↓
    Merge

Do not commit directly to `main` unless explicitly instructed.

Keep commits small and focused.

Do not include unrelated refactoring with a feature or bug fix.

## Security

Never commit:

- Passwords
- API keys
- Personal Access Tokens
- Vercel tokens
- Private keys
- Secrets
- `.env` files containing secrets

Do not connect external services directly to the Azure DevOps repository without explicit approval.

If credentials or security configuration appear to be required, explain what is required rather than bypassing the control.

## Working With the Intern

Copilot is acting as a development assistant, not as a replacement for understanding the work.

When implementing something:

1. Understand the requirement.
2. Inspect the existing implementation.
3. Briefly explain the proposed approach.
4. Prefer a small, focused change.
5. Preserve unrelated existing behaviour.
6. State important assumptions.
7. Do not invent requirements.
8. Avoid unrelated refactoring.
9. Explain unfamiliar concepts.
10. Produce code the intern can understand and explain.

If a requirement is too large, suggest breaking it into smaller pieces.

Do not generate a large implementation when a smaller incremental change would demonstrate the concept.

## Definition of Done

Before considering work complete:

- The requirement is implemented.
- The application builds.
- Relevant tests pass.
- The change has been manually checked where appropriate.
- There are no obvious TypeScript or lint errors.
- No credentials or secrets have been introduced.
- Unrelated code has not been changed.
- The implementation is understandable.
- The change is ready for Pull Request review.

## Guiding Principle

Optimise for learning and good engineering rather than maximum code generation.

The intern should be able to explain the code that is committed to the repository.