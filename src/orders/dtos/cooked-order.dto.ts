import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class CookedOrderInput {
  @Field(type => Float)
  lat: number;

  @Field(type => Float)
  lng: number;
}
