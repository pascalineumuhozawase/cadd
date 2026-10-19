"""
CADD — MobileNetV2 Training Script
===================================
Trains a cassava leaf disease classifier compatible with ai-service.

Classes (order is CRITICAL): ["CBB", "CBSD", "CGM", "CMD", "healthy"]
Output: ../models/mobilenetv2_cassava.keras

Run:
    cd ai-service/notebooks
    python train_model.py
"""
import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# ============================================================
# CONFIG
# ============================================================
SERVICE_DIR = Path(__file__).resolve().parents[1]
DATASET_DIR = SERVICE_DIR / "notebooks" / "dataset" / "data"
MODEL_OUT_DIR = SERVICE_DIR / "models"
MODEL_OUT_PATH = MODEL_OUT_DIR / "mobilenetv2_cassava.keras"

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
SEED = 42
EPOCHS_HEAD = 8
EPOCHS_FINETUNE = 5

# ⚠️ MUST match ai-service/app/core/config.py
CLASS_NAMES = ["CBB", "CBSD", "CGM", "CMD", "healthy"]

SOURCE_CLASS_DIRS = [
    "Cassava___bacterial_blight",
    "Cassava___brown_streak_disease",
    "Cassava___green_mottle",
    "Cassava___mosaic_disease",
    "Cassava___healthy",
]
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

print("=" * 60)
print("CADD MobileNetV2 Training")
print("TensorFlow:", tf.__version__)
print("GPUs available:", tf.config.list_physical_devices("GPU"))
print("=" * 60)


# ============================================================
# STEP 1 — Validate the existing per-class folders
# ============================================================
missing_dirs = [name for name in SOURCE_CLASS_DIRS if not (DATASET_DIR / name).is_dir()]
if missing_dirs:
    raise FileNotFoundError(
        f"Missing class folders under {DATASET_DIR}: {', '.join(missing_dirs)}"
    )

image_counts = {
    index: sum(
        1 for path in (DATASET_DIR / directory).iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    )
    for index, directory in enumerate(SOURCE_CLASS_DIRS)
}
empty_dirs = [SOURCE_CLASS_DIRS[index] for index, count in image_counts.items() if count == 0]
if empty_dirs:
    raise ValueError(f"No supported images found in: {', '.join(empty_dirs)}")

print(f"[DATA] Using class folders: {DATASET_DIR}")
for index, name in enumerate(CLASS_NAMES):
    print(f"[DATA] {name}: {image_counts[index]} images")


# ============================================================
# STEP 2 — Build a stratified training/validation split
# ============================================================
random_generator = np.random.default_rng(SEED)
train_paths = []
train_labels = []
validation_paths = []
validation_labels = []

for class_index, directory in enumerate(SOURCE_CLASS_DIRS):
    class_paths = sorted(
        path for path in (DATASET_DIR / directory).iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    )
    random_generator.shuffle(class_paths)
    split_index = max(1, min(len(class_paths) - 1, int(len(class_paths) * 0.8)))
    train_paths.extend(str(path) for path in class_paths[:split_index])
    train_labels.extend([class_index] * split_index)
    validation_paths.extend(str(path) for path in class_paths[split_index:])
    validation_labels.extend([class_index] * (len(class_paths) - split_index))

train_labels = np.asarray(train_labels, dtype=np.int32)
validation_labels = np.asarray(validation_labels, dtype=np.int32)
train_class_counts = np.bincount(train_labels, minlength=len(CLASS_NAMES))
if np.any(train_class_counts == 0):
    raise ValueError("Every class must have at least one training image.")

total_images = sum(image_counts.values())
class_weight_dict = {
    class_index: len(train_labels) / (len(CLASS_NAMES) * int(class_count))
    for class_index, class_count in enumerate(train_class_counts)
}
print("Training class weights:", class_weight_dict)

AUTOTUNE = tf.data.AUTOTUNE

def load_image(image_path, label):
    image = tf.io.read_file(image_path)
    image = tf.io.decode_image(image, channels=3, expand_animations=False)
    image.set_shape([None, None, 3])
    image = tf.image.resize(image, IMG_SIZE)
    return image, label

train_ds = tf.data.Dataset.from_tensor_slices((train_paths, train_labels))
train_ds = train_ds.shuffle(len(train_paths), seed=SEED, reshuffle_each_iteration=True)
train_ds = train_ds.map(load_image, num_parallel_calls=AUTOTUNE)
train_ds = train_ds.batch(BATCH_SIZE).prefetch(AUTOTUNE)

val_ds = tf.data.Dataset.from_tensor_slices((validation_paths, validation_labels))
val_ds = val_ds.map(load_image, num_parallel_calls=AUTOTUNE)
val_ds = val_ds.batch(BATCH_SIZE).prefetch(AUTOTUNE)

