import { Injectable, Logger } from '@nestjs/common';
import { Bid } from './bid.entity';
import { AppGateway } from '../app.gateway';
import { WsException } from '@nestjs/websockets';
import { plainToClass } from 'class-transformer';
import { Connection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuctionService {
  private readonly logger = new Logger(AuctionService.name);

  constructor(
    @InjectRepository(Bid)
    private bidsRepository: Repository<Bid>,
    private readonly connection: Connection,
    private readonly socket: AppGateway,
  ) {}

  async bid(plainBid: Bid): Promise<Bid> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newBid = plainToClass(Bid, plainBid);
      const car = this.car(newBid.carId);
      const bids = await queryRunner.manager.find(Bid, {
        where: { carId: car.id },
        order: { price: 'ASC' },
      });

      if (
        (bids.length !== 0 && bids[bids.length - 1].price >= newBid.price) ||
        car.startPrice >= newBid.price
      ) {
        throw new Error();
      }

      await queryRunner.manager.save(newBid);
      await queryRunner.commitTransaction();

      this.socket.server.emit('bid:new', newBid);

      this.socket.server.emit('bid:book', {
        bids: [...(await this.bids())].reverse(),
        timestamp: Date.now(),
      });

      return newBid;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new WsException('Price need to be bigger than leading price');
    } finally {
      await queryRunner.release();
    }
  }

  async bids(): Promise<Bid[]> {
    return this.bidsRepository.find({
      where: { carId: this.car(1).id },
      order: { price: 'ASC' },
    });
  }

  async reset(): Promise<boolean> {
    await this.bidsRepository.delete({ carId: this.car(1).id });
    this.socket.server.emit('bid:book', { bids: [], timestamp: Date.now() });
    this.socket.server.emit('bid:book:reset');
    return true;
  }

  private car(id) {
    return { id: 1, startPrice: 1000, model: 'Iriz', brand: 'Proton' };
  }
}
