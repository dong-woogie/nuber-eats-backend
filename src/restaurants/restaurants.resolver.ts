import {
  Args,
  Mutation,
  Resolver,
  Query,
  ResolveField,
  Int,
  Parent,
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Roles } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
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
import { RestaurantSerivce } from './restaurants.service';

@Resolver(of => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantSerivce: RestaurantSerivce) {}

  @Mutation(returns => CreateRestaurantOutput)
  @Roles(['Owner'])
  createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ) {
    return this.restaurantSerivce.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }

  @Mutation(returns => EditRestaurantOutput)
  @Roles(['Owner'])
  editRestaurant(
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ) {
    return this.restaurantSerivce.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation(returns => DeleteRestaurantOutput)
  @Roles(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ) {
    return this.restaurantSerivce.deleteRestaurant(
      owner,
      deleteRestaurantInput,
    );
  }

  @Query(returns => RestaurantsOutput)
  @Roles(['Client'])
  restaurants(
    @AuthUser() user: User,
    @Args('input') restaurantsInput: RestaurantsInput,
  ) {
    return this.restaurantSerivce.allRestaurants(user, restaurantsInput);
  }

  @Query(returns => RestaurantOutput)
  restaurant(@Args('input') restaurantInput: RestaurantInput) {
    return this.restaurantSerivce.findRestaurantById(restaurantInput);
  }

  @Query(returns => SearchRestaurantsOutput)
  @Roles(['Client'])
  searchRestaurants(
    @AuthUser() user: User,
    @Args('input') searchRestaurantsInput: SearchRestaurantsInput,
  ) {
    return this.restaurantSerivce.searchRestaurantByName(
      user,
      searchRestaurantsInput,
    );
  }

  @Query(returns => MyRestaurantsOutput)
  @Roles(['Owner'])
  myRestaurants(@AuthUser() owner: User) {
    return this.restaurantSerivce.myRestaurants(owner);
  }

  @Query(returns => MyRestaurantOutput)
  @Roles(['Owner'])
  myRestaurant(@Args('input') myRestaurantInput: MyRestaurantInput) {
    return this.restaurantSerivce.myRestaurant(myRestaurantInput);
  }
}

@Resolver(of => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantSerivce) {}

  @ResolveField(returns => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.restaurantCountByCategory(category);
  }

  @Query(returns => AllCategoriesOutput)
  allCategories() {
    return this.restaurantService.allCategories();
  }

  @Query(returns => CategoryOutput)
  @Roles(['Client'])
  category(
    @AuthUser() user: User,
    @Args('input') categoryInput: CategoryInput,
  ) {
    return this.restaurantService.findCategoryBySlug(user, categoryInput);
  }
}

@Resolver(of => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantSerivce) {}

  @Mutation(type => CreateDishOutput)
  @Roles(['Owner'])
  createDish(
    @AuthUser() owner: User,
    @Args('input') createDishInput: CreateDishInput,
  ) {
    return this.restaurantService.createDish(owner, createDishInput);
  }

  @Mutation(type => EditDishOutput)
  @Roles(['Owner'])
  editDish(
    @AuthUser() owner: User,
    @Args('input') editDishInput: EditDishInput,
  ) {
    return this.restaurantService.editDish(owner, editDishInput);
  }

  @Mutation(type => DeleteDishOutput)
  @Roles(['Owner'])
  deleteDish(
    @AuthUser() owner: User,
    @Args('input') deleteDishInput: DeleteDishInput,
  ) {
    return this.restaurantService.deleteDish(owner, deleteDishInput);
  }
}
