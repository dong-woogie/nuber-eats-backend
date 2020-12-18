import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@ObjectType()
@InputType('DishOptionInputType', { isAbstract: true })
class DishOption {
  @Field(type => String)
  @Column()
  @IsString()
  name: string;

  @Field(type => Number, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  extra?: number;

  @Field(type => [String], { nullable: true })
  @Column({ nullable: true })
  choice?: string[];
}

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(type => String)
  @Column()
  @IsString()
  name: string;

  @Field(type => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field(type => String)
  @Column()
  @IsString()
  descripition: string;

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo?: string;

  @Field(type => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];

  @Field(type => Restaurant)
  @ManyToOne(type => Restaurant, restaurant => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;
}
