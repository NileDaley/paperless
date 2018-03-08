class Table {
  constructor(_id, occupied = false, customers = 0, order = new Order()) {
    this._id = _id;
    this.occupied = occupied;
    this.customers = customers;
    this.order = order;
  }
}

class Order {
  constructor(status = 'pending', items = []) {
    this.status = status;
    this.items = items;
    this._id = null;
  }
}

class OrderLine {
  constructor(item, quantity, status) {
    this.item = item;
    this.quantity = quantity;
    this.status = status;
  }
}

class FoodItem {
  constructor(_id, name, price, category) {
    this._id = _id;
    this.name = name;
    this.price = price;
    this.category = category;
  }
}

var app = new Vue({
  el: '#app',
  data: {
    currentTable: null,
    tables: [],
    foodItems: [],
    filteredFoodItems: [],
    foodCategory: 'all',
    searchCriteria: '',
    socket: null
  },
  computed: {
    starters: function() {
      return this.getOrderItemsByCategory('starter');
    },
    mains: function() {
      return this.getOrderItemsByCategory('main');
    },
    sides: function() {
      return this.getOrderItemsByCategory('side');
    },
    desserts: function() {
      return this.getOrderItemsByCategory('dessert');
    },
    emptyOrder: function() {
      return this.orderItems.length === 0;
    },
    pendingOrder: function() {
      return this.currentTable.order.status === 'pending';
    },
    orderItems: function() {
      return this.currentTable.order.items;
    }
  },
  methods: {
    createTables() {
      const TABLES = 6;
      for (let i = 1; i <= TABLES; i++) {
        this.tables.push(new Table(i));
      }
    },
    getFoodItems() {
      axios.get('/api/menu').then(response => {
        let data = response.data;
        // Convert the json response to FoodItem objects and sort alphabetically
        this.filteredFoodItems = this.foodItems = data.map(
            item => new FoodItem(
                item._id,
                item.name,
                item.price,
                item.category)
        ).sort((item, other) => {
          return item.name.toLowerCase().localeCompare(other.name.toLowerCase());
        });
      }).catch(err => console.log(err));
    },
    getExistingOrders() {
      axios.get('/api/counter/all-orders')
          .then(response => {

            let allOrders = response['data'];
            let existingOrders = allOrders.filter(o => o.status !== 'paid' && o.status !== 'abandoned');

            existingOrders.forEach(order => {

              let orderTable = this.tables.find(t => t._id === order.table);
              orderTable.occupied = true;
              orderTable.customers = order.customers;
              orderTable.order.status = order.status;
              orderTable.order._id = order._id;
              orderTable.order.items = this.extractItemsFromCourses(order);

            });

          })
          .catch(err => console.log(err));
    },
    selectTable(table) {
      this.currentTable = table;
    },
    addCustomer() {
      this.currentTable.customers += 1;
      this.updateTableStatus();
    },
    removeCustomer() {
      if (this.currentTable.customers > 0) {
        this.currentTable.customers -= 1;
      }
      this.updateTableStatus();
    },
    updateTableStatus() {
      this.currentTable.occupied = this.currentTable.customers >= 1;
    },
    resetFilters() {
      this.foodCategory = 'all';
      this.searchCriteria = '';
      this.filteredFoodItems = this.foodItems;
    },
    setCategory(category) {
      this.foodCategory = category;
      this.filterFoodItems(this.foodCategory, this.searchCriteria);
    },
    filterFoodItems(category, criteria) {

      this.filteredFoodItems = this.foodItems;

      if (category !== 'all') {
        this.filteredFoodItems = this.filteredFoodItems.filter(item => {
          return item.category === category;
        });
      }

      if (criteria !== '') {
        this.filteredFoodItems = this.filteredFoodItems.filter(item => {
          return item.name.toLowerCase().includes(criteria.toLowerCase());
        });
      }

    },
    getOrderItemsByCategory(category) {
      return this.orderItems.filter(
          i => i.item.category === category
      );
    },
    addItemToOrder(foodItem) {

      if (this.pendingOrder) {
        let found = false;

        // If the item is already on the order, update it's quantity
        this.orderItems.forEach(i => {
          if (i.item === foodItem) {
            i.quantity++;
            found = true;
            return;
          }
        });

        // Add the new food item to the order if it doesn't exist
        if (!found) {
          this.orderItems.push(new OrderLine(foodItem, 1, 'pending'));
        }

      }

    },
    removeItemFromOrder(foodItem) {
      if (this.pendingOrder) {
        let item = this.orderItems.find(i => i.item === foodItem);
        if (item.quantity > 1) {
          item.quantity--;
        } else {
          this.orderItems.splice(this.orderItems.indexOf(item), 1);
        }
      }
    },
    submitOrder() {
      if (this.currentTable.customers > 0 && this.pendingOrder) {

        const payload = this.getOrderPayload();

        if (this.currentTable.order._id === null) {
          axios.post('/', payload)
              .then(response => {
                if (response.status === 201) {

                  let submittedOrder = response['data'];

                  // Update the table's order
                  this.currentTable.order._id = submittedOrder._id;
                  this.currentTable.order.status = 'Sent';

                  // Tell the other parts of the system about the new order
                  this.socket.emit('newOrder', submittedOrder);

                }
              })
              .catch(err => console.log(err));
        } else {
          payload.status = 'Sent';
          this.updateOrder(payload);
        }
      }
    },
    updateOrder(payload) {
      axios.patch(`/${this.currentTable.order._id}`, payload)
          .then(response => {

            let updatedOrder = response['data'];
            this.currentTable.order.status = updatedOrder.status;
            this.socket.emit('orderStateChange', updatedOrder);

          })
          .catch(err => console.log(err));
    },
    getOrderPayload() {
      let order = this.currentTable.order;

      let courseItems = {};
      for (let course of ['starter', 'main', 'side', 'dessert']) {
        let courseObj = {};
        courseObj.items = order.items.filter(line => line.item.category === course);
        if (courseObj.items.length > 0) {
          courseObj.status = 'pending';
          courseItems[course + 's'] = courseObj;
        }
      }

      return {
        'table': this.currentTable._id,
        'order': courseItems,
        'customers': this.currentTable.customers
      };

    },
    servedOrder() {
      let payload = this.getOrderPayload();
      payload.status = 'served';
      this.updateOrder(payload);
    },
    editOrder() {
      this.currentTable.order.status = 'pending';
    },
    clearTable() {
      let payload = this.getOrderPayload();
      payload.status = 'abandoned';
      this.updateOrder(payload);
    },
    extractItemsFromCourses(order) {

      // Extract all items from each of the courses
      let items = [];
      for (let course of ['starters', 'mains', 'sides', 'desserts']) {
        items = [...order.order[course].items, ...items];
      }

      items = items.map(line => {
        return new OrderLine(
            new FoodItem(
                line.item._id,
                line.item.name,
                line.item.price,
                line.item.category
            ),
            line.quantity,
            line.status
        );
      });
      return items;

    }
  },
  created: function() {
    this.createTables();
    this.getFoodItems();
    this.getExistingOrders();

    this.socket = io.connect();
    this.socket.on('orderStateChange', order => {
      const table = this.tables.find(t => t._id === order.table);

      if (order.status === 'paid' || order.status === 'abandoned') {

        // Reset the table
        table.customers = 0;
        table.order = new Order();
        table.occupied = false;

      } else {

        table.order.status = order.status;
        table.order.items = this.extractItemsFromCourses(order);

      }

    });
  }
});