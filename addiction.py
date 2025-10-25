import pandas as pd
import numpy as np

# ------------------------------
# 1️⃣ Load dataset
# ------------------------------
df = pd.read_csv("student_addiction_dataset_train.csv")

# ------------------------------
# 2️⃣ Clean dataset
# ------------------------------
# Identify all feature columns except the target
feature_cols = df.columns[:-1]  # all columns except Addiction_Class
target_col = 'Addiction_Class'

# Normalize text and convert Yes/No → 1/0 safely
for col in feature_cols:
    if df[col].dtype == 'object':  # Only apply to non-numeric columns
        df[col] = (
            df[col]
            .astype(str)
            .str.strip()
            .str.lower()
            .map({'yes': 1, 'no': 0})
        )
    # Replace NaNs after mapping
    df[col] = df[col].fillna(0)

# Ensure target is numeric (0 = not addicted, 1 = addicted)
df[target_col] = df[target_col].map({'Yes': 1, 'No': 0})
df[target_col] = df[target_col].fillna(0).astype(int)

# Separate addicted vs not addicted rows
addicted = df[df[target_col] == 1][feature_cols]
not_addicted = df[df[target_col] == 0][feature_cols]

# ------------------------------
# 3️⃣ Ask user for input
# ------------------------------
print("Answer the following questions with Yes or No:\n")
user_answers = []

for col in feature_cols:
    while True:
        ans = input(f"{col.replace('_',' ')}: ").strip().lower()
        if ans in ['yes', 'no']:
            user_answers.append(1 if ans == 'yes' else 0)
            break
        else:
            print("Please answer 'Yes' or 'No'.")

# Create user input as Series with correct column alignment
user_input = pd.Series(user_answers, index=feature_cols)

# ------------------------------
# 4️⃣ Similarity function
# ------------------------------
def similarity_score(user, group):
    """Compute average fraction of matching answers, ignoring NaNs."""
    return group.apply(lambda row: (row.fillna(0) == user.fillna(0)).mean(), axis=1).mean()

sim_addicted = similarity_score(user_input, addicted)
sim_not_addicted = similarity_score(user_input, not_addicted)

# ------------------------------
# 5️⃣ Compute addiction percentage
# ------------------------------
if np.isnan(sim_addicted) or np.isnan(sim_not_addicted) or (sim_addicted + sim_not_addicted == 0):
    addiction_percent = 0
else:
    addiction_percent = sim_addicted / (sim_addicted + sim_not_addicted) * 100

# ------------------------------
# 6️⃣ Decide predicted class
# ------------------------------
predicted_class = "Addicted" if sim_addicted > sim_not_addicted else "Not Addicted"

# ------------------------------
# 7️⃣ Output results
# ------------------------------
print("\n--- Prediction Results ---")
print(f"Predicted addiction class: {predicted_class}")
print(f"Predicted addiction percentage: {addiction_percent:.1f}%")

print("\nDebug Info (optional):")
print(f"Similarity with Addicted group: {sim_addicted:.3f}")
print(f"Similarity with Not Addicted group: {sim_not_addicted:.3f}")