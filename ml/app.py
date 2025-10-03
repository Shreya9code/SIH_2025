from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
import tensorflow as tf
from PIL import Image

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the functional model
model = tf.keras.models.load_model("best_mudra_model.keras")
IMG_SIZE = (128, 128)
class_names = ['Alapadmam', 'Anjali', 'Aralam', 'Ardhachandran', 'Ardhapathaka',
               'Berunda', 'Bramaram', 'Chakra', 'Chandrakala', 'Chaturam',
               'Garuda', 'Hamsapaksha', 'Hamsasyam', 'Kangulam', 'Kapith',
               'Kapotham', 'Karkatta', 'Kartariswastika', 'Kartrimukha', 'Katakamukha',
               'Katakavardhana', 'Katrimukha', 'Khatva', 'Kilaka', 'Kurma',
               'Matsya', 'Mayura', 'Mrigasirsha', 'Mukulam', 'Mushti',
               'Nagabandha', 'Padmakosha', 'Pasha', 'Pathaka', 'Pushpaputa',
               'Sakata', 'Samputa', 'Sandamsha', 'Sarpasirsha', 'Shanka',
               'Shivalinga', 'Shukatundam', 'Sikharam', 'Simhamukham', 'Suchi',
               'Swastikam', 'Tamarachudam', 'Tripathaka', 'Trishulam', 'Varaha']

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = Image.open(file.file).convert("RGB")
    image = image.resize(IMG_SIZE)
    img_array = tf.keras.preprocessing.image.img_to_array(image)
    img_array = np.expand_dims(img_array, axis=0)

    preds = model.predict(img_array)
    top3_indices = np.argsort(preds[0])[-3:][::-1]
    results = [{"class": class_names[i], "probability": float(preds[0][i])} for i in top3_indices]
    return {"predictions": results}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
# To run the app, use the command:
# uvicorn app:app --reload