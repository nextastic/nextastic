# @nextastic/queue

## 2.3.1

### Patch Changes

- 2166018: Rename timeoutMs option to timeoutSecs

## 2.3.0

### Minor Changes

- 1f8b1b7: Expose queue startDashboard function

## 2.2.0

### Minor Changes

- 8801e75: Add the ability to specify a different default queue

### Patch Changes

- 22adfb3: Only require queue name when scheduling jobs
- Updated dependencies [8801e75]
  - @nextastic/config@2.1.0
  - @nextastic/logger@3.0.1

## 2.1.1

### Patch Changes

- Updated dependencies [853e93b]
  - @nextastic/logger@3.0.0

## 2.1.0

### Minor Changes

- 7188c18: Add job timeout

### Patch Changes

- 456e6b2: Only protect /jobs route with auth

## 2.0.1

### Patch Changes

- ceee467: Fix invalid bullmq settings

## 2.0.0

### Major Changes

- 646b9ea: Remove async config

### Patch Changes

- Updated dependencies [646b9ea]
- Updated dependencies [83a84ae]
- Updated dependencies [28e8ef6]
  - @nextastic/config@2.0.0
  - @nextastic/logger@2.0.0
  - @nextastic/cache@0.2.0

## 1.0.0

### Major Changes

- fb718ed: Updated all to use @nextastic/config instead of env vars

### Minor Changes

- e30b973: Cache config
- e30b973: Add queue config variables

### Patch Changes

- Updated dependencies [fb718ed]
- Updated dependencies [e30b973]
  - @nextastic/config@1.0.0
  - @nextastic/logger@1.0.0
  - @nextastic/cache@0.1.0

## 0.4.3

### Patch Changes

- Updated dependencies [05c414e]
  - @nextastic/redis@0.0.3
  - @nextastic/cache@0.0.3

## 0.4.2

### Patch Changes

- Updated dependencies [51742ee]
  - @nextastic/redis@0.0.2
  - @nextastic/cache@0.0.2

## 0.4.1

### Patch Changes

- 95294db: fix missing log

## 0.4.0

### Minor Changes

- 24bf668: add job logging

### Patch Changes

- Updated dependencies [24bf668]
  - @nextastic/logger@0.1.0

## 0.3.3

### Patch Changes

- 3d154a9: fix duplicate dshboard script

## 0.3.2

### Patch Changes

- 7609ceb: fix queues missing handlers

## 0.3.1

### Patch Changes

- c6b14a6: Fix work() params

## 0.3.0

### Minor Changes

- 2d075e4: Add Queue cli command to start dashboard

## 0.2.1

### Patch Changes

- 78b71e4: Allow specifying jobs dir

## 0.2.0

### Minor Changes

- 150c5f9: exported queue packages

## 0.1.0

### Minor Changes

- db0e6c4: Add queue dashboard script
