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
        console.log(`criteria: ${criteria}`);
        this.filteredFoodItems = this.filteredFoodItems.filter(item => {
          return item.name.toLowerCase().includes(criteria.toLowerCase());
        })
      }

    }
  },
  created: function () {
    this.createTables();
    this.getFoodItems();
  }
});