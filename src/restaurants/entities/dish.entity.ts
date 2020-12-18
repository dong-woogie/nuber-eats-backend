import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
class DishChoice {
  @Field(type => String)
  @Column()
  name: string;

  @Field(type => Int, { nullable: true })
  @Column({ nullable: true })
  extra?: number;
}

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
class DishOption {
  @Field(type => String)
  @Column()
  @IsString()
  name: string;

  @Field(type => Number, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  extra?: number;

  @Field(type => [DishChoice], { nullable: true })
  @Column({ nullable: true })
  choice?: DishChoice[];
}

@InputType('DishInputType', { isAbstract: true })
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
