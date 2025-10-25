from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Allow cross-origin requests from your frontend

# --- CHATBOT STATE AND QUESTIONS ---

# 1. The list of questions, ordered for the screening process.
# Each question is a string.
QUESTIONS = [
    # Social Isolation Indicators
    "Have you intentionally withdrawn from social activities or friends recently?",
    "Do you frequently feel isolated or alone, even when you are with others?",
    "Are you spending significantly more time by yourself than you used to?",
    "Have you started avoiding family gatherings or social events?",
    "Has your addiction or substance use led you to isolate yourself from your peers?",
    # Financial Issues Indicators
    "Have you experienced financial difficulties or debt directly related to your habit?",
    "Are you frequently running out of money because of the cost of your addiction?",
    "Have you ever borrowed or stolen money to support your substance use or habit?",
    "Do you spend money on your addiction instead of essential items like food or tuition?",
    # ... and so on for the rest of your questions
    # Note: I've truncated the list for brevity. Add all your questions here.
    "Have you noticed a decline in your overall physical health since your habit started?",
    "Are you experiencing new or worsening mental health issues like anxiety or depression?",
    "When you stop using or engaging in your habit, do you experience physical discomfort or sickness?",
    "Have you engaged in dangerous or reckless activities while under the influence of a substance?",
    "Do you ignore obvious dangers or consequences when pursuing your habit?",
]

# 2. Tracking the session state (in-memory for this example)
# NOTE: For a real app with multiple users, this should be stored in a database
# and linked to a user session ID.
user_session_data = {
    "current_question_index": 0,
    "yes_score": 0,
    "is_assessment_complete": False,
    "initial_greeting_sent": False
}

# --- FLASK ROUTES ---

# New route to start/reset the assessment
@app.route("/start-assessment", methods=["GET"])
def start_assessment():
    """Resets the assessment and returns the first question."""
    global user_session_data
    user_session_data = {
        "current_question_index": 0,
        "yes_score": 0,
        "is_assessment_complete": False,
        "initial_greeting_sent": True # Assuming this is called to start
    }
    
    first_question = QUESTIONS[0] if QUESTIONS else "No questions configured."
    return jsonify({
        "response": f"Welcome to the screening. Please answer 'Yes' or 'No' to the following questions. Your answers are private. Let's start. \n\n**Question 1:** {first_question}",
        "status": "in_progress",
        "question_number": 1
    })

# Main route to process user answers and return the next question or result
@app.route("/get-response", methods=["POST"])
def get_response():
    global user_session_data
    data = request.get_json()
    user_message = data.get("message", "").lower().strip()
    
    # Check if the user has started the assessment
    if not user_session_data["initial_greeting_sent"]:
        # Direct the user to start the assessment first
        return jsonify({
            "response": "Please start the assessment first by calling the /start-assessment endpoint.",
            "status": "ready_to_start"
        })

    # 1. Process the previous question's answer (if we're past the first question)
    current_index = user_session_data["current_question_index"]
    
    # We only process the score if the user gave a valid answer and it's not the start message itself
    if current_index > 0 and not user_session_data["is_assessment_complete"]:
        # The expected answers are 'yes' or 'no'
        if "yes" in user_message:
            user_session_data["yes_score"] += 1
        elif "no" in user_message:
            # Score doesn't change, but it's a valid answer
            pass
        else:
            # Handle invalid response for the current question
            # Decrement the index so the user is asked the SAME question again
            user_session_data["current_question_index"] -= 1
            question_to_re_ask = QUESTIONS[current_index - 1] # Index was already incremented at the end of the last call
            return jsonify({
                "response": f"I didn't understand that. Please answer clearly 'Yes' or 'No'.\n\n**Question {current_index}:** {question_to_re_ask}",
                "status": "in_progress",
                "question_number": current_index
            })

    # 2. Check for completion and determine the next response
    next_index = user_session_data["current_question_index"]
    
    if next_index < len(QUESTIONS):
        # The assessment is still in progress: return the next question
        next_question = QUESTIONS[next_index]
        question_num = next_index + 1
        user_session_data["current_question_index"] += 1
        
        return jsonify({
            "response": f"**Question {question_num}:** {next_question}",
            "status": "in_progress",
            "question_number": question_num
        })
    else:
        # The assessment is complete: calculate and return the final result
        user_session_data["is_assessment_complete"] = True
        final_score = user_session_data["yes_score"]
        total_questions = len(QUESTIONS)
        
        # Determine the final message based on the score threshold
        # You'll need to define an appropriate threshold (e.g., a percentage or fixed number)
        THRESHOLD = 5 # Example threshold
        
        if final_score >= THRESHOLD:
            conclusion = f"Based on your score of {final_score} out of {total_questions}, your responses indicate a **potential for addiction or problematic substance/habit use**. It is highly recommended that you speak with a healthcare professional or a licensed counselor for a formal evaluation and support."
            result_category = "ADDICTION_CONCERN"
        else:
            conclusion = f"Your score is {final_score} out of {total_questions}. While this does not indicate an immediate high risk based on this screening, if you have any concerns about your habit, you should still consider speaking with a professional."
            result_category = "LOWER_RISK"
            
        # Reset the index for the next run
        user_session_data["current_question_index"] = 0
        user_session_data["yes_score"] = 0
        user_session_data["initial_greeting_sent"] = False
        
        return jsonify({
            "response": f"Assessment complete! Thank you for your honest answers. \n\n**RESULT:** {conclusion}",
            "status": "complete",
            "score": final_score,
            "category": result_category
        })

if __name__ == "__main__":
    app.run(debug=True)