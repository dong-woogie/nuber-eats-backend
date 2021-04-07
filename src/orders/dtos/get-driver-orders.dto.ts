import {
  Field,
  Float,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order } from '../entites/order.entity';

@InputType()
export class GetDriverOrdersInput extends PartialType(
  PickType(Order, ['status']),
) {
  @Field(type => Float)
  lat: number;

  @Field(type => Float)
  lng: number;
}

@ObjectType()
export class GetDriverOrdersOutput extends CoreOutput {
  @Field(type => [Order], { nullable: true })
  orders?: Order[];
}
