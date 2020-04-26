import { Test, TestingModule } from '@nestjs/testing';
import { AppGateway } from './app.gateway';
import { AuctionService } from './auction/auction.service';

describe('AppGateway', () => {
  let gateway: AppGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppGateway,
        {
          provide: AuctionService,
          useValue: {
            list: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<AppGateway>(AppGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
