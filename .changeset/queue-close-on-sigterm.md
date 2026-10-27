---
'@nextastic/queue': patch
---

`work()` closes its workers on SIGTERM and SIGINT: it takes no new jobs, lets running jobs finish, then exits.
