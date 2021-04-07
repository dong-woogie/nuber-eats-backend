import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class OwnerOrdersUpdateInput {
  @Field(type => Number)
  restaurantId: number;
}
