import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';

@ObjectType()
export class CoreOutput {
  @Field(type => String, { nullable: true })
  @IsString()
  error?: string;

  @Field(type => Boolean)
  @IsBoolean()
  ok: boolean;
}
