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
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dio';
import { Category } from './entities/category.entity';
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
  restaurants(@Args('input') restaurantsInput: RestaurantsInput) {
    return this.restaurantSerivce.allRestaurants(restaurantsInput);
  }

  @Query(returns => RestaurantOutput)
  restaurant(@Args('input') restaurantInput: RestaurantInput) {
    return this.restaurantSerivce.findRestaurantById(restaurantInput);
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
  allCategoies() {
    return this.restaurantService.allCategoies();
  }

  @Query(returns => CategoryOutput)
  category(@Args('input') categoryInput: CategoryInput) {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}
