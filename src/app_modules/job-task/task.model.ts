import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class Task {
  @Field(() => ID)
  id!: string;

  @Field(() => TaskState, { nullable: false })
  state: TaskState = TaskState.PENDING;
}

export enum TaskState {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
}

registerEnumType(TaskState, { name: 'TaskState' });
