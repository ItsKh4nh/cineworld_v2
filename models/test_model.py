import pandas as pd
import numpy as np
import torch
import os
from collaborative import NCF

# Load the ratings data
ratings = pd.read_csv("/kaggle/input/tmdb-movie-dataset/movielens.csv")
ratings["title"] = ratings["title"].astype("string")

# Get the necessary variables
num_users = ratings["user_id"].max() + 1
num_items = ratings["movie_id"].max() + 1
all_movie_ids = ratings["movie_id"].unique()

# Create a dictionary of user interacted items
user_interacted_items = ratings.groupby("user_id")["movie_id"].apply(list).to_dict()

# Load the model
model_save_path = "saved_models/ncf_model.pt"

# Check if model exists
if not os.path.exists(model_save_path):
    print(f"Error: Model file not found at {model_save_path}")
    exit(1)

# Initialize model with the same parameters
model = NCF(num_users, num_items, None, None)  # We don't need training data here
model.load_state_dict(torch.load(model_save_path))
model.eval()  # Set to evaluation mode


def get_movie_recommendations(user_id, top_n=10):
    """
    Generate movie recommendations for a user

    Args:
        user_id (int): ID of the user
        top_n (int): Number of movies to recommend

    Returns:
        DataFrame: List of recommended movies with prediction scores
    """
    # Get list of movies that the user has already interacted with
    interacted_items = user_interacted_items.get(user_id, [])

    # Get list of movies that the user hasn't seen yet
    not_interacted_items = list(set(all_movie_ids) - set(interacted_items))

    # If there are too many movies, sample 1000 randomly to speed up computation
    if len(not_interacted_items) > 1000:
        not_interacted_items = list(np.random.choice(not_interacted_items, 1000))

    # Predict the likelihood that the user will like each movie
    user_tensor = torch.tensor([user_id] * len(not_interacted_items))
    item_tensor = torch.tensor(not_interacted_items)

    with torch.no_grad():
        predicted_ratings = model(user_tensor, item_tensor).detach().numpy().flatten()

    # Create DataFrame with movies and prediction scores
    recommendations = pd.DataFrame(
        {"movie_id": not_interacted_items, "predicted_rating": predicted_ratings}
    )

    # Sort by highest prediction score
    recommendations = recommendations.sort_values("predicted_rating", ascending=False)

    # Get top_n movies with highest prediction scores
    top_recommendations = recommendations.head(top_n)

    # Get movie title information from original dataset
    movie_info = ratings[["movie_id", "title"]].drop_duplicates().set_index("movie_id")

    # Add movie titles to results
    top_recommendations["title"] = top_recommendations["movie_id"].map(
        movie_info["title"]
    )

    return top_recommendations[["movie_id", "title", "predicted_rating"]]


if __name__ == "__main__":
    # Test with random users
    test_users = np.random.choice(ratings["user_id"].unique(), 3)
    print("Movie recommendations for 3 random users:")

    for user_id in test_users:
        print(f"\nUser {user_id}:")

        # Print some movies this user has already watched
        user_movies = ratings[ratings["user_id"] == user_id][
            ["movie_id", "title", "rating"]
        ].drop_duplicates()
        print(f"Some movies already watched (total of {len(user_movies)} movies):")
        print(
            user_movies.sample(min(5, len(user_movies)))[["title", "rating"]].to_string(
                index=False
            )
        )

        # Get movie recommendations
        recommendations = get_movie_recommendations(user_id)
        print("\nRecommended movies:")
        print(recommendations[["title", "predicted_rating"]].to_string(index=False))
        print("-" * 80)
