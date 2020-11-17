import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<string | undefined> {
    try {
      // exist user
      const exist = await this.users.findOne({ email });
      if (exist) return 'exist user';
      // create user
      await this.users.save(this.users.create({ email, password, role }));
    } catch (e) {
      // return error message
      return "Couldn't create user";
    }
  }
}
