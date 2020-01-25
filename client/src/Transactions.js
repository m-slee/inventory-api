import React from 'react';

class Transactions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "transactions": []
        }
        this.getTransactions = this.getTransactions.bind(this);
    }

    getTransactions() {
        fetch("http://127.0.0.1:5000/api/transaction")
        .then(function(response) {
            
            return response.json()
        })
        .then((data) => {
            console.log(data);
            this.setState({
                transactions: data
            })
        });
    }
        

    render() {
        console.log('test');
        const currentTransactions = this.state.transactions.map(tran => {
            return (
                <div>
                    <ul>
                        <li>Data of Transaction: {tran.date}</li>
                        <li>Type of Transaction: {tran.transaction_type === '-' ? 'Purchase' : 'Sell'}</li>
                        <li>Transaction amount: {tran.amount}</li>
                        <li>Total of Transaction: ${tran.total}</li>
                    </ul>
                </div>
            )
        });

        return (
            <div>
                <h1>Hello from transactions.</h1>
                <button onClick={this.getTransactions}>Test Here</button>
                {currentTransactions}
            </div>
        )
    }

}

export default Transactions;