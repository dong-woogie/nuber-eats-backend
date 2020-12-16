import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteRestaurantInput } from './dtos/delete-restaurant.dto';
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
      let category: Category;

      await this.checkValidRestaurant(owner.id, restaurantId);
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

  async deleteRestaurant(owner: User, { restaurantId }: DeleteRestaurantInput) {
    try {
      await this.checkValidRestaurant(owner.id, restaurantId);
      await this.restaurants.delete(restaurantId);
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e.message ? e.message : 'Could not delete restaurant',
      };
    }
  }

  async checkValidRestaurant(
    ownerId: number,
    restaurantId: number,
  ): Promise<void> {
    const restaurant = await this.restaurants.findOne(restaurantId);
    if (!restaurant) throw new Error('Not Found Restaurant');
    if (ownerId !== restaurant.ownerId)
      throw new Error("You don't own a restaurant");
  }

  async allCategoies(): Promise<AllCategoriesOutput> {
    const categories = await this.categorys.find();
    return {
      ok: true,
      categories,
    };
  }

  async restaurantCountByCategory(category: Category): Promise<number> {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug(slug: string) {
    try {
      const category = this.categorys.findOne(
        { slug },
        { relations: ['restaurants'] },
      );
      if (!category) throw new Error('Could not found');
      return { ok: true, category };
    } catch (e) {
      return {
        ok: false,
        error: e.message ? e.message : 'Could not load category',
      };
    }
  }
}
