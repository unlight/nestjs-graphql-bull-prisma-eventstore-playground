import { Job } from 'bull';

export type JobState = Awaited<ReturnType<Job['getState']>>;
