import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from './output.dto';

@InputType()
export class PaginationInput {
  @Field(type => Int)
  take: number;

  @Field(type => Int, { nullable: true, defaultValue: 0 })
  skip?: number;
}
