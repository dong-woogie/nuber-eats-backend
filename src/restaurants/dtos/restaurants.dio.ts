import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { PaginationInput } from 'src/common/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';
@InputType()
export class RestaurantsInput extends PaginationInput {}

@ObjectType()
export class RestaurantsOutput extends CoreOutput {
  @Field(type => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
