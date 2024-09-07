# Nextastic

Toolkit for self-managed Next.js apps.

Nextastic aims to provide the tools required to run Next.js in a managed environment, just like people have been doing for PHP apps for the last 20 years:

- regular sql db
- redis cache
- file logging
- queues / jobs

### Motivation

Serverless is great, but we're starting to see some of it's downsides: astronomical usage costs, complexity in managing 3-4 separate services and vendor lock-in, lack of flexibility, performance bottlenecks.

This [tweet](https://x.com/taylorotwell/status/1791468060903096422) by Taylor (creator of Laravel) sums it up nicely: 

![CleanShot 2024-09-07 at 15 44 20@2x](https://github.com/user-attachments/assets/84f88191-bd29-4831-81c5-5db3dbdb879f)


## Design goals

- opt-in everything via packages
- avoid vendor lock-in
- favor explicit over implicit. This deviates from the convention over configuration approach that Laravel / Rails favors.
- Avoid DSL
