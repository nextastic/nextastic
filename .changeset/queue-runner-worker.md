---
'@nextastic/queue': minor
---

`work()` gets what the shared worker box needs:

- Each job runs in a context with its id, name, queue and attempt. Lines from
  `log()`, the logger and `console` inside a job carry these fields.
- With `QUEUE_RUNNER_HEARTBEAT_URL` set, the worker posts a heartbeat every 20
  seconds, the first one once every queue's worker can take jobs.
- With `SUPERBULL_TOKEN` set and `@superbull/connector` installed in the app,
  the connector starts inside the worker and sends each job,
  its lines, queue counts and worker numbers to Superbull. Without it, or with
  a wrong token, the worker runs as before.
- A job whose name the worker does not know goes back with a wait of 15
  seconds, and fails after 15 minutes. It was marked done before.
- A running job can be cancelled from Superbull: its `signal` aborts, and a job
  that does not stop in 60 seconds is ended. A cancelled job is not retried.
