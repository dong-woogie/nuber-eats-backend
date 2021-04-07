import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order } from '../entites/order.entity';

@ObjectType()
export class GetDriverOwnOrdersOutput extends CoreOutput {
  @Field(type => [Order], { nullable: true })
  orders: Order[];
}
