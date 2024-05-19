# Nextastic

Flexible full-stack Next.js toolkit. 

Bringing you batteries-included features you're used to from Laravel, Django, and Rails to Next.js.

## Isn't Next.js already a full-stack?

Next.js is full-stack in the sense that it let's you write backend, and frontend code. It doesn't offer a complete full-stack experience, like Laravel, Django, or Rails gives you.

If you were a solo-dev you'd still have to roll your own solutions in many cases. You can read about Taylor (creator of Laravel's) take on it on [X](https://x.com/taylorotwell/status/1791468060903096422).

## Why

Next.js missing core features has led to a rise in popularity of boilerplates in the indiemaker, and solo-dev community.

I bought a boilerplate, and was pretty disappointed by the code quality. I like to ship quick, but I also like good code. These things shouldn't be mutually exclusive, so I'm building Nextastic.

### What's production-grade, anyway? 

- Built-in support for features required to run production apps: queues, caching, auth, validation, logging etc.
- strongly typed
- has tests (static & automated)

## Design goals

- opt-in everything via packages
- avoid vendor lock-in
- favor explicit over implicit. This deviates from the convention over configuration approach that Laravel / Rails favors.
- Avoid DSL
- Copy-paste instead of generators
