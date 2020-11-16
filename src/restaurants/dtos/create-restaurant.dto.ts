import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';

@ArgsType()
export class CreateRestaurantDto {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsBoolean()
  isVegan?: boolean;

  @Field()
  @IsString()
  address: string;

  @Field()
  @IsString()
  ownerName: string;
}
