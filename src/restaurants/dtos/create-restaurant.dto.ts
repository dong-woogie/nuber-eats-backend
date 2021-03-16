import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'address',
]) {
  @Field(type => String)
  categoryName: string;

  @Field(type => String, { nullable: true })
  coverImg?: string;

  @Field(type => String, { nullable: true })
  detailAddress: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {
  @Field(type => Int, { nullable: true })
  restaurantId?: number;
}
