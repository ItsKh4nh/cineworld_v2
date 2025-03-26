import pandas as pd
import numpy as np
from tqdm.notebook import tqdm

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import pytorch_lightning as pl
from pytorch_lightning.callbacks import TQDMProgressBar

np.random.seed(123)

ratings = pd.read_csv("/kaggle/input/tmdb-movie-dataset/movielens.csv")

# Convert the timestamp column from Unix timestamp to datetime
ratings["timestamp"] = pd.to_datetime(ratings["timestamp"], unit="s")
# Convert the title column to string dtype
ratings["title"] = ratings["title"].astype("string")

ratings.info()

rand_user_ids = np.random.choice(
    ratings["user_id"].unique(),
    size=int(len(ratings["user_id"].unique()) * 0.5),
    replace=False,
)

ratings = ratings.loc[ratings["user_id"].isin(rand_user_ids)]

print(
    "There are {} rows of data from {} users".format(len(ratings), len(rand_user_ids))
)

ratings.sample(5)

ratings["rank_latest"] = ratings.groupby(["user_id"])["timestamp"].rank(
    method="first", ascending=False
)

train_ratings = ratings[ratings["rank_latest"] != 1]
test_ratings = ratings[ratings["rank_latest"] == 1]

# drop columns that we no longer need
train_ratings = train_ratings[["user_id", "movie_id", "rating"]]
test_ratings = test_ratings[["user_id", "movie_id", "rating"]]

train_ratings.loc[:, "rating"] = 1

train_ratings.sample(5)

# Get a list of all movie IDs
all_movie_ids = ratings["movie_id"].unique()

# Placeholders that will hold the training data
users, items, labels = [], [], []

# This is the set of items that each user has interaction with
user_item_set = set(zip(train_ratings["user_id"], train_ratings["movie_id"]))

# 4:1 ratio of negative to positive samples
num_negatives = 4

for u, i in tqdm(user_item_set):
    users.append(u)
    items.append(i)
    labels.append(1)  # items that the user has interacted with are positive
    for _ in range(num_negatives):
        # randomly select an item
        negative_item = np.random.choice(all_movie_ids)
        # check that the user has not interacted with this item
        while (u, negative_item) in user_item_set:
            negative_item = np.random.choice(all_movie_ids)
        users.append(u)
        items.append(negative_item)
        labels.append(0)  # items not interacted with are negative


class MovieLensTrainDataset(Dataset):
    """MovieLens PyTorch Dataset for Training

    Args:
        ratings (pd.DataFrame): Dataframe containing the movie ratings
        all_movie_ids (list): List containing all movie_ids

    """

    def __init__(self, ratings, all_movie_ids):
        self.users, self.items, self.labels = self.get_dataset(ratings, all_movie_ids)

    def __len__(self):
        return len(self.users)

    def __getitem__(self, idx):
        return self.users[idx], self.items[idx], self.labels[idx]

    def get_dataset(self, ratings, all_movie_ids):
        users, items, labels = [], [], []
        user_item_set = set(zip(ratings["user_id"], ratings["movie_id"]))

        num_negatives = 4
        for u, i in user_item_set:
            users.append(u)
            items.append(i)
            labels.append(1)
            for _ in range(num_negatives):
                negative_item = np.random.choice(all_movie_ids)
                while (u, negative_item) in user_item_set:
                    negative_item = np.random.choice(all_movie_ids)
                users.append(u)
                items.append(negative_item)
                labels.append(0)

        return torch.tensor(users), torch.tensor(items), torch.tensor(labels)


class NCF(pl.LightningModule):
    """Neural Collaborative Filtering (NCF)

    Args:
        num_users (int): Number of unique users
        num_items (int): Number of unique items
        ratings (pd.DataFrame): Dataframe containing the movie ratings for training
        all_movie_ids (list): List containing all movie_ids (train + test)
    """

    def __init__(self, num_users, num_items, ratings, all_movie_ids):
        super().__init__()
        self.user_embedding = nn.Embedding(num_embeddings=num_users, embedding_dim=8)
        self.item_embedding = nn.Embedding(num_embeddings=num_items, embedding_dim=8)
        self.fc1 = nn.Linear(in_features=16, out_features=64)
        self.fc2 = nn.Linear(in_features=64, out_features=32)
        self.output = nn.Linear(in_features=32, out_features=1)
        self.ratings = ratings
        self.all_movie_ids = all_movie_ids

    def forward(self, user_input, item_input):

        # Pass through embedding layers
        user_embedded = self.user_embedding(user_input)
        item_embedded = self.item_embedding(item_input)

        # Concat the two embedding layers
        vector = torch.cat([user_embedded, item_embedded], dim=-1)

        # Pass through dense layer
        vector = nn.ReLU()(self.fc1(vector))
        vector = nn.ReLU()(self.fc2(vector))

        # Output layer
        pred = nn.Sigmoid()(self.output(vector))

        return pred

    def training_step(self, batch, batch_idx):
        user_input, item_input, labels = batch
        predicted_labels = self(user_input, item_input)
        loss = nn.BCELoss()(predicted_labels, labels.view(-1, 1).float())
        return loss

    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters())

    def train_dataloader(self):
        return DataLoader(
            MovieLensTrainDataset(self.ratings, self.all_movie_ids),
            batch_size=512,
            num_workers=4,
        )


num_users = ratings["user_id"].max() + 1
num_items = ratings["movie_id"].max() + 1

all_movie_ids = ratings["movie_id"].unique()

model = NCF(num_users, num_items, train_ratings, all_movie_ids)

# First check if CUDA is available
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU device: {torch.cuda.get_device_name(0)}")

# Define trainer with explicit GPU settings if available
trainer = pl.Trainer(
    max_epochs=5,
    accelerator="gpu" if torch.cuda.is_available() else "cpu",
    devices=1,
    reload_dataloaders_every_n_epochs=1,
    callbacks=[TQDMProgressBar(refresh_rate=20)],  # Explicit progress bar callback
    logger=False,
    enable_checkpointing=False,
)

# Print trainer details
print(f"Training on: {trainer.accelerator}")  # Use trainer.accelerator instead

# Fit the model
trainer.fit(model)

# User-item pairs for testing
test_user_item_set = set(zip(test_ratings["user_id"], test_ratings["movie_id"]))

# Dict of all items that are interacted with by each user
user_interacted_items = ratings.groupby("user_id")["movie_id"].apply(list).to_dict()

hits = []
for u, i in tqdm(test_user_item_set):
    interacted_items = user_interacted_items[u]
    not_interacted_items = set(all_movie_ids) - set(interacted_items)
    selected_not_interacted = list(np.random.choice(list(not_interacted_items), 99))
    test_items = selected_not_interacted + [i]

    predicted_labels = np.squeeze(
        model(torch.tensor([u] * 100), torch.tensor(test_items)).detach().numpy()
    )

    top10_items = [
        test_items[i] for i in np.argsort(predicted_labels)[::-1][0:10].tolist()
    ]

    if i in top10_items:
        hits.append(1)
    else:
        hits.append(0)

print("The Hit Ratio @ 10 is {:.2f}".format(np.average(hits)))


# Test the model with specific users
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
