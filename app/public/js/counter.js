
var SelectTable = {
    template: '<div><h2>Select a table to see the order</h2></div>'
}


var app = new Vue({
    el: '#app',
    data: {
        selected: false,
        selectedTable: null,
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
        tables: [
            {
                tableNo: 1,
                orderNo: 101,
                order: [
                    {
                        item: 'food1',
                        quantity: 3,
                        price: 3.00
                    },
                    {
                        item: 'food2',
                        quantity: 2,
                        price: 1.50
                    },
                    {
                        item: 'food3',
                        quantity: 1,
                        price: 6.50
                    }
                ]
            },
            {
                tableNo: 2,
                orderNo: 102,
                order:
                    [
                        {
                            item: '2food1',
                            quantity: 1,
                            price: 3.00
                        },
                        {
                            item: '2food2',
                            quantity: 1,
                            price: 3.00
                        },
                        {
                            item: '2food3',
                            quantity: 1,
                            price: 3.00
                        }
                    ]
            }
        ]
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
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error);
                });
            alert('Saving data for table no: ' + JSON.stringify(this.currentBill));
            console.log(this.currentBill)
        },

         // finish this
        getOrders() {
            axios.get('/api/counter/all-order')
                .then(response => {
                    let data = response.data;                   
                })
                .catch(err => console.log(err));
        }
    },
    created: function () {
        // this.getOrders();
    }
});