import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantSerivce {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categorys: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    const { name, categoryName, address } = createRestaurantInput;
    const newRestaurant = this.restaurants.create({ name, address });
    const category = await this.categorys.findOrCreate(categoryName);

    newRestaurant.owner = owner;
    newRestaurant.category = category;
    await this.restaurants.save(newRestaurant);

    return { ok: true };
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const { restaurantId, categoryName } = editRestaurantInput;
      const restaurant = await this.restaurants.findOne(restaurantId);

      if (!restaurant) throw new Error('Restaurant not found');
      if (owner.id !== restaurant.ownerId) {
        throw new Error("You can't edit restaurant that you don't own");
      }

      let category: Category;
      if (categoryName) {
        category = await this.categorys.findOrCreate(categoryName);
      }

      await this.restaurants.save([
        {
          id: restaurantId,
          ...editRestaurantInput,
          ...(categoryName && { category }),
        },
      ]);
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e.message ? e.message : 'Could edit restaurant',
      };
    }
  }
}
