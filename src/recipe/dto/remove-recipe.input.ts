import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class RemoveRecipeInput {
  @Field(() => ID)
  @IsNotEmpty()
  id!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  removeReason?: string;
}
