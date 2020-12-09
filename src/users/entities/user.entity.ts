import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEnum, IsString } from 'class-validator';
enum UserRole {
  Client,
  Owner,
  Delivery,
}

registerEnumType(UserRole, { name: 'UserRole' });
@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field(type => String)
  @Column()
  @IsString()
  email: string;

  @Field(type => String)
  @Column({ select: false })
  @IsString()
  password: string;

  @Field(type => UserRole)
  @Column({ type: 'enum', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(type => Boolean)
  verified: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async hashingPassword() {
    if (this.password) this.password = await bcrypt.hash(this.password, 10);
  }

  async chekcPassword(aPassword: string): Promise<boolean> {
    return await bcrypt.compare(aPassword, this.password);
  }
}
