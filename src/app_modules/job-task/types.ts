import { Job } from 'bullmq';

export type JobState = Awaited<ReturnType<Job['getState']>>;
