import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Resolver(of => User)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  @Query(returns => Boolean)
  hi() {
    return true;
  }
  @Mutation(returns => CreateAccountOutput)
  async createAccount(@Args('input') createAccountInput: CreateAccountInput) {
    const error = await this.usersService.createAccount(createAccountInput);
    if (!error) return { ok: true, error: 'good' };
    return { ok: false, error: error };
  }
}
