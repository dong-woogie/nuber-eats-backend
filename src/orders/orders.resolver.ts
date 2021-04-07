import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Roles } from 'src/auth/role.decorator';
import {
  ANOTHER_DRIVER_TAKE_ORDER,
  NEW_COOKED_ORDER,
  NEW_PENDING_ORDER,
  NEW_UPDATE_ORDER,
  PICKUP_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import { User } from 'src/users/entities/user.entity';
import {
  AnotherDriverTakeOrderInput,
  AnotherDriverTakeOrderOutput,
} from './dtos/another-driver-take-order.dto';
import { CookedOrderInput } from './dtos/cooked-order.dto';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import {
  GetDriverOrderInput,
  GetDriverOrderOutput,
} from './dtos/get-driver-order.dto';
import {
  GetDriverOrdersInput,
  GetDriverOrdersOutput,
} from './dtos/get-driver-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import {
  GetOwnerOrdersInput,
  GetOwnerOrdersOutput,
} from './dtos/get-owner-orders.dto';
import { OrderUpdatesInput } from './dtos/order-updates.dto';
import { OwnerOrdersUpdateInput } from './dtos/owner-orders-update.dto';
import { PickupOrderInput, PickupOrderOutput } from './dtos/pickup-order.dto';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';
import { Order } from './entites/order.entity';
import { OrderService } from './orders.service';
import * as haversine from 'haversine';
import { getDistance } from 'src/util';
import { GetDriverOwnOrdersOutput } from './dtos/get-driver-own-orders.dto';

@Resolver(of => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  @Mutation(returns => CreateOrderOutput)
  @Roles(['Client'])
  createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ) {
    return this.orderService.createOrder(customer, createOrderInput);
  }

  @Query(returns => GetOrdersOutput)
  @Roles(['Any'])
  getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ) {
    return this.orderService.getOrders(user, getOrdersInput);
  }

  @Query(returns => GetOrderOutput)
  @Roles(['Any'])
  getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ) {
    return this.orderService.getOrder(user, getOrderInput);
  }

  @Query(returns => GetOwnerOrdersOutput)
  @Roles(['Owner'])
  getOwnerOrders(@Args('input') getOwnerOrdersInput: GetOwnerOrdersInput) {
    return this.orderService.getOwnerOrders(getOwnerOrdersInput);
  }

  @Query(returns => GetDriverOrdersOutput)
  @Roles(['Delivery'])
  getDriverOrders(@Args('input') getDriverOrdersInput: GetDriverOrdersInput) {
    return this.orderService.getDriverOrders(getDriverOrdersInput);
  }

  @Query(returns => GetDriverOrderOutput)
  @Roles(['Delivery'])
  getDriverOrder(@Args('input') getDriverOrderInput: GetDriverOrderInput) {
    return this.orderService.getDriverOrder(getDriverOrderInput);
  }

  @Mutation(returns => EditOrderOutput)
  @Roles(['Any'])
  editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ) {
    return this.orderService.editOrder(user, editOrderInput);
  }

  @Subscription(type => Order, {
    filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
      return ownerId === user.id;
    },
    resolve: ({ pendingOrders }) => pendingOrders.order,
  })
  @Roles(['Owner'])
  pendingOrder() {
    return this.pubsub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Subscription(type => Order, {
    filter: (
      { cookedOrder }: { cookedOrder: Order },
      { input }: { input: CookedOrderInput },
      _,
    ) => {
      const distance = getDistance(
        { lat: input.lat, lng: input.lng },
        cookedOrder.restaurant.position,
      );
      if (distance > 3) return false;
      return true;
    },
    resolve: (
      { cookedOrder }: { cookedOrder: Order },
      { input }: { input: CookedOrderInput },
      _,
    ) => {
      const distance = getDistance(
        { lat: input.lat, lng: input.lng },
        cookedOrder.restaurant.position,
      );
      return {
        ...cookedOrder,
        distance,
        items: null,
      };
    },
  })
  @Roles(['Delivery'])
  cookedOrder(@Args('input') cookedOrderInput: CookedOrderInput) {
    return this.pubsub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription(type => AnotherDriverTakeOrderOutput, {
    filter: (
      { order }: { order: Order },
      { input }: { input: AnotherDriverTakeOrderInput },
      _,
    ) => {
      const distance = getDistance(
        { lat: input.lat, lng: input.lng },
        order.restaurant.position,
      );
      if (distance > 3) return false;
      return true;
    },
    resolve: ({ order }: { order: Order }) => {
      return { orderId: order.id };
    },
  })
  @Roles(['Delivery'])
  anotherDriverTakeOrder(
    @Args('input') anotherDriverTakeOrderInput: AnotherDriverTakeOrderInput,
  ) {
    return this.pubsub.asyncIterator(ANOTHER_DRIVER_TAKE_ORDER);
  }

  @Subscription(type => PickupOrderOutput, {
    filter: (
      { order }: { order: Order },
      { input }: { input: PickupOrderInput },
      _,
    ) => {
      return order.restaurant.id === input.restaurantId;
    },
    resolve: ({ order }: { order: Order }, _) => {
      return { orderId: order.id };
    },
  })
  @Roles(['Owner'])
  pickupOrder(@Args('input') pickupOrderInput: PickupOrderInput) {
    return this.pubsub.asyncIterator(PICKUP_ORDER);
  }

  @Subscription(type => Order, {
    filter: (
      { orderUpdates: order }: { orderUpdates: Order },
      { input }: { input: OrderUpdatesInput },
      { user }: { user: User },
    ) => {
      if (
        order.customerId !== user.id &&
        order.driverId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      return order.id === input.id;
    },
    resolve: ({ orderUpdates }) => {
      return orderUpdates;
    },
  })
  @Roles(['Any'])
  orderUpdate(
    @AuthUser() user: User,
    @Args('input') orderUpdatesInput: OrderUpdatesInput,
  ) {
    return this.pubsub.asyncIterator(NEW_UPDATE_ORDER);
  }

  @Mutation(returns => TakeOrderOutput)
  @Roles(['Delivery'])
  takeOrder(
    @AuthUser() driver: User,
    @Args('input') takeOrderInput: TakeOrderInput,
  ) {
    return this.orderService.takeOrder(driver, takeOrderInput);
  }

  @Query(returns => GetDriverOwnOrdersOutput)
  @Roles(['Delivery'])
  getDriverOwnOrders(@AuthUser() user: User) {
    return this.orderService.getDriverOwnOrders(user);
  }
}
