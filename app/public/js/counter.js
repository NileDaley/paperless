var SelectTable = {
  template: '<div><h2>Select a table to see the order</h2></div>'
};

var app = new Vue({
  el: '#app',
  data: {
    selected: false,
    selectedTable: null,
    socket: null,
    currentBill: {
      orderNo: 0,
      tableNo: 0,
      totalPreTax: 0,
      vatAmount: 0,
      totalPostTax: 0,
      order: {
        item: 0,
        quantity: 0,
        price: 0
      }
    },
    existingOrders: [],
    testOrders: [],
    tables: []
  },
  components: {
    'select-table': SelectTable
  },
  methods: {

    showTableOrder(tableNo) {
      this.currentBill.tableNo = tableNo;
      this.currentBill.orderNo = this.tables[tableNo - 1].orderNo;
      this.currentBill.order = this.tables[tableNo - 1].order;
      this.selected = true;
    },

    totalPreTax() {
      let total = 0;
      /* TODO: Update forEach statement to reflect changes of order structure. See /api/all-orders for new structure */
      this.tables[this.currentBill.tableNo - 1].order.forEach(element => {
        const itemTotal = element.quantity * element.price;
        total += itemTotal;
      });
      this.currentBill.totalPreTax = total;
      return total;
    },

    calculateVAT() {
      const vat = this.currentBill.totalPreTax * 0.2;
      this.currentBill.vatAmount = vat;
      return vat;
    },

    calculateTotal() {
      const total = this.currentBill.totalPreTax + this.currentBill.vatAmount;
      this.currentBill.totalPostTax = total;
      return total;
    },

    completeOrder() {
      axios.post('/api/counter/complete-order', this.currentBill)
          .then(function(response) {
            console.log(response);
          })
          .catch(function(error) {
            console.log(error);
          });
      alert('Saving data for table no: ' + JSON.stringify(this.currentBill));
      console.log(this.currentBill);
    },

    // finish this
    getOrders() {
      axios.get('/api/counter/all-orders')
          .then(response => {
            let allOrders = response['data'];
            let existingOrders = allOrders.filter(o => o.status !== 'paid' && o.status !== 'abandoned');

            let testOrders = []

            existingOrders.forEach(order => {
              items = this.extractItemsFromCourses(order['order']);
              let tableNo = order['table'];
              testOrders.push(order);
            });
            // Vue.set()
            return testOrders;
            // console.log()
          })
          .catch(err => console.log(err));
    },

    extractItemsFromCourses(order) {

      // Extract all items from each of the courses
      let items = [];
      for (let course of ['starters', 'mains', 'sides', 'desserts']) {
        // console.log(order[course]);
        items.push(order[course].items);
      }
      // console.log(items);
      return items;
    }
  },
  created: function() {
    // this.testOrders;
    this.testOrders = this.getOrders();
    console.log(this.testOrders);
    this.socket = io.connect();
    this.socket.on('newOrder', newOrder => {
      // Do something here with new orders
    });
  }
});
