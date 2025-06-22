import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkey')
    SQLALCHEMY_DATABASE_URI = os.environ.get('POSTGRES_URI', 'postgresql://user:password@localhost:5432/kickstart')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/kickstart_images')
