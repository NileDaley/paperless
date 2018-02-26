class FoodItem {
    constructor(_id, name, price, category) {
        this._id = _id;
        this.name = name;
        this.price = price;
        this.category = category;
    }
}

const app = new Vue({
    el: '#app',
    data: {
        foodItems: [],
        filteredFoodItems: [],
        newItem: {
            name: '',
            price: '',
            category: ''
        }
    },
    methods: {
        getFoodItems() {
            axios.get('/api/menu')
                .then(response => {
                    let data = response.data;
                    // Convert the json response to FoodItem objects and sort alphabetically
                    this.filteredFoodItems = this.foodItems = data
                        .map(item => new FoodItem(item._id, item.name, item.price, item.category))
                        .sort((item, other) => {
                            return item.name.toLowerCase().localeCompare(other.name.toLowerCase());
                        });
                })
                .catch(err => {
                    console.log(err)
                });
        },

        addNewItem() {
            axios.post('/api/admin/new-item', this.newItem)
                .then(response => {
                    console.log(response);
                })
                .catch(err => {
                    console.log(err)
                });
        },

        removeItem(itemToRemove) {
            axios.delete('/api/menu', {data:this.foodItems[itemToRemove]})
                .then(response => {
                    console.log(response);
                })
                .catch(err => {
                    console.log(err)
                });
        }
    },

    created: function () {
        this.getFoodItems();
    }
})