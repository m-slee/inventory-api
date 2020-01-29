import React from 'react';

class Item extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            currentItem: '',
            showItems: true,
            newName: '',
            newPrice: '',
            quant: '',
            description: '',
            edit: false,
            editedName: '',
            editedDesc: '',
            editedPrice: '',
            editedQuantity: '',
            currentID: ''


        }
        
        this.handleChange = this.handleChange.bind(this);
        this.createItem = this.createItem.bind(this);
        this.makeEdit = this.makeEdit.bind(this);
        this.submitChanges = this.submitChanges.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
    }

    componentDidMount() {
        fetch("http://127.0.0.1:5000/api/item")
        .then(function(response) {
            return response.json()
        })
        .then((data) => {
            console.log(data);
            this.setState({
                items: data,
            })
        });
    }

    // could pass id or use currentItem to filter
    deleteItem() {
        let id = parseInt(this.state.currentItem);
        fetch(`http://127.0.0.1:5000/api/item/${id}`, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
              },
          })
          .then(function(response) {
            return response.json();
          }).then(function(data) {
            console.log('Deleted Item:', data);
          });
        
          this.setState({
              items: this.state.items.filter(item => item.id !== parseInt(this.state.currentItem)),
              currentItem: ''
          })
    }

    submitChanges(e) {
        e.preventDefault()
        let id = parseInt(this.state.currentItem);
        let editedItem = {
            name: this.state.editedName,
            description: this.state.editedDesc,
            price: this.state.editedPrice,
            quantity: this.state.editedQuantity
        }
        console.log(JSON.stringify(editedItem))
        console.log('submit')
        //
        fetch(`http://127.0.0.1:5000/api/item/${id}`, {
            method: 'put',
            body: JSON.stringify(editedItem),
            headers: {
                'Content-Type': 'application/json'
              },
          })
          .then(function(response) {
            return response.json();
          }).then(function(data) {
            //console.log('Created Item:', data);
          });
          
        /*
        this.setState({
            items: [editedItem, ...this.state.items]
        }
        */
        this.makeEdit()
    }

    handleChange(input) {
        // this handles changes for each input
        // could also bind a function for each input and call here
        return e => {
            this.setState({
                [input]: e.target.value });
        }
    }

    makeEdit() {
        this.setState({
            edit: !this.state.edit
        })
    }

    createItem(e) {
        e.preventDefault()
        let newItem = {
            name: this.state.newName,
            description: this.state.description,
            price: this.state.newPrice,
            quantity: this.state.quant
        }
        console.log(JSON.stringify(newItem))
        
        fetch("http://127.0.0.1:5000/api/item", {
            method: 'post',
            body: JSON.stringify(newItem),
            headers: {
                'Content-Type': 'application/json'
              },
          })
          .then(function(response) {
            return response.json();
          }).then(function(data) {
            //console.log('Created Item:', data);
          });
          
          this.setState({
            items: [newItem, ...this.state.items]
          })
       // console.log('created')
    }

    render() {
        let isSelected;
        if (this.state.currentItem !== '') {
            isSelected = this.state.items.filter(item => item.id === parseInt(this.state.currentItem));
            //console.log(isSelected)
        }
        
        const currentItems = this.state.items.map(item => {
            return (
                    <option key={item.id} value={item.id}>{item.name}</option>
                )
        });

        //console.log(currentItems);
        return (
            <div>
                <p>Hello from item.</p>
                <h5>Get details of an Item:</h5>
                <form>
                <select value={this.state.currentItem} onChange={this.handleChange('currentItem')}>
                    {currentItems}
                </select>
                </form>
            {this.state.currentItem}
            {isSelected ? (
                <ul>
                        <li>{isSelected[0].name}</li>
                        <li>{isSelected[0].description}</li>
                        <li>{isSelected[0].quantity}</li>
                        <li>{isSelected[0].price}</li>
                        <button onClick={this.deleteItem}>Delete Item</button>
                        <button onClick={this.makeEdit}>Edit Values</button>                       
                    
                </ul>
            ) : (
                <div>No item selected</div>
            )
        }

        {this.state.edit ? 
         <form onSubmit={this.submitChanges}>
            <input onChange={this.handleChange('editedName')} placeholder={isSelected[0].name}></input>
            <input onChange={this.handleChange('editedDesc')} placeholder={isSelected[0].description}></input>
            <input onChange={this.handleChange('editedQuantity')} placeholder={isSelected[0].quantity}></input>
            <input onChange={this.handleChange('editedPrice')} placeholder={isSelected[0].price}></input>
            <button type="submit">Submit Changes</button>
        </form> : <div></div>
        }

        <h1>Create New Item</h1>
        <form id="add-form" onSubmit={this.createItem}>
            <input type='text' placeholder='Add item name' onChange={this.handleChange('newName')}/>
            <input type='text' placeholder='Add item description' onChange={this.handleChange('description')} />
            <input type='text' placeholder='Add item quantity' onChange={this.handleChange('quant')}/>
            <input type='text' placeholder='Add item amount' onChange={this.handleChange('newPrice')} />
            <button type="submit">Submit</button>
        </form>
            </div>
        )
    }
}

export default Item;