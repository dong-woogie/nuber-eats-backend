import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurnats: Repository<Restaurant>,
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurnats.findOne(restaurantId);
      if (!restaurant) throw new Error('Restaurant not found');
      if (restaurant.ownerId !== owner.id)
        throw new Error('You are not owner of this restaurant');

      await this.payments.save(
        this.payments.create({
          transactionId,
          restaurant,
          user: owner,
        }),
      );
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e.message ? e.message : 'Could not create payment',
      };
    }
  }

  async getPayments(owner: User) {
    const payments = await this.payments.find({ user: owner });
    return {
      ok: true,
      payments,
    };
  }
}
