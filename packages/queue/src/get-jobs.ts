import { Job } from './create-job'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function getJobs(jobsDir?: string) {
  const jobs: Record<string, Job> = {}

  const directory = jobsDir ?? path.join(__dirname, 'jobs')

  for (const file of await fs.readdir(directory)) {
    const moduleFile = await import(path.join(directory, file))
    const job = Object.values(moduleFile)[0] as Job

    jobs[job.id] = job
  }

  return jobs
}
