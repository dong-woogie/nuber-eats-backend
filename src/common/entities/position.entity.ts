import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PositionEntity {
  @Field(type => String)
  type: string;

  @Field(type => [Number, Number])
  coordinates: [number, number];
}