print("[DATA] Training images by class:", train_class_counts.tolist())
print("[DATA] Validation images by class:", np.bincount(validation_labels, minlength=len(CLASS_NAMES)).tolist())
print(f"[DATA] Model output order: {CLASS_NAMES}")


# ============================================================
# STEP 3 — Build the model
# ============================================================
data_augmentation = keras.Sequential(
    [
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.08),
        layers.RandomZoom(0.10),
    ],
    name="augmentation",
)

base_model = keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet",
)
base_model.trainable = False

inputs  = keras.Input(shape=(224, 224, 3), name="leaf_image")
x       = data_augmentation(inputs)
x       = keras.applications.mobilenet_v2.preprocess_input(x)  # ✅ matches ai-service
x       = base_model(x, training=False)
x       = layers.GlobalAveragePooling2D(name="gap")(x)
x       = layers.Dropout(0.25, name="dropout")(x)
outputs = layers.Dense(len(CLASS_NAMES), activation="softmax",
                       name="class_probabilities")(x)          # ✅ 5 outputs

model = keras.Model(inputs, outputs, name="cadd_mobilenetv2")

model.compile(
    optimizer=keras.optimizers.Adam(1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

model.summary()


# ============================================================
# STEP 4 — Phase 1: Train the new head
# ============================================================
MODEL_OUT_DIR.mkdir(parents=True, exist_ok=True)

callbacks = [
    keras.callbacks.EarlyStopping(
        monitor="val_loss", patience=3, restore_best_weights=True
    ),
    keras.callbacks.ModelCheckpoint(
        str(MODEL_OUT_PATH), monitor="val_accuracy",
        save_best_only=True, verbose=1
    ),
    keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss", factor=0.5, patience=2, min_lr=1e-6, verbose=1
    ),
]

print("\n[PHASE 1] Training head only...")
history1 = model.fit(
    train_ds, validation_data=val_ds,
    epochs=EPOCHS_HEAD, 
    callbacks=callbacks,
    class_weight=class_weight_dict  # 👈 ADD THIS LINE
)


# ============================================================
# STEP 5 — Phase 2: Fine-tune top of MobileNetV2
# ============================================================
base_model.trainable = True
# Freeze all but the last 30 layers
for layer in base_model.layers[:-30]:
    layer.trainable = False
# Keep BatchNorm frozen
for layer in base_model.layers:
    if isinstance(layer, layers.BatchNormalization):
        layer.trainable = False

model.compile(
    optimizer=keras.optimizers.Adam(1e-5),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)
print("\n[PHASE 2] Fine-tuning top layers...")
history2 = model.fit(
    train_ds, validation_data=val_ds,
    epochs=EPOCHS_FINETUNE, callbacks=callbacks, class_weight=class_weight_dict,
)


# ============================================================
# STEP 6 — Final save (guarantees the file exists)
# ============================================================
model.save(MODEL_OUT_PATH)
print(f"\n✅ Model saved: {MODEL_OUT_PATH.resolve()}")

# Save class list as a sidecar for reference
with open(MODEL_OUT_DIR / "class_names.json", "w", encoding="utf-8") as f:
    json.dump(CLASS_NAMES, f, indent=2)


# ============================================================
# STEP 7 — Evaluation
# ============================================================
print("\n[EVAL] Running on validation set...")
y_true = np.concatenate([batch_labels.numpy() for _, batch_labels in val_ds])
y_prob = model.predict(val_ds, verbose=1)
y_pred = y_prob.argmax(axis=1)
confusion = np.zeros((len(CLASS_NAMES), len(CLASS_NAMES)), dtype=np.int64)
np.add.at(confusion, (y_true, y_pred), 1)
print("\nConfusion matrix (rows=true, columns=predicted):")
print(confusion)


# ============================================================
# STEP 8 — Compatibility self-test
# ============================================================
print("\n[SELF-TEST] Verifying compatibility with ai-service...")
reloaded = tf.keras.models.load_model(MODEL_OUT_PATH)
dummy = np.zeros((1, 224, 224, 3), dtype=np.float32)
out = reloaded.predict(dummy, verbose=0)

assert out.shape == (1, len(CLASS_NAMES)), \
    f"Output shape wrong: {out.shape}"
assert abs(float(out.sum()) - 1.0) < 1e-3, \
    f"Output is not a probability distribution: sum={out.sum()}"
print(f"[SELF-TEST] ✅ Output shape: {out.shape}")
print(f"[SELF-TEST] ✅ Sum of probabilities: {float(out.sum()):.4f}")
print(f"[SELF-TEST] ✅ Classes: {CLASS_NAMES}")
print("\n🎉 Training complete. The model is ready for ai-service.")

data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.2), # Increase rotation
    layers.RandomZoom(0.2),     # Zoom in on the leaf
    layers.RandomContrast(0.2), # Handle different lighting
])