import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order, OrderStatus } from '../entites/order.entity';

@InputType()
export class GetOwnerOrdersInput {
  @Field(type => Number)
  restaurantId: number;

  @Field(type => [OrderStatus], { nullable: true })
  statuses: OrderStatus[];
}

@ObjectType()
export class GetOwnerOrdersOutput extends CoreOutput {
  @Field(type => [Order], { nullable: true })
  orders: Order[];
}
