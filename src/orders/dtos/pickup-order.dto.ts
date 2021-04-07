import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class PickupOrderInput {
  @Field(type => Number)
  restaurantId: number;
}

@ObjectType()
export class PickupOrderOutput {
  @Field(type => Number)
  orderId: number;
}
