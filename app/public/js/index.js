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

var app = new Vue({
  el: '#app',
  data: {
    currentTable: null,
    tables: [],
    foodItems: [],
    foodCategory: 'all',
    searchCriteria: ''
  },
  methods: {
    createTables() {
      const TABLES = 6;
      for (let i = 1; i <= TABLES; i++) {
        this.tables.push(new Table(i));
      }
    },
    getFoodItems() {
      // TODO: Get food items from /api/menu
    },
    selectTable(t) {
      this.currentTable = t;
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
    }
  },
  created: function () {
    this.createTables();
    this.getFoodItems();
  }
});