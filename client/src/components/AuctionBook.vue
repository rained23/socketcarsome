<template>
  <div>
    <h2 class="text-nowrap">Auction History</h2>
    <template v-if="books.length !== 0">
      <div class="table-responsive">
        <table class="table table-striped table-sm">
          <thead>
            <tr>
              <th>Dealer</th>
              <th>Bid</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bid in books" :key="bid.id">
              <td>
                {{ bid.user }}
              </td>
              <td>RM {{ bid.price }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-else>
      No bid yet ...
    </template>
  </div>
</template>

<script>
export default {
  name: 'AuctionBook',
  props: ['bids'],
  computed: {
    books: function() {
      return this.bids;
    },
  },
};
</script>
