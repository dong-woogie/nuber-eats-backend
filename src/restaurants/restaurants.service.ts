import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantSerivce {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categorys: Repository<Category>,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    const { name, categoryName, address } = createRestaurantInput;
    const newRestaurant = this.restaurants.create({ name, address });
    const categorySlug = categoryName.trim().toLowerCase().replace(/ /g, '-');
    let category = await this.categorys.findOne({ slug: categorySlug });

    if (!category) {
      category = await this.categorys.save(
        this.categorys.create({ name: categoryName, slug: categorySlug }),
      );
    }

    newRestaurant.owner = owner;
    newRestaurant.category = category;
    await this.restaurants.save(newRestaurant);

    return { ok: true };
  }
}
