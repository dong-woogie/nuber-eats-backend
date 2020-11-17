import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';

@ObjectType()
export class MutationOutput {
  @Field(type => String, { nullable: true })
  @IsString()
  error?: string;

  @Field(type => Boolean)
  @IsBoolean()
  ok: boolean;
}
