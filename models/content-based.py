#!/usr/bin/env python
# Content-based Filtering Movie Recommendation System

# Import necessary libraries
import pandas as pd
import numpy as np
import re
import nltk
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import normalize
import faiss
import pickle
import os
from tqdm import tqdm
import warnings
import gc

# import matplotlib.pyplot as plt
# import seaborn as sns


warnings.filterwarnings("ignore")

# Download nltk resources
nltk.download("punkt")
nltk.download("stopwords")

# Stage 1: Data Processing
print("Stage 1: Data Processing")

# 1. Load the dataset
print("Loading dataset...")
df = pd.read_csv("/kaggle/input/tmdb-movie-dataset/TMDB_movies.csv")
print(f"Dataset loaded with shape: {df.shape}")

# 2. Handle missing values
print("Handling missing values...")
text_features = [
    "tagline",
    "keywords",
    "production_companies",
    "production_countries",
    "spoken_languages",
]
for feature in text_features:
    df[feature] = df[feature].fillna("")

# 3. Limit list features
print("Limiting list features...")


def limit_list_values(text, max_values):
    if pd.isna(text) or text == "":
        return ""
    items = [item.strip() for item in text.split(",")]
    return ", ".join(items[:max_values])


# Apply limits to list features
tqdm.pandas(desc="Processing production_companies")
df["production_companies"] = df["production_companies"].progress_apply(
    lambda x: limit_list_values(x, 3)
)

tqdm.pandas(desc="Processing production_countries")
df["production_countries"] = df["production_countries"].progress_apply(
    lambda x: limit_list_values(x, 2)
)

tqdm.pandas(desc="Processing genres")
df["genres"] = df["genres"].progress_apply(lambda x: limit_list_values(x, 4))

tqdm.pandas(desc="Processing cast")
df["cast"] = df["cast"].progress_apply(lambda x: limit_list_values(x, 10))

tqdm.pandas(desc="Processing director")
df["director"] = df["director"].progress_apply(lambda x: limit_list_values(x, 2))

tqdm.pandas(desc="Processing spoken_languages")
df["spoken_languages"] = df["spoken_languages"].progress_apply(
    lambda x: limit_list_values(x, 2)
)

# 4. Text feature processing
print("Processing text features...")

# Initialize stemmer
ps = PorterStemmer()


def preprocess_text(text):
    if pd.isna(text) or text == "":
        return ""

    # Convert to lowercase
    text = text.lower()

    # Remove special characters and punctuation
    text = re.sub(r"[^\w\s]", " ", text)

    # Tokenize
    tokens = nltk.word_tokenize(text)

    # Stemming
    stemmed_tokens = [ps.stem(token) for token in tokens]

    # Join back into a string
    return " ".join(stemmed_tokens)


# Apply text preprocessing to relevant columns
text_columns = [
    "overview",
    "tagline",
    "keywords",
    "production_companies",
    "cast",
    "director",
]

for column in text_columns:
    tqdm.pandas(desc=f"Preprocessing {column}")
    df[f"{column}_processed"] = df[column].progress_apply(preprocess_text)

# 5. Create TF-IDF vectors with weights
print("Creating TF-IDF vectors...")

# Weights for different features
feature_weights = {
    "overview_processed": 2,
    "tagline_processed": 1.2,
    "keywords_processed": 1.2,
    "production_companies_processed": 1.2,
    "cast_processed": 2,
    "director_processed": 1.5,
}


# Initialize storage for SVD results and vectorizers
svd_results = []
tfidf_vectorizers = {}

