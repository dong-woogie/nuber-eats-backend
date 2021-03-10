import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class CreateAddressInput {
  @Field(type => String)
  address: string;

  @Field(type => String)
  detailAddress: string;
}

@ObjectType()
export class CreateAddressOutput extends CoreOutput {
  @Field(type => User, { nullable: true })
  user?: User;
}
