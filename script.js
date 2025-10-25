// DOM Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const hero = document.getElementById('hero');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.remove('active');
    }
});

// Tab Navigation
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        // Update active button
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        tabContents.forEach(tab => tab.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Show/hide hero based on tab
        if (tabName === 'chat') {
            hero.style.display = 'block';
        } else {
            hero.style.display = 'none';
        }
        
        // Close mobile menu
        mobileMenu.classList.remove('active');
    });
});

const conversationFlow = [
    {
        id: "icebreaker1",
        question: "Hey there! How are you feeling today?",
        next: (answer) => {
            if (answer.toLowerCase().includes("good") || answer.toLowerCase().includes("fine")) return "icebreaker2";
            return "followup1";
        }
    },
    {
        id: "icebreaker2",
        question: "Glad to hear that 😊! How has your week been so far?",
        next: () => "followup2"
    },
    {
        id: "followup1",
        question: "I’m sorry to hear that. What’s been on your mind lately?",
        next: () => "followup2"
    },
    {
        id: "followup2",
        question: "When you’re stressed or upset, what do you usually do to feel better?",
        next: (answer) => {
            if (answer.toLowerCase().includes("friends")) return "followup3_friends";
            if (answer.toLowerCase().includes("alone")) return "followup3_alone";
            return "followup3_generic";
        }
    },
    {
        id: "followup3_friends",
        question: "That’s great that you have supportive friends! Do you ever feel like they influence your habits or choices?",
        next: () => "wrapup"
    },
    {
        id: "followup3_alone",
        question: "It sounds like you prefer handling things on your own. Does that ever get overwhelming?",
        next: () => "wrapup"
    },
    {
        id: "followup3_generic",
        question: "That’s one way to handle it. Has that been helping you lately?",
        next: () => "wrapup"
    },
    {
        id: "wrapup",
        question: "Thanks for sharing that. Would you like to keep chatting or take a quick mental wellness check?",
        next: () => null
    }
];

// Chat Functionality
const botResponses = [
    "Thank you for sharing. I'm here to help. Can you tell me more about what's on your mind?",
    "I understand. It's important to acknowledge how you're feeling. Would you like to talk more about this?",
    "That sounds challenging. Remember, it's okay to ask for help. What would make you feel better right now?",
    "I hear you. Taking care of your mental health is so important. Have you considered reaching out to a professional?",
    "Your feelings are valid. Would you like some resources that might help?",
    "It takes courage to open up. I'm here to listen and support you.",
];

function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    
    const p = document.createElement('p');
    p.textContent = text;
    
    bubbleDiv.appendChild(p);
    messageDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    chatInput.value = '';

    // Find current question
    const currentQuestion = conversationFlow.find(q => q.id === currentQuestionId);

    // Get next question ID based on answer
    let nextQuestionId = currentQuestion?.next ? currentQuestion.next(message) : null;

    // If we got a next question, show it
    if (nextQuestionId) {
        currentQuestionId = nextQuestionId;
        const nextQuestion = conversationFlow.find(q => q.id === currentQuestionId);
        setTimeout(() => addMessage(nextQuestion.question, false), 1000);
    } else {
        // End or switch to teammate’s scoring logic
        setTimeout(() => {
            addMessage("Thanks for opening up 💬. I’ll pass this info to my analysis system to understand your well-being.", false);
        }, 1000);
    }
}


// Send message on button click
sendBtn.addEventListener('click', sendMessage);

// Send message on Enter key
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Update send button state based on input
chatInput.addEventListener('input', () => {
    sendBtn.disabled = !chatInput.value.trim();
});

// Initialize
sendBtn.disabled = true;

setTimeout(() => {
    addMessage(conversationFlow.find(q => q.id === "icebreaker1").question, false);
}, 1000);
