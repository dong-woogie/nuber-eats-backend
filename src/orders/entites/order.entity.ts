import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickUp = 'PickUp',
  Drivered = 'Drivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(type => User)
  @ManyToOne(type => User, user => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  customer?: User;

  @Field(type => User)
  @ManyToOne(type => User, user => user.riders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  driver?: User;

  @Field(type => Restaurant)
  @ManyToOne(type => Restaurant, restaurant => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  restaurant?: Restaurant;

  @Field(type => [Dish])
  @ManyToMany(type => Dish, dish => dish.orders)
  @JoinTable()
  dishes: Dish[];

  @Field(type => Float, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  total?: number;

  @Field(type => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus })
  @IsEnum(OrderStatus)
  orderStatus: OrderStatus;
}
