import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
from collections import deque

# ---- Load model ----
print("Loading model...")
model = tf.keras.models.load_model("mudra_model_new.keras")
print("✅ Model loaded successfully!")

# ---- Class names ----
class_names = ['Alapadmam', 'Alapadmam(1)', 'Anjali', 'Aralam', 'Aralam(1)', 'Ardhachandran',
'Ardhachandran(1)', 'Ardhapathaka', 'Ardhapathaka(1)', 'Berunda', 'Bramaram', 'Bramaram(1)',
'Chakra', 'Chandrakala', 'Chandrakala(1)', 'Chaturam', 'Chaturam(1)', 'Garuda', 'Hamsapaksha',
'Hamsapaksha(1)', 'Hamsasyam', 'Hamsasyam(1)', 'Kangulam', 'Kangulam(1)', 'Kapith', 'Kapith(1)',
'Kapotham', 'Karkatta', 'Kartariswastika', 'Katakamukha', 'Katakavardhana', 'Katrimukha',
'Khatva', 'Kilaka', 'Kurma', 'Matsya', 'Mayura', 'Mayura(1)', 'Mrigasirsha', 'Mrigasirsha(1)',
'Mukulam', 'Mukulam(1)', 'Mushti', 'Mushti(1)', 'Nagabandha', 'Padmakosha', 'Padmakosha(1)',
'Pasha', 'Pathaka', 'Pathaka(1)', 'Pushpaputa', 'Sakata', 'Samputa', 'Sarpasirsha',
'Sarpasirsha(1)', 'Shanka', 'Shivalinga', 'Shukatundam', 'Shukatundam(1)', 'Sikharam',
'Sikharam(1)', 'Simhamukham', 'Simhamukham(1)', 'Suchi', 'Suchi(1)', 'Swastikam',
'Tamarachudam', 'Tamarachudam(1)', 'Tripathaka', 'Tripathaka(1)', 'Trishulam', 'Trishulam(1)']

# ---- Mediapipe setup ----
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1,
                       min_detection_confidence=0.6, min_tracking_confidence=0.6)

def calculate_angles(landmarks):
    angles = []
    for i in range(len(landmarks) - 1):
        x1, y1, _ = landmarks[i]
        x2, y2, _ = landmarks[i + 1]
        angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
        angles.append(angle)
    return np.array(angles)

angle_history = deque(maxlen=5)

# ---- Start webcam ----
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Webcam not found")
    exit()
print("✅ Webcam running — press 'q' to quit")

while True:
    ret, frame = cap.read()
    if not ret:
        continue

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            h, w, _ = frame.shape
            x_coords = [lm.x for lm in hand_landmarks.landmark]
            y_coords = [lm.y for lm in hand_landmarks.landmark]
            pad = 60  # slightly bigger crop
            x_min = max(0, int(min(x_coords) * w) - pad)
            y_min = max(0, int(min(y_coords) * h) - pad)
            x_max = min(w, int(max(x_coords) * w) + pad)
            y_max = min(h, int(max(y_coords) * h) + pad)
            hand_img = frame[y_min:y_max, x_min:x_max]

            if hand_img.size == 0:
                continue

            # ✅ Match training setup (RGB resize + normalize + lighting adjust)
            hand_img = cv2.cvtColor(hand_img, cv2.COLOR_BGR2RGB)
            hand_img = cv2.convertScaleAbs(hand_img, alpha=1.3, beta=10)  # contrast/brightness
            img = cv2.resize(hand_img, (128, 128)).astype("float32") / 255.0
            img = np.expand_dims(img, axis=0)

            # 🔍 Debug view
            cv2.imshow("Model Input", cv2.resize(hand_img, (256, 256)))

            pred = model.predict(img, verbose=0)
            class_id = int(np.argmax(pred))
            confidence = float(np.max(pred))

            label = f"{class_names[class_id]} ({confidence*100:.1f}%)" if confidence > 0.4 else "Unknown"

            landmarks_np = np.array([[lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark])
            angles = calculate_angles(landmarks_np)
            angle_history.append(angles)
            avg_angles = np.mean(angle_history, axis=0).astype(int)

            cv2.putText(frame, label, (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            for i, angle in enumerate(avg_angles[:5]):
                cv2.putText(frame, f"A{i+1}:{angle}°", (x_min, y_min + 25 + i * 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

    cv2.imshow("Mudra Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
