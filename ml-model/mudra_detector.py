import cv2
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image

app = Flask(__name__)
CORS(app)

class MudraDetector:
    def __init__(self, model_path='mudra_model.h5'):
        # In production, load your trained model
        # self.model = tf.keras.models.load_model(model_path)
        self.mudra_classes = [
            'Pataka', 'Tripataka', 'Ardhapataka', 'Kartarimukha', 
            'Mayura', 'Ardhachandra', 'Arala', 'Sukhatunda',
            'Mushti', 'Shikhara', 'Kapitta', 'Katakamukha',
            'Suchi', 'Chandrakala', 'Padmakosha', 'Sarpashirsha',
            'Mrigashirsha', 'Simhamukha', 'Kangula', 'Alapadma'
        ]
    
    def preprocess_image(self, image):
        """Preprocess image for model prediction"""
        # Resize image to match model input size
        image = cv2.resize(image, (224, 224))
        image = image / 255.0  # Normalize
        image = np.expand_dims(image, axis=0)
        return image
    
    def predict(self, image):
        """Predict mudra from image"""
        # For demo purposes, return mock predictions
        # In production, use: predictions = self.model.predict(preprocessed_image)
        
        # Mock prediction logic
        confidence = np.random.uniform(0.7, 0.98)
        mudra_index = np.random.randint(0, len(self.mudra_classes))
        
        return {
            'mudra_name': self.mudra_classes[mudra_index],
            'confidence': float(confidence),
            'all_predictions': [
                {'mudra': mudra, 'confidence': float(np.random.uniform(0, 0.3))} 
                for mudra in self.mudra_classes
            ]
        }

detector = MudraDetector()

@app.route('/api/detect', methods=['POST'])
def detect_mudra():
    try:
        if 'image' not in request.files and 'image_data' not in request.json:
            return jsonify({'error': 'No image provided'}), 400
        
        if 'image' in request.files:
            # File upload
            file = request.files['image']
            image = Image.open(file.stream)
        else:
            # Base64 encoded image from camera
            image_data = request.json['image_data'].split(',')[1]
            image = Image.open(io.BytesIO(base64.b64decode(image_data)))
        
        # Convert to OpenCV format
        image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Get prediction
        result = detector.predict(image)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)