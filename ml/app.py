from fastapi import FastAPI, UploadFile, File,Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
import tensorflow as tf
from PIL import Image
from pydantic import BaseModel, Field
from google import genai 
from dotenv import load_dotenv
import json # To parse the Gemini output
import sys # For error logging
import os

load_dotenv()
# Gemini client initialization
try:
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    GEMINI_MODEL = "gemini-2.5-flash"
except Exception as e:
    print(f"Warning: Could not initialize Gemini client. Ensure API key is set. Error: {e}", file=sys.stderr)
    client = None

# App initialization
app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the ML model
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

# Pydantic Model for Structured Gemini Output ---

# Define the data structure we want Gemini to return
class MudraDetails(BaseModel):
    meaning: str = Field(description="A single paragraph explanation of the mudra's meaning and cultural significance.")
    innerThought: str = Field(description="A short, concise phrase representing the emotion or concept associated with the mudra.")
    commonMistakes: list[str] = Field(description="A list of 3 common mistakes beginners make when performing this mudra.")

# FastAPI Endpoints
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

@app.get("/mudra_info", response_model=MudraDetails)
async def get_mudra_details(mudra_name: str = Query(..., title="Mudra Name")):
    """
    Queries the Gemini API for descriptive details about a given Mudra name.
    The response is forced into the MudraDetails JSON structure.
    """
    if client is None:
        return {"error": "Gemini client not initialized. Check API key setup."}

    # 1. Construct the detailed prompt
    prompt = f"""
    You are an expert in classical Indian dance (Bharatanatyam/Kathak). 
    Provide the cultural meaning, associated inner thought/emotion, and a list of 3 common beginner mistakes for the hand gesture (Mudra) called **{mudra_name}**.
    Your output MUST strictly follow the requested JSON schema.
    """

    # 2. Define the response configuration to force JSON output
    # We use the schema generated from the Pydantic model MudraDetails
    response_schema = MudraDetails.model_json_schema()

    config = {
        "response_mime_type": "application/json",
        "response_schema": response_schema
    }

    try:
        # 3. Call the Gemini API with structured output configuration
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[prompt],
            config=config
        )
        
        # 4. Parse the JSON response text
        # The result.text is guaranteed to be a JSON string matching the schema
        gemini_json_str = response.text.strip()
        details_data = json.loads(gemini_json_str)

        # 5. Return the validated Pydantic model
        return MudraDetails(**details_data)

    except Exception as e:
        print(f"Error calling Gemini API for {mudra_name}: {e}", file=sys.stderr)
        # Return a fallback response
        return MudraDetails(
            meaning="Details unavailable due to an external service error.",
            innerThought=f"Could not retrieve details for {mudra_name}.",
            commonMistakes=["Check server logs for Gemini API error."]
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
