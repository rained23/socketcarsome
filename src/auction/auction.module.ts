import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AppGateway } from '../app.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from './bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bid])],
  providers: [AuctionService, AppGateway],
})
export class AuctionModule {}
