import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/role.decorator';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-user.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Resolver(of => User)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  @Mutation(returns => CreateAccountOutput)
  async createAccount(@Args('input') createAccountInput: CreateAccountInput) {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(returns => LoginOutput)
  async login(@Args('input') loginInput: LoginInput) {
    return this.usersService.login(loginInput);
  }

  @Mutation(type => VerifyEmailOutput)
  async verifyEmail(@Args('input') { code }: VerifyEmailInput) {
    return this.usersService.verifyEmail(code);
  }

  @Query(returns => User)
  @Roles(['Any'])
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @Query(returns => UserProfileOutput)
  @Roles(['Any'])
  async userProfile(@Args() userProfileInput: UserProfileInput) {
    return this.usersService.findById(userProfileInput.userId);
  }

  @Mutation(returns => EditProfileOutput)
  @Roles(['Any'])
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editUserProfile(authUser.id, editProfileInput);
  }
}
