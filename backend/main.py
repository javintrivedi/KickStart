from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_pymongo import PyMongo
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'supersecretkey')

# PostgreSQL config for user details
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('POSTGRES_URI', 'postgresql://user:password@localhost:5432/kickstart')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# MongoDB config for user images
app.config['MONGO_URI'] = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/kickstart_images')

db = SQLAlchemy(app)
mongo = PyMongo(app)
CORS(app, supports_credentials=True)

# User model for PostgreSQL
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100), nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    user = User(email=data['email'], name=data.get('name'))
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        session['user_id'] = user.id
        return jsonify({'message': 'Login successful', 'user': {'id': user.id, 'email': user.email, 'name': user.name}})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/user', methods=['GET'])
def get_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    # Fetch user image from MongoDB
    image_doc = mongo.db.user_images.find_one({'user_id': user_id})
    image_url = image_doc['url'] if image_doc else None
    return jsonify({'id': user.id, 'email': user.email, 'name': user.name, 'image_url': image_url})

@app.route('/api/user/image', methods=['POST'])
def upload_image():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    image = request.files['image']
    # For simplicity, store image filename and URL in MongoDB (in real app, store in cloud storage)
    filename = image.filename
    # Save image to local folder (for demo)
    image.save(f'uploads/{filename}')
    mongo.db.user_images.update_one({'user_id': user_id}, {'$set': {'url': f'/uploads/{filename}'}}, upsert=True)
    return jsonify({'message': 'Image uploaded successfully', 'url': f'/uploads/{filename}'})

if __name__ == '__main__':
    app.run(debug=True)
