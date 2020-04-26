import { Test, TestingModule } from '@nestjs/testing';
import { AuctionService } from './auction.service';
import { Bid } from './dto/bid.dto';
import { AppGateway } from '../app.gateway';
import { WsException } from '@nestjs/websockets';
import { Redis } from '@svtslv/nestjs-ioredis';

describe('AuctionService', () => {
  let service: AuctionService;
  let gateway: AppGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuctionService,
        {
          provide: AppGateway,
          useValue: {
            server: {
              emit: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuctionService>(AuctionService);
    gateway = module.get<AppGateway>(AppGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('can create bid', () => {
    const newBid = new Bid();
    newBid.user = 'test';
    newBid.carId = 1;
    newBid.price = 100;

    const test = service.bid(newBid);

    expect(gateway.server.emit).toBeCalled();
    expect(test).toBeInstanceOf(Bid);
  });

  it('can create bid if the price is greater than the leading price', () => {
    let price = 100;
    const users = ['anna', 'carry', 'william'];
    const bids = new Array(10).fill(1).map(() => {
      price += Math.round(Math.random() * 100) + 10;
      const bid = new Bid();
      bid.carId = 1;
      bid.user = users[Math.round(Math.random() * 3)];
      bid.price = price;
      return service.bid(bid);
    });

    console.log(bids);

    expect(service.list()).toHaveLength(bids.length);
  });

  it('should reject price that is lower or equal than leading price', () => {
    const bid = new Bid();
    bid.user = 'test';
    bid.carId = 1;
    bid.price = 1000;

    service.bid(bid);

    const cheapBid = new Bid();
    cheapBid.user = 'test2';
    cheapBid.carId = 1;
    cheapBid.price = 900;

    expect(() => service.bid(cheapBid)).toThrow(WsException);

    cheapBid.price = 1000;

    expect(() => service.bid(cheapBid)).toThrow(WsException);
  });
});
