import Queue from 'bull';

// node -r ts-node/register node_modules/mocha/bin/mocha --no-timeouts --watch --watch-files . src/playground.test.ts

describe('bullmq', () => {
  it('smoke', async () => {
    const myQueue = new Queue('foo', {
      defaultJobOptions: {},
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    myQueue.process(async function (job, done) {
      console.log('job', job.data);
      // job.data contains the custom data passed when the job was created
      // job.id contains id of this job.

      // transcode video asynchronously and report progress
      await job.progress(42);

      // call done when finished
      done();

      // or give a error if error
      done(new Error('error transcoding'));

      // or pass it a result
      done(null, { framerate: 29.5 /* etc... */ });
    });

    await myQueue.add({ video: 'http://example.com/video1.mov' });
  });
});
