# Nextastic

Toolkit for self-managed Next.js apps.

Serverless is great, but we're starting to see some of it's downsides: astronomical usage costs, complexity in managing 3-4 separate services and vendor lock-in, lack of flexibility, performance bottlenecks.

Nextastic aims to provide the tools required to run Next.js in a managed environment, just like people have been doing for PHP apps for the last 20 years:

- regular sql db
- redis cache
- file logging
- queues / jobs


## Design goals

- opt-in everything via packages
- avoid vendor lock-in
- favor explicit over implicit. This deviates from the convention over configuration approach that Laravel / Rails favors.
- Avoid DSL
