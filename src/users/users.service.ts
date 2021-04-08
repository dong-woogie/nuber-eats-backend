import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import {
  CreateAddressInput,
  CreateAddressOutput,
} from './dtos/create-address.dto';
import { CreateAccountInput } from './dtos/create-user.dto';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly commonService: CommonService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    try {
      // exist user
      const exist = await this.users.findOne({ email });
      if (exist) return { ok: false, error: 'exist user' };
      // create user
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      //create veification email
      const verification = await this.verifications.save(
        this.verifications.create({ user }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      // return error message
      return {
        ok: false,
        error: e.message ? e.message : "Couldn't create user",
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      // find the user with the email
      const user = await this.users.findOneOrFail(
        { email },
        { select: ['password', 'id'] },
      );

      // check if the password is correct
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) return { ok: false, error: 'Wrong password' };

      // make a JWT and give it to the user
      // correct return
      const token = this.jwtService.sign({ id: user.id });
      return { ok: true, token };
    } catch (error) {
      return { ok: false, error: 'Not Found User' };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return { ok: true, user };
    } catch (e) {
      return { ok: false, error: 'Not Found User' };
    }
  }

  async editUserProfile(userId: number, { email, password }: EditProfileInput) {
    try {
      //exist email
      const exist = await this.users.findOne({ email });
      if (exist) throw new Error('exist email');

      //find user
      const user = await this.users.findOneOrFail(userId);

      // delete verification because verification is unique
      await this.verifications.delete({ user: { id: user.id } });

      //edit user and create verification email
      if (email) {
        user.email = email;
        user.verified = false;
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) user.password = password;
      await this.users.save(user);

      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e.message ? e.message : 'Could not update profile',
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOneOrFail(
        { code },
        { relations: ['user'] },
      );
      verification.user.verified = true;
      await this.users.save(verification.user);

      // delete after verify email
      await this.verifications.delete(verification.id);

      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: 'Verification Not Found',
      };
    }
  }

  async createAddress(
    userId: number,
    { address, detailAddress }: CreateAddressInput,
  ): Promise<CreateAddressOutput> {
    const user = await this.users.findOne(userId);
    user.address = address + ' ' + detailAddress;
    user.position = await this.commonService.getPosition(address);

    const newUser = await this.users.save(user);
    return { ok: true, user: newUser };
  }
}
