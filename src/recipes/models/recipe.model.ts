import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Recipe {
  @Field(() => ID)
  id!: string;

  @Directive('@upper')
  title: string = '';

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  creationDate!: Date;

  @Field(() => [String])
  ingredients: string[] = [];
}
