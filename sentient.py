word_dict = {
    "love": 1,
    "amazing": 1,
    "good": 1,
    "great": 1,
    "happy": 1,
    "awesome": 1,
    "hate": 0,
    "terrible": 0,
    "bad": 0,
    "awful": 0,
    "sad": 0
}

def predict_text(text):
    """
    Predicts whether text is good (1) or bad (0) based on word dictionary.
    """
    text = text.lower().split()  # lowercase & split words
    score = 0
    count = 0
    
    for word in text:
        if word in word_dict:
            score += word_dict[word]
            count += 1

    if count == 0:
        return 0  # default to bad if no known words

    avg_score = score / count
    return 1 if avg_score >= 0.5 else 0

if __name__ == "__main__":
    print("Keyword-based Text Classifier")
    print("Enter text to classify (1=good, 0=bad). Type 'quit' to exit.\n")
    
    while True:
        user_input = input("Enter text: ")
        if user_input.lower() == "quit":
            break
        
        prediction = predict_text(user_input)
        label = "GOOD 👍" if prediction == 1 else "BAD 👎"
        print(f"Prediction: {prediction} ({label})\n")