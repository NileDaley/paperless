class Table {
  constructor(id, occupied = false, customers = 0, order = new Order()) {
    this.id = id;
    this.occupied = occupied;
    this.customers = customers;
    this.order = order;
  }
}

class Order {
  constructor(status = "pending", items = []) {
    this.status = status;
    this.items = items;
  }
}

class FoodItem {
  constructor(id, name, price, category) {
    this.id = id;
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
    searchCriteria: ''
  },
  computed: {
    starters: function () {
      return this.getOrderItemsByCategory('starter');
    },
    mains: function () {
      return this.getOrderItemsByCategory('main');
    },
    sides: function () {
      return this.getOrderItemsByCategory('side');
    },
    desserts: function () {
      return this.getOrderItemsByCategory('dessert');
    },
    emptyOrder: function () {
      return this.currentTable.order.items.length === 0;
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
      axios.get('/api/menu')
        .then(response => {
          let data = response.data;
          this.filteredFoodItems = this.foodItems = data
            .map(item => new FoodItem(item._id, item.name, item.price, item.category))
            .sort((item, other) => {
              return item.name.toLowerCase().localeCompare(other.name.toLowerCase());
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
        })
      }

      if (criteria !== '') {
        this.filteredFoodItems = this.filteredFoodItems.filter(item => {
          return item.name.toLowerCase().includes(criteria.toLowerCase());
        })
      }

    },
    getOrderItemsByCategory(category) {
      return this.currentTable.order.items.filter(i => i.item.category === category);
    },
    addItemToOrder(foodItem) {

      let found = false;

      // If the item is already on the order, update it's quantity
      this.currentTable.order.items.forEach(i => {
        if (i.item === foodItem) {
          i.quantity++;
          found = true;
          return;
        }
      });

      // Add the new food item to the order if it doesn't exist
      if (!found) {
        this.currentTable.order.items.push({ "item": foodItem, "quantity": 1 });
      }

    },
    removeItemFromOrder(foodItem) {
      let item = this.currentTable.order.items.find(i => i.item === foodItem);
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.currentTable.order.items.splice(this.currentTable.order.items.indexOf(item), 1);
      }
    },
    submitOrder() {
      let order = this.currentTable.order;
    }
  },
  created: function () {
    this.createTables();
    this.getFoodItems();
  }
});