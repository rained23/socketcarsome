import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  WsResponse,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuctionService } from './auction/auction.service';
import { Inject, forwardRef } from '@nestjs/common';
import { Bid } from './auction/bid.entity';

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => AuctionService))
    private readonly auctionService: AuctionService,
  ) {}

  handleConnection(client) {
    client.emit('connected', 'Successfully connected to server');
  }

  handleDisconnect(client) {
    console.log('Client disconnected');
  }

  @SubscribeMessage('book:init')
  async handleList(@MessageBody() data: any): Promise<WsResponse<Bid[]>> {
    return {
      event: 'book:init',
      data: [...(await this.auctionService.bids())].reverse(),
    };
  }

  @SubscribeMessage('reset')
  async handleReset(@MessageBody() data: any): Promise<WsResponse<any>> {
    await this.auctionService.reset();
    return { event: 'reset', data: true };
  }

  @SubscribeMessage('bid')
  async handleBid(@MessageBody() data: Bid): Promise<WsResponse<any>> {
    return { event: 'bid', data: await this.auctionService.bid(data) };
  }
}
