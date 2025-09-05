import {
  GraphqlRequestFunction,
  createGraphqlRequest,
  waitWhenAllJobsFinished,
} from '@/test-utils';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Queue, Worker } from 'bullmq';
import { expect } from 'expect';
import { AppModule, configureApplication } from '../app.module';
import { AppEnvironment } from '../app.environment';

let app: INestApplication;
let graphqlRequest: GraphqlRequestFunction;
let queue: Queue;
let env: AppEnvironment;

before(async () => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule, BullModule.registerQueue({ name: 'bull' })],
  }).compile();
  app = testingModule.createNestApplication();
  configureApplication(app, { logEvents: true });
  // app.useLogger(false); // Disable all logs
  env = await app.resolve(AppEnvironment);

  graphqlRequest = createGraphqlRequest(app.getHttpServer());

  queue = await app.resolve(getQueueToken('bull'));
  await queue.obliterate();
});

after(async () => {
  await app.close();
});

it('smoke', () => {
  expect(app).toBeTruthy();
});

it.skip('run parallel with same ids', async () => {
  const shipmentQueue = new Queue('shipmentQueue');

  const worker = new Worker(
    'shipmentQueue',
    async job => {
      const shipmentId = job.data.id;

      // Log the start of processing
      console.log(`Processing shipment ID: ${shipmentId}`);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

      // Log completion
      console.log(`Shipment ID: ${shipmentId} processed`);
    },
    { connection: { url: env.redisConnectionString } },
  );

  worker.on('ready', () => {
    console.log('worker ready');
  });
  worker.on('active', job => {
    console.log('job active');
  });

  worker.on('completed', job => {
    console.log(`Job with ID ${job.id} has been completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job with ID ${job?.id} failed with error: ${err.message}`);
  });

  const addShipmentToQueue = async shipment => {
    // Use shipment.id as the jobId to prevent concurrent processing of the same shipment ID
    await shipmentQueue.add(
      shipment.name,
      { id: shipment.id, name: shipment.name },
      { jobId: 's' + shipment.id },
    );
  };

  // Example of adding shipments with different and same IDs
  // await shipmentQueue.add(
  //   'jobName',
  //   { id: 1, name: 'Shipment A' },
  //   { jobId: 's1' },
  // );

  // джоба с одинаковым id будет пропущена
  await addShipmentToQueue({ id: '1', name: 'Shipment A' });
  await addShipmentToQueue({ id: '2', name: 'Shipment B' });
  await addShipmentToQueue({ id: '1', name: 'Shipment A Duplicate' }); // Same ID as Shipment A
  await addShipmentToQueue({ id: '3', name: 'Shipment C' });
  await addShipmentToQueue({ id: '2', name: 'Shipment B Duplicate' }); // Same ID as Shipment B

  console.log('Shipments added to the queue.');

  await waitWhenAllJobsFinished(shipmentQueue);

  await worker.close();
});

it.only('buulmq quick start', async () => {
  const myQueue = new Queue('foo');

  async function addJobs() {
    await myQueue.add('myJobName', { foo: 'bar' });
    await myQueue.add('myJobName', { qux: 'baz' });
  }

  await addJobs();
});
