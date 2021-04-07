import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order } from '../entites/order.entity';

@InputType()
export class GetDriverOrderInput extends PickType(Order, ['id']) {
  @Field(type => Number)
  lat: number;

  @Field(type => Number)
  lng: number;
}

@ObjectType()
export class GetDriverOrderOutput extends CoreOutput {
  @Field(type => Order)
  order?: Order;
}
