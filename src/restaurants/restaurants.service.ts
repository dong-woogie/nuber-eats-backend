import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput } from './dtos/category.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { DeleteRestaurantInput } from './dtos/delete-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { MyRestaurantInput, MyRestaurantOutput } from './dtos/my-restaurant';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dio';
import {
  SearchRestaurantsInput,
  SearchRestaurantsOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantSerivce {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categorys: CategoryRepository,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    private readonly commonService: CommonService,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    const {
      name,
      categoryName,
      address,
      coverImg,
      detailAddress,
    } = createRestaurantInput;
    const restaurant = this.restaurants.create({
      name,
      address: address + ' ' + detailAddress,
      coverImg,
    });
    const category = await this.categorys.findOrCreate(categoryName);

    restaurant.owner = owner;
    restaurant.category = category;
    restaurant.position = await this.commonService.getPosition(address);

    const newRestaurant = await this.restaurants.save(restaurant);

    return { ok: true, restaurantId: newRestaurant.id };
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const { restaurantId, categoryName } = editRestaurantInput;
      let category: Category;

      await this.findOneAndcheckValid(owner.id, restaurantId);
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
      await this.findOneAndcheckValid(owner.id, restaurantId);
      await this.restaurants.delete(restaurantId);
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e.message ? e.message : 'Could not delete restaurant',
      };
    }
  }

  async findOneAndcheckValid(
    ownerId: number,
    restaurantId: number,
  ): Promise<Restaurant> {
    const restaurant = await this.restaurants.findOne(restaurantId);
    if (!restaurant) throw new Error('Not Found Restaurant');
    if (ownerId !== restaurant.ownerId)
      throw new Error("You don't own a restaurant");
    return restaurant;
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    const categories = await this.categorys.find();
    return {
      ok: true,
      categories,
    };
  }

  async allRestaurants(
    user: User,
    { skip, take }: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    try {
      const restaurants = await this.restaurants
        .createQueryBuilder('restaurant')
        .where(
          'ST_DistanceSphere(restaurant.position, ST_GeomFromGeoJSON(:position)) < 3000',
        )
        .orderBy('restaurant.isPromoted', 'DESC')
        .addOrderBy('restaurant.id')
        .skip(skip)
        .take(take)
        .setParameters({ position: JSON.stringify(user.position) })
        .getMany();

      return { ok: true, restaurants };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const result = await this.restaurants.findOneOrFail(restaurantId, {
        relations: ['menu', 'category'],
      });
      return { ok: true, result };
    } catch {
      return { ok: false, error: 'Cannot find restaurant' };
    }
  }

  async searchRestaurantByName(
    user: User,
    { query, take, skip }: SearchRestaurantsInput,
  ): Promise<SearchRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants
        .createQueryBuilder('restaurant')
        .where(
          'ST_DistanceSphere(restaurant.position, ST_GeomFromGeoJSON(:position)) < 3000',
        )
        .andWhere(`restaurant.name LIKE :query`, { query: `%${query}%` })
        .orderBy('restaurant.isPromoted', 'DESC')
        .addOrderBy('restaurant.id')
        .skip(skip)
        .take(take)
        .setParameters({ position: JSON.stringify(user.position) })
        .getMany();

      return { ok: true, restaurants };
    } catch {
      return { ok: false, error: 'Could not search for restaurants' };
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    const restaurants = await this.restaurants.find({
      where: { owner },
      relations: ['category'],
      order: {
        id: 'DESC',
      },
    });
    return { ok: true, restaurants };
  }

  async myRestaurant({
    restaurantId,
  }: MyRestaurantInput): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOneOrFail(restaurantId, {
        relations: ['category', 'orders', 'menu'],
      });
      return { ok: true, restaurant };
    } catch {
      return { ok: false, error: 'Not Found Restaurant' };
    }
  }

  async restaurantCountByCategory(category: Category): Promise<number> {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug(user: User, categoryInput: CategoryInput) {
    try {
      const { slug, skip, take } = categoryInput;
      const category = await this.categorys.findOne({ slug });
      if (!category) throw new Error('Could not found');

      const restaurants = await this.restaurants
        .createQueryBuilder('restaurant')
        .innerJoinAndSelect('restaurant.category', 'category')
        .where('category.slug = :slug', { slug })

        .andWhere(
          'ST_DistanceSphere(restaurant.position, ST_GeomFromGeoJSON(:position)) < 3000',
        )
        .orderBy('restaurant.isPromoted', 'DESC')
        .addOrderBy('restaurant.id')
        .skip(skip)
        .take(take)
        .setParameters({ position: JSON.stringify(user.position) })
        .getMany();

      return {
        ok: true,
        category,
        restaurants,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.message ? e.message : 'Could not load category',
      };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.findOneAndcheckValid(
        owner.id,
        createDishInput.restaurantId,
      );
      const dish = await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return { ok: true, dish };
    } catch (e) {
      return {
        ok: false,
        error: e.message ? e.message : 'Could not create menu',
      };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne(editDishInput.dishId, {
        relations: ['restaurant'],
      });
      if (!dish) throw new Error('Not found dish');

      await this.findOneAndcheckValid(owner.id, dish.restaurant.ownerId);
      await this.dishes.save([
        {
          id: editDishInput.dishId,
          ...editDishInput,
        },
      ]);

      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e.message ? e.message : 'Could not edit menu',
      };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });
      if (!dish) throw new Error('Not found dish');
      await this.findOneAndcheckValid(owner.id, dish.restaurant.ownerId);
      await this.dishes.delete(dishId);
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e.message ? e.message : 'Could not delete menu',
      };
    }
  }
}
