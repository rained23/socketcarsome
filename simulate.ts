import * as io from 'socket.io-client';
import * as faker from 'faker';

const reset = io('http://localhost:3000', { transports: ['websocket'] });

// We create 2 sockets so we can randomly access our multiple instance
// to test our socket reliability
const instances = ['http://localhost:3000', 'http://localhost:4000'];
const sockets = [
  io(instances[0], { transports: ['websocket'] }),
  io(instances[1], { transports: ['websocket'] }),
];

// Simulation Requirement
const users = new Array(100)
  .fill(undefined)
  .map(() => faker.name.firstName().toLowerCase());
const totalBids = new Array(20).fill(0);
const priceIncrement = [100, 300, 500];
const mode = process.argv.includes('real') ? 'real' : 'sync';

let totalBidExecuted = 0;
let totalBidAccepted = 0;
let totalRejectedBids = 0;
let highestBid = 0;
let executionStart;
let executionEnd;
let processedEnd;
const dealers = [];
const book = [];
reset.emit('reset');
const currentPrice = () => {
  return book.length ? parseInt(book[book.length - 1].price) : 1000;
};

// we create our own book to check the reliability of our socket service
reset.on('bid:new', bid => {
  book.push(bid);
});

reset.on('bid:book:reset', () => {
  // simulation will cast the bid synchronously/sequentiel
  const sync = (user, socket) => {
    totalBids.forEach(() => {
      const price =
        currentPrice() + priceIncrement[Math.round(Math.random() * 2)];
      socket.emit('bid', {
        user,
        carId: 1,
        price,
      });

      if (price > highestBid) {
        highestBid = price;
      }
      totalBidExecuted += 1;
      if (totalBidExecuted === users.length * totalBids.length) {
        executionEnd = process.hrtime(executionStart);
      }
    });
  };

  // simulation will cast the bid asynchronously mimicking real-world
  const real = (user, socket) => {
    totalBids.map(async () => {
      setTimeout(() => {
        const price =
          currentPrice() + priceIncrement[Math.round(Math.random() * 2)];
        socket.emit('bid', {
          user,
          carId: 1,
          price,
        });

        if (price > highestBid) {
          highestBid = price;
        }
        totalBidExecuted += 1;
        if (totalBidExecuted === users.length * totalBids.length) {
          executionEnd = process.hrtime(executionStart);
        }
      }, faker.random.number(5000));
    });
  };

  sockets.forEach(socket => {
    socket.on('exception', data => {
      totalRejectedBids += 1;

      if (totalRejectedBids + totalBidAccepted === totalBidExecuted) {
        processedEnd = process.hrtime(executionStart);
      }
    });

    socket.on('bid', data => {
      totalBidAccepted += 1;
      if (totalRejectedBids + totalBidAccepted === totalBidExecuted) {
        processedEnd = process.hrtime(executionStart);
      }

      if (!dealers.includes(data.user)) {
        dealers.push(data.user);
      }
    });
  });

  executionStart = process.hrtime();
  users.forEach(user => {
    if (mode === 'real') {
      real(user, sockets[faker.random.number(1)]);
      return;
    }
    sync(user, sockets[faker.random.number(1)]);
  });
});

reset.on('book:init', remoteBook => {
  const totalBidProcessed = totalBidAccepted + totalRejectedBids;
  const rateOfFailure =
    ((totalBidExecuted - totalBidProcessed) / totalBidExecuted) * 100;

  const processedEndInMs = processedEnd[0] * 1000 + processedEnd[1] / 1000000;
  const bidsPerSecond = totalBidExecuted / (processedEndInMs / 1000);

  const averageResponsePerBid = processedEndInMs / totalBidProcessed;

  console.clear();
  console.log(`Final Price : RM ${remoteBook[0].price}`);
  console.log(`Bids Accepted: ${totalBidAccepted}`);
  console.log(`Dealers with atleast 1 successful bid: ${dealers.length}`);

  console.info(
    'Execution time: %ds %dms',
    executionEnd[0],
    executionEnd[1] / 1000000,
  );
  console.info(
    'Overall processed bids time: %ds %dms',
    processedEnd[0],
    processedEnd[1] / 1000000,
  );
  console.log(`Total of processed bids : ${totalBidProcessed}`);

  console.log(`Processed bids per second : ${bidsPerSecond}/s`);
  console.log(`Rate of failure : ${rateOfFailure} %`);
  console.log(`Average response per bid : ${averageResponsePerBid} ms`);
  process.exit();
});

console.log(`Simulating in ${mode} mode ....`);
const main = setInterval(() => {
  if (book.length + totalRejectedBids === users.length * totalBids.length) {
    clearInterval(main);
    reset.emit('book:init');
  }
}, 1000);
