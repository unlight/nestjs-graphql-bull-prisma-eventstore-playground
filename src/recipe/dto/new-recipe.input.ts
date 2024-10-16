import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, Length } from 'class-validator';

@InputType()
export class NewRecipeInput {
  @Field(() => String)
  @Length(2, 30)
  title: string = '';

  @Field({ nullable: true })
  @IsOptional()
  @Length(30, 255)
  description?: string;

  @Field(() => [String])
  ingredients: string[] = [];

  @Field(() => String)
  code: string = '';
}
