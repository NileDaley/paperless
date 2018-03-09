var SelectTable = {
  template: '<div><h2>Select a table to see the order</h2></div>'
};

var EmptyTable = {
  template: '<div><h2>Table is empty!</h2></div>'
};

var app = new Vue({
  el: '#app',
  data: {
    selected: false,
    empty: false,
    selectedTable: null,
    socket: null,
    currentBill: {
      orderNo: 0,
      tableNo: 0,
      totalPreTax: 0,
      vatAmount: 0,
      totalPostTax: 0,
      order: []
    },
    existingOrders: [],
    testOrders: [],
    tables: []
  },
  components: {
    'select-table': SelectTable,
    'empty-table': EmptyTable
  },
  methods: {

    showTableOrder(tableNo) {
      this.empty = false
      let currentTable = [];
      currentTable = this.existingOrders.filter(order => {
        return order['table'] === tableNo;
      })

      if (currentTable.length === 0) {
        this.selected = true;
        this.empty = true;
      } else {
        this.currentBill.tableNo = tableNo;
        this.currentBill.orderNo = currentTable[0]._id;
        const extractedItems = this.extractItemsFromCourses(currentTable[0].order);
        this.currentBill.order = extractedItems;
        this.calculatePreTax();
        this.calculateVAT();
        this.calculateTotal();
        this.selected = true;
        console.log(this.currentBill.totalPreTax);
        console.log(this.currentBill.vatAmount);
        console.log(this.currentBill.totalPostTax);
      }
    },

    calculatePreTax() {
      let total = 0;
      /* TODO: Update forEach statement to reflect changes of order structure. See /api/all-orders for new structure */
      this.currentBill.order.forEach(element => {
        const itemTotal = element.quantity * element.price;
        total += itemTotal;
      });
      this.currentBill.totalPreTax = total;
    },

    calculateVAT() {
      const vat = this.currentBill.totalPreTax * 0.2;
      this.currentBill.vatAmount = vat;
    },

    calculateTotal() {
      const total = this.currentBill.totalPreTax + this.currentBill.vatAmount;
      this.currentBill.totalPostTax = total;
    },

    completeOrder() {
      axios.post('/api/counter/complete-order', this.currentBill)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
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
          this.existingOrders = allOrders.filter(o => o.status !== 'paid' && o.status !== 'abandoned');
        })
        .catch(err => console.log(err));
    },

    extractItemsFromCourses(order) {

      // Extract all items from each of the courses
      let items = [];
      for (let course of ['starters', 'mains', 'sides', 'desserts']) {
        if (order[course].items.length !== 0) {
          order[course].items.forEach(x => {
            let name = x['item'].name;
            let quantity = x.quantity;
            let price = x['item'].price;
            items.push(new Item(name, quantity, price));

          });
        }
      }
      return items;
    },

    selectedAndNotEmpty() {
      let bool = false;

      if (!this.empty && this.selected) {
        bool = true;
      }

      return bool;
    }
  },

  created: function () {
    this.getOrders();
    this.socket = io.connect();
    this.socket.on('newOrder', newOrder => {
      // Do something here with new orders
    });
  }
});

class Item {
  constructor(name, quantity, price) {
    this.name = name;
    this.quantity = quantity;
    this.price = price;
  }
}