# Process each feature separately to reduce memory usage
for feature, weight in feature_weights.items():
    print(f"Processing TF-IDF for {feature} with weight {weight}...")

    # Initialize TF-IDF vectorizer with potentially lower max_features for very large datasets
    # Adjust max_features if memory is still an issue
    max_features = 10000
    tfidf = TfidfVectorizer(max_features=max_features, stop_words="english")

    # Fit and transform - keep as sparse matrix
    tfidf_matrix = tfidf.fit_transform(df[feature])

    # Apply weight to the sparse matrix
    weighted_matrix = tfidf_matrix * weight

    # Apply dimensionality reduction immediately to reduce memory footprint
    # Using a smaller number of components for intermediate SVD
    n_components = min(100, weighted_matrix.shape[1] // 2)
    svd_intermediate = TruncatedSVD(n_components=n_components, random_state=42)
    reduced_matrix = svd_intermediate.fit_transform(weighted_matrix)

    # Normalize the reduced matrix
    reduced_matrix = normalize(reduced_matrix)

    # Store the results and vectorizer
    svd_results.append(reduced_matrix)
    tfidf_vectorizers[feature] = tfidf

    # Delete large objects to free memory
    del tfidf_matrix, weighted_matrix
    gc.collect()

# Concatenate the reduced matrices
print("Combining reduced TF-IDF representations...")
combined_features = np.hstack(svd_results)

# Apply final dimensionality reduction
print("Applying final dimensionality reduction...")
svd = TruncatedSVD(n_components=200, random_state=42)
tfidf_svd = svd.fit_transform(combined_features)

# Clean up to free memory
del svd_results, combined_features
gc.collect()

# 6. Process categorical features
print("Processing categorical features...")


def extract_categories(text_list):
    if pd.isna(text_list) or text_list == "":
        return []
    return [item.strip() for item in text_list.split(",")]


# Extract category lists
tqdm.pandas(desc="Extracting genres")
df["genres_list"] = df["genres"].progress_apply(extract_categories)

tqdm.pandas(desc="Extracting spoken_languages")
df["spoken_languages_list"] = df["spoken_languages"].progress_apply(extract_categories)

tqdm.pandas(desc="Extracting production_countries")
df["production_countries_list"] = df["production_countries"].progress_apply(
    extract_categories
)

# Initialize MultiLabelBinarizers
genres_mlb = MultiLabelBinarizer()
languages_mlb = MultiLabelBinarizer()
countries_mlb = MultiLabelBinarizer()

# Transform categories to one-hot encoding
genres_encoded = genres_mlb.fit_transform(df["genres_list"])
languages_encoded = languages_mlb.fit_transform(df["spoken_languages_list"])
countries_encoded = countries_mlb.fit_transform(df["production_countries_list"])

print(f"Encoded genres shape: {genres_encoded.shape}")
print(f"Encoded languages shape: {languages_encoded.shape}")
print(f"Encoded countries shape: {countries_encoded.shape}")

# Stage 2: Model Building
print("\nStage 2: Model Building")

# 1. Build combined embeddings
print("Building combined embeddings...")
categorical_features = np.hstack([genres_encoded, languages_encoded, countries_encoded])

# Combine TF-IDF SVD and categorical features
combined_features = np.hstack([tfidf_svd, categorical_features])

# Normalize the combined features
final_embeddings = normalize(combined_features)
print(f"Final embeddings shape: {final_embeddings.shape}")

# 2. Set up FAISS Index
print("Setting up FAISS index...")
dimension = final_embeddings.shape[1]

# Convert to float32 for FAISS
embeddings_float32 = final_embeddings.astype("float32")

# Set up GPU resources for FAISS optimized for P100 with 16GB VRAM
print("Initializing GPU resources for FAISS (P100 GPU with 16GB VRAM)...")
try:
    # Try to directly use GPU index first (more efficient way in newer FAISS versions)
    import faiss.contrib.torch_utils  # Import torch_utils to enable PyTorch GPU tensor support

    # Initialize GPU resources in FAISS
    res = faiss.StandardGpuResources()

    res.setTempMemory(1024 * 1024 * 4096)  # 4GB of temporary memory

    nlist = 2048
    nprobe = 128

    # Create a factory for GPU index
    gpu_config = faiss.GpuIndexIVFFlatConfig()
    gpu_config.device = 0  # Use first GPU
    gpu_config.indicesOptions = (
        faiss.INDICES_32_BIT
    )  # Use 32-bit indices to save memory
    gpu_config.flatConfig.useFloat16 = False

    # Create index - using direct GPU creation method
    index = faiss.GpuIndexIVFFlat(res, dimension, nlist, faiss.METRIC_L2, gpu_config)

    print("Successfully created GPU FAISS index directly on GPU")
    using_gpu = True

except Exception as e:
    print(f"Direct GPU index creation failed: {e}")
    print("Trying alternate GPU index creation method...")

    try:
        # Fallback to CPU->GPU transfer method
        # Create CPU index template
        print("Creating CPU index template...")
        cpu_index = faiss.IndexIVFFlat(
            faiss.IndexFlatL2(dimension), dimension, nlist, faiss.METRIC_L2
        )

        # Transfer to GPU
        print("Transferring index to GPU...")
        gpu_options = faiss.GpuIndexIVFFlatConfig()
        gpu_options.device = 0  # Use first GPU
        index = faiss.index_cpu_to_gpu(res, 0, cpu_index, gpu_options)

        print("Successfully created GPU FAISS index via CPU->GPU transfer")
        using_gpu = True

    except Exception as e2:
        print(f"GPU FAISS initialization failed: {e2}")
        print("Falling back to CPU index")

        # Create CPU index as fallback
        quantizer = faiss.IndexFlatL2(dimension)
        nlist = 1000
        index = faiss.IndexIVFFlat(quantizer, dimension, nlist, faiss.METRIC_L2)
        using_gpu = False

# Train the index
print("Training FAISS index...")
index.train(embeddings_float32)

# Add vectors to index - optimized batch size for P100
print("Adding vectors to FAISS index...")
batch_size = 50000 if using_gpu else 10000
for i in tqdm(range(0, len(embeddings_float32), batch_size), desc="Adding to FAISS"):
    end_idx = min(i + batch_size, len(embeddings_float32))
    batch = embeddings_float32[i:end_idx]
    index.add(batch)

# Set nprobe for better recall
if using_gpu:
    print(f"Setting nprobe to {nprobe} for better recall (P100 GPU)")
    index.nprobe = nprobe
else:
    print("Setting nprobe to 50 (CPU fallback)")
    index.nprobe = 50

# Add GPU warmup search for better initial performance
if using_gpu:
    print("Performing warmup search to initialize GPU kernels...")
    # Create a dummy query
    dummy_query = np.random.rand(1, dimension).astype("float32")
    # Perform a warmup search
    index.search(dummy_query, 10)
    print("GPU warmup complete")

# 3. Build recommendation function
print("Building recommendation function...")


def recommend_movies(movie_id, top_n=10):
    # Find movie index
    if movie_id not in df["movie_id"].values:
        return "Movie ID not found in the dataset"

    movie_idx = df[df["movie_id"] == movie_id].index[0]

    # Get movie embedding
    movie_embedding = embeddings_float32[movie_idx].reshape(1, -1)

    # Search similar movies
    index.nprobe = 50
    D, I = index.search(
        movie_embedding, top_n + 1
    )  # +1 because the movie itself will be included

    # Get recommended movie IDs (excluding the query movie)
    recommended_indices = [idx for idx in I[0] if idx != movie_idx][:top_n]

    # Get the corresponding distances for the recommended indices
    distances = [D[0][list(I[0]).index(idx)] for idx in recommended_indices]

    # Convert L2 distances to cosine similarity scores (since FAISS uses L2 distance)
    # Cosine similarity = 1 - (L2_distance^2 / 2) when vectors are normalized
    cosine_similarities = [1 - (dist**2 / 2) for dist in distances]

    # Create a dataframe with recommendations and similarity scores
    recommended_movies = df.iloc[recommended_indices][
        ["movie_id", "title", "genres"]
    ].copy()
    recommended_movies["cosine_similarity"] = cosine_similarities

    # Sort by similarity score (highest first)
    recommended_movies = recommended_movies.sort_values(
        "cosine_similarity", ascending=False
    )

    return recommended_movies


# Test the recommendation function
print("\nTesting recommendation function...")
# Example: Avatar
example_movie_id = 19995  # Avatar
if example_movie_id in df["movie_id"].values:
    print(
        f"Recommendations for movie ID {example_movie_id} ({df[df['movie_id'] == example_movie_id]['title'].values[0]}):"
    )
    print(recommend_movies(example_movie_id))
else:
    print(
        f"Test movie ID {example_movie_id} not found in dataset, please use a valid movie_id for testing"
    )

# Stage 3: Save the model
print("\nStage 3: Saving model components...")

# Create directory for models if it doesn't exist
os.makedirs("models", exist_ok=True)

# 1. Save TF-IDF Vectorizers
print("Saving TF-IDF vectorizers...")
with open("models/tfidf_vectorizers.pkl", "wb") as f:
    pickle.dump(tfidf_vectorizers, f)

# 2. Save Truncated SVD model
print("Saving SVD model...")
with open("models/svd_model.pkl", "wb") as f:
    pickle.dump(svd, f)

# 3. Save MultiLabelBinarizers
print("Saving MultiLabelBinarizers...")
with open("models/genres_mlb.pkl", "wb") as f:
    pickle.dump(genres_mlb, f)

with open("models/languages_mlb.pkl", "wb") as f:
    pickle.dump(languages_mlb, f)

with open("models/countries_mlb.pkl", "wb") as f:
    pickle.dump(countries_mlb, f)

# 4. Save FAISS index
print("Saving FAISS index...")
if using_gpu:
    print("Converting GPU index to CPU for serialization...")
    # GPU indices cannot be directly serialized - convert to CPU first
    cpu_index = faiss.index_gpu_to_cpu(index)
    print(f"CPU index type: {type(cpu_index).__name__}")

    # Save the CPU version
    faiss.write_index(cpu_index, "models/movie_recommendations.index")
    print("CPU index saved successfully")
else:
    # Already a CPU index, save directly
    faiss.write_index(index, "models/movie_recommendations.index")

# 5. Save movie dataframe (for reference)
print("Saving movie reference dataframe...")
df[["movie_id", "title", "genres"]].to_csv("models/movie_reference.csv", index=False)

print("All model components saved successfully!")
