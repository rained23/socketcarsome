<template>
  <div id="app">
    <div
      class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom"
    >
      <h1 class="h2">Proton Iriz</h1>
      <div class="mb-2 mb-md-0 d-none d-md-block">
        <h1 class="h3">Current Bid: RM {{ currentPrice }}</h1>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-6">
          <line-chart
            :chart-data="datacollection"
            :options="graphOptions"
          ></line-chart>
        </div>
        <div class="col">
          <div class="row d-sm-none">
            <h1 class="h3 text-nowrap">Current Bid: RM {{ currentPrice }}</h1>
          </div>
          <auction-book :bids="book.bids"></auction-book>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuctionBook from './components/AuctionBook';
import LineChart from './components/LineChart';

export default {
  name: 'App',
  components: {
    AuctionBook,
    LineChart,
  },
  data() {
    return {
      isConnected: false,
      bids: [],
      book: {
        bids: [],
        timestamp: 0,
      },
      startPrice: 1000,
      currentPrice: '?',
      datacollection: {},
      graphOptions: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: false,
              },
            },
          ],
        },
        legend: {
          display: false,
        },
      },
    };
  },
  sockets: {
    connect() {
      this.isConnected = true;
      this.$socket.emit('book:init');

      this.sockets.subscribe('book:init', bids => {
        this.book = { bids, timestamp: 0 };
        this.currentPrice = bids[0].price;

        this.fillData();
      });

      this.sockets.subscribe('bid:book:reset', () => {
        this.book = { bids: [], timestamp: 0 };
        this.fillData();
      });

      this.sockets.subscribe('bid:book', book => {
        if (book.bids.length === 0 || book.timestamp < this.book.timestamp) {
          return;
        }
        this.book = book;
        this.currentPrice = this.book.bids[0].price;
        this.fillData();
      });
    },

    disconnect() {
      this.isConnected = false;
      this.sockets.unsubscribe('book:init');
      this.sockets.unsubscribe('book');
      this.sockets.unsubscribe('bid:book:reset');
    },
  },
  methods: {
    fillData() {
      this.datacollection = {
        labels: [
          '',
          ...this.bookReverse.map(bid => {
            return bid.user;
          }),
        ],
        datasets: [
          {
            data: [
              this.startPrice,
              ...this.bookReverse.map(bid => {
                return bid.price;
              }),
            ],
            lineTension: 0,
            backgroundColor: 'transparent',
            borderColor: '#007bff',
            borderWidth: 4,
            pointBackgroundColor: '#007bff',
          },
        ],
      };
    },
  },
  computed: {
    bookReverse: function() {
      if (this.book.bids.length === 0) {
        return [];
      }

      return [...this.book.bids].reverse();
    },
  },
};
</script>
