import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class AnotherDriverTakeOrderInput {
  @Field(type => Number)
  lat: number;

  @Field(type => Number)
  lng: number;
}

@ObjectType()
export class AnotherDriverTakeOrderOutput {
  @Field(type => Number)
  orderId: number;
}
