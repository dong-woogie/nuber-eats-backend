import {
  Field,
  InputType,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@InputType()
export class CreateAccountInput extends PickType(
  User,
  ['email', 'password', 'role'],
  InputType,
) {}

@ObjectType()
export class CreateAccountOutput {
  @Field(type => String)
  error?: string;

  @Field(type => Boolean)
  ok: boolean;
}
