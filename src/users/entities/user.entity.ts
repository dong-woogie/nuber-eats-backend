import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEnum, IsString } from 'class-validator';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Order } from 'src/orders/entites/order.entity';
import { Payment } from 'src/payments/entities/payment.entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' });
@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field(type => String)
  @Column({ unique: true })
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

  @Field(type => Boolean)
  @Column({ default: false })
  verified: boolean;

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Column('geometry', {
    nullable: true,
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  position: object;

  @Field(type => [Restaurant])
  @OneToMany(type => Restaurant, restaurant => restaurant.owner)
  restaurants: Restaurant[];

  @Field(type => [Order])
  @OneToMany(type => Order, order => order.customer)
  orders: Order[];

  @Field(type => [Order])
  @OneToMany(type => Order, order => order.driver)
  riders: Order[];

  @Field(type => [Payment])
  @OneToMany(type => Payment, payment => payment.user)
  payments: Payment[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashingPassword() {
    if (this.password) this.password = await bcrypt.hash(this.password, 10);
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    return await bcrypt.compare(aPassword, this.password);
  }
}
