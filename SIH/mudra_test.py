import tensorflow as tf

model_path = r"C:\Users\itskh\OneDrive\SIH\mudra_model_new.keras"  # full path
model = tf.keras.models.load_model(r"D:\Users\itskh\Downloads\mudra_model.keras")

print("✅ Model loaded successfully!")
