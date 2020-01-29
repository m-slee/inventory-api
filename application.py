from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import os, datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # This will enable CORS for all routes
# set up database
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# set up marshmallow
mm = Marshmallow(app)

# models
# item class for available inventory
class Item(db.Model):
    __tablename__ = 'item'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True)
    description = db.Column(db.String(50))
    price = db.Column(db.Float)
    quantity= db.Column(db.Integer)
    transactions = db.relationship('Transaction', backref='item', lazy=True)

    def __init__(self, name, description, price, quantity):
        self.name = name
        self.description = description
        self.price = price
        self.quantity = quantity

# create schema for serialization with Marshmallow
class ItemSchema(mm.ModelSchema):
    class Meta:
        fields = ('id', 'name', 'description', 'price', 'quantity')
        strict=True

item_schema = ItemSchema()
items_schema = ItemSchema(many=True) # to handle multiple items

# transaction model - one-to-many with item
class Transaction(db.Model):
    __tablename__ = 'transaction'
    id = db.Column(db.Integer, primary_key=True)
    item_id =  db.Column(db.Integer, db.ForeignKey('item.id'), nullable=True)
    date = db.Column(db.DateTime, default=datetime.datetime.now)
    amount = db.Column(db.Integer)
    transaction_type = db.Column(db.String(1)) # will hold '+' or '-' to add or subtract from inventory 
    total = db.Column(db.Float)

    def __init__(self, item_id, amount, transaction_type, total): #total_price, total_quantity):
        self.item_id = item_id
        self.amount = amount
        self.transaction_type = transaction_type
        self.total = total

# create schema for serialization with Marshmallow
class TransactionSchema(mm.ModelSchema):
    class Meta:
        fields = ('id', 'item_id','date', 'amount', 'transaction_type', 'total')
        strict=True

transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True) # to handle multiple rransactions

# endpoints for transaction model
# make a transaction to add or subtract from inventory and record sell/purchase
@app.route('/api/transaction', methods=['POST'])
def make_transaction():
    item_id = request.json['item_id']
    amount = request.json['amount']
    transaction_type = request.json['transaction_type']
    
    item = Item.query.get(item_id)
    if item:
        if transaction_type == '+':
            item.quantity += amount
        else:
            item.quantity -= amount
        total = amount * item.price

        new_transaction = Transaction(item.id, amount, transaction_type, total)
        db.session.add(new_transaction)
        db.session.commit()
        return transaction_schema.jsonify(new_transaction)

@app.route('/api/transaction', methods=['GET'])
def get_transactions():
    all_transactions = Transaction.query.all()
    # this is used because it returns a list
    result = transactions_schema.dump(all_transactions)
    return jsonify(result)

# get a single product
@app.route('/api/transaction/<int:id>', methods=['GET'])
def get_transaction(id):
    transaction = Transaction.query.get(id)
    return transaction_schema.jsonify(transaction)

# endpoints for item model
# add an item
@app.route('/api/item', methods=['POST'])
def add_item():
    name = request.json["name"]
    description = request.json["description"]
    price = request.json["price"]
    quantity = request.json["quantity"]

    new_item = Item(name, description, price, quantity)
    db.session.add(new_item)
    db.session.commit()

    return item_schema.jsonify(new_item)

# get full list of items
@app.route('/api/item', methods=['GET'])
def get_items():
    all_items = Item.query.all()
    result = items_schema.dump(all_items) # used because it returns a list
    return jsonify(result)

# get a single product
@app.route('/api/item/<int:id>', methods=['GET'])
def get_item(id):
    item = Item.query.get(id)
    return item_schema.jsonify(item)

# update an item
@app.route('/api/item/<int:id>', methods=['PUT'])
def update_item(id):
    updated_item = Item.query.get(id)
    name = request.json['name']
    description = request.json['description']
    price = request.json['price']
    quantity = request.json['quantity']

    updated_item.name = name
    updated_item.description = description
    updated_item.price = price
    updated_item.quantity = quantity

    db.session.commit()
    return item_schema.jsonify(updated_item)

# delete a product
@app.route('/api/item/<int:id>', methods=['DELETE'])
def delete_item(id):
    item = Item.query.get(id)
    db.session.delete(item)
    db.session.commit()
    return item_schema.jsonify(item)

#if __name__=='__main__':
#   app.run(debug=True)
#return jsonify({ 'msg': 'Hello World!'})