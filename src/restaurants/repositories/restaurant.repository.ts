import { EntityRepository, Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';

@EntityRepository(Restaurant)
export class RestaurantRepository extends Repository<Restaurant> {
  async findOneAndCompareOwner(ownerId, restaurantId): Promise<Restaurant> {
    const restaurant = await this.findOne(restaurantId);
    if (!restaurant) throw new Error('Not Found Restaurant');
    if (ownerId !== restaurant.ownerId)
      throw new Error("You don't own a restaurant");
    return restaurant;
  }
}
