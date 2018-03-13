
class Item {
  constructor(name, quantity, price) {
    this.name = name;
    this.quantity = quantity;
    this.price = price;
  }
};

class Table {
  constructor(_id, occupied = false, status, customers = 0) {
    this._id = _id;
    this.status = status
    this.occupied = occupied;
    this.customers = customers;
  }
};

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
      totalPostTax: 0,
      vatAmount: 0,
      totalPreTax: 0,
      order: [],
      status: ''
    },
    existingOrders: [],
    testOrders: [],
    tables: [],
    discount: '',
    adminPass: '',
    errors: []
  },

  components: {
    'select-table': SelectTable,
    'empty-table': EmptyTable
  },

  methods: {

    showTableOrder(tableNo) {
      this.empty = false
      this.currentBill.tableNo = tableNo;
      let currentTable = [];
      currentTable = this.existingOrders.filter(order => {
        return order['table'] === tableNo;
      })

      if (currentTable.length === 0) {
        this.selected = true;
        this.empty = true;
      } else {
        this.currentBill.orderNo = currentTable[0]._id;
        console.log(currentTable[0]);
        const extractedItems = this.extractItemsFromCourses(currentTable[0].order);
        this.currentBill.order = extractedItems;
        this.currentBill.status = currentTable[0].status;
        this.calculatePostTax();
        this.calculateVAT();
        this.calculatePreTax();
        this.selected = true;
      }
    },

    calculatePostTax() {
      let total = 0;
      /* TODO: Update forEach statement to reflect changes of order structure. See /api/all-orders for new structure */
      this.currentBill.order.forEach(element => {
        const itemTotal = element.quantity * element.price;
        total += itemTotal;
      });
      this.currentBill.totalPostTax = total;
    },

    calculateVAT() {
      const vat = this.currentBill.totalPostTax * 0.2;
      this.currentBill.vatAmount = vat;
    },

    calculatePreTax() {
      const total = this.currentBill.totalPostTax - this.currentBill.vatAmount;
      this.currentBill.totalPreTax = total;
    },

    completeOrder() {
      payload = {
        bill: {
          totalPreTax: this.currentBill.totalPreTax,
          vatAmount: this.currentBill.vatAmount,
          totalPostTax: this.currentBill.totalPreTax,
        },
        status: 'paid'
      }

      console.log(payload);

      // console.log(bill);
      axios.patch(`/api/counter/${this.currentBill.orderNo}`, payload)
        .then(response => {
          let updatedOrder = response['data'];
          // console.log(updatedOrder);
          // this.currentBill.order.status = updatedOrder.status;
          this.socket.emit('orderStateChange', updatedOrder);
          // this.socket.emit('orderStateChange', updatedOrder);
          // this.resetCurrentBill();
        })
        .catch(err => console.log(err));

      // axios.post('/api/counter/complete-order', this.currentBill)
      //   .then(function (response) {
      //     console.log(response);
      //   })
      //   .catch(function (error) {
      //     console.log(error);
      //   });
      // alert('Saving data for table no: ' + JSON.stringify(this.currentBill));
      // console.log(this.currentBill);
    },

    // finish this
    getOrders() {
      axios.get('/api/counter/all-orders')
        .then(response => {
          let allOrders = response['data'];
          this.existingOrders = allOrders.filter(o => o.status !== 'paid' && o.status !== 'abandoned');

          this.existingOrders.forEach(order => {

            let orderTable = this.tables.find(t => t._id === order.table);
            orderTable.occupied = true;
            orderTable.customers = order.customers;
            orderTable.status = order.status;
            // orderTable.order._id = order._id;
          });
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
    },

    resetCurrentBill() {
      this.currentBill.orderNo = '';
      this.currentBill.tableNo = '';
      this.currentBill.totalPreTax = 0;
      this.currentBill.vatAmount = 0;
      this.currentBill.totalPostTax = 0;
      this.currentBill.order = [];
      this.currentBill.status = '';
    },

    createTables() {
      const TABLES = 6;
      for (let i = 1; i <= TABLES; i++) {
        this.tables.push(new Table(i));
      }
    },

    applyDiscount() {
      this.errors = [];

      if (!this.adminPass) {
        this.errors.push('Please enter an admin password');
      }

      if (!this.discount || this.discount > 100 || this.discount < 1) {
        this.errors.push('Please enter a valid discount %');
      }

      if (this.adminPass && this.discount) {
        axios.post('/api/admin/login', { data: this.adminPass })
          .then(foundUser => {
            if (!foundUser) {
              this.errors.push("User Could Not Be Found");
            } else {

              if (this.adminPass === foundUser['data'][0]['password']) {
                this.currentBill.totalPostTax = this.currentBill.totalPostTax - (this.currentBill.totalPostTax * (this.discount / 100));
                this.adminPass = '';
                this.discount = null;
              } else {
                this.errors.push("Incorrect Password!");
              }
            }
          })
          .catch(err => {
            console.log(err)
          });
      }
    }
  },

  computed: {
    capitalizeFirstLetter: function () {
      return this.currentBill.status.charAt(0).toUpperCase() + this.currentBill.status.slice(1);
    }
  },

  created: function () {
    this.getOrders();
    this.currentBill.tableNo = 0;
    this.createTables();

    this.socket = io.connect();
    this.socket.on('newOrder', newOrder => {
      // Do something here with new orders
      const table = this.tables.find(t => t._id === newOrder.table);

      table.status = newOrder.status;
      table.customers = newOrder.customers;
      table.occupied = true;

      this.existingOrders.push(newOrder);
      if (this.currentBill.tableNo === newOrder.table) {
        this.showTableOrder(newOrder.table);
      }
    });

    this.socket.on('orderStateChange', order => {
      const orderToUpdate = this.existingOrders.find(t => t.table === order.table);
      const table = this.tables.find(t => t._id === order.table);

      if (order.status === 'abandoned' || order.status === 'paid') {
        console.log('abandonded/paid');
        table.customers = 0;
        table.occupied = false;
        this.existingOrders.splice(this.existingOrders.indexOf(orderToUpdate), 1);
        this.showTableOrder(order.table);
      } else {
        orderToUpdate.order = order.order;
        table.status = order.status;
        table.customers = order.customers;
        this.showTableOrder(order.table);
      }

    });
  }
});

