# Nextastic

Opiniated Full-stack Next.js framework.


## Isn't Next.js already a full-stack framework?

Next.js is full-stack in the sense that it let's you write backend, and frontend code. It doesn't offer a complete full-stack experience, like Laravel, Django, or Rails gives you.

If you were a solo-dev you'd still have to roll your own solutions in many cases. You can read about Taylor (creator of Laravel's) take on it on [X](https://x.com/taylorotwell/status/1791468060903096422).

## Why

Next.js missing core features has led to a rise in popularity of boilerplates in the indiemaker, and solo-dev community.

I bought one boilerplate, and I was thoroughly disappointed by the code quality. I like to ship quick, but I also like good code. These things shouldn't be mutually exclusive, so I'm building Nextastic.

### What's production-grade, anyway? 

- strongly typed
- has tests (static & automated)
- avoid vendor lock
- opt-in functionality via packages

## Design goals

- functionality should be bundled as packages
- sane defaults, but everything should be configurable