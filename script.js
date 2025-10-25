// =========================
// DOM ELEMENTS
// =========================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const hero = document.getElementById('hero');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');

// =========================
// MOBILE MENU
// =========================
mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
  if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
    mobileMenu.classList.remove('active');
  }
});

// =========================
// TAB NAVIGATION
// =========================
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    tabContents.forEach(tab => tab.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');

    hero.style.display = tabName === 'chat' ? 'block' : 'none';
    mobileMenu.classList.remove('active');
  });
});

// =========================
// CHAT FLOW & WELLNESS CHECK
// =========================
const conversationFlow = [
  { id: "icebreaker1", question: "Hey there! How are you feeling today?", next: (a)=>a.toLowerCase().includes("good")||a.toLowerCase().includes("fine")?"icebreaker2":"followup1" },
  { id: "icebreaker2", question: "Glad to hear that 😊! How has your week been so far?", next: ()=>"followup2" },
  { id: "followup1", question: "I’m sorry to hear that. What’s been on your mind lately?", next: ()=>"followup2" },
  { id: "followup2", question: "When you’re stressed or upset, what do you usually do to feel better?", next: (a)=>a.toLowerCase().includes("friends")?"followup3_friends":a.toLowerCase().includes("alone")?"followup3_alone":"followup3_generic" },
  { id: "followup3_friends", question: "That’s great that you have supportive friends! Do you ever feel like they influence your habits or choices?", next: ()=>"wrapup" },
  { id: "followup3_alone", question: "It sounds like you prefer handling things on your own. Does that ever get overwhelming?", next: ()=>"wrapup" },
  { id: "followup3_generic", question: "That’s one way to handle it. Has that been helping you lately?", next: ()=>"wrapup" },
  { id: "wrapup", question: "Thanks for sharing that. Would you like to keep chatting or take a quick mental wellness check?", next: ()=>null }
];

const wellnessSections = {
  "Social Isolation": [
    "Have you intentionally withdrawn from social activities or friends recently?",
    "Do you frequently feel isolated or alone, even when you are with others?",
    "Are you spending significantly more time by yourself than you used to?",
    "Have you started avoiding family gatherings or social events?"
  ],
  "Financial Issues": [
    "Have you experienced financial difficulties or debt directly related to your habit?",
    "Are you frequently running out of money because of the cost of your addiction?",
    "Do you spend money on your addiction instead of essential items like food or tuition?"
  ],
  "Physical & Mental Health": [
    "Have you noticed a decline in your overall physical health since your habit started?",
    "Are you experiencing new or worsening mental health issues like anxiety or depression?",
    "Do you often feel sick, exhausted, or unwell because of your substance use?"
  ],
  "Relationship Strain": [
    "Has your addiction caused frequent arguments or conflicts with family members or friends?",
    "Do you find yourself lying to or hiding your activities from the people you care about?",
    "Are your relationships becoming strained or damaged by your behavior?"
  ],
  "Withdrawal Symptoms": [
    "When you stop using your habit, do you experience physical discomfort or sickness?",
    "Do you get anxious or restless if you cannot engage in your habit?",
    "Do you need to use the substance just to feel 'normal'?"
  ],
  "Risk-Taking Behavior": [
    "Have you engaged in dangerous or reckless activities while under the influence?",
    "Do you take significant risks to obtain the substance or engage in your habit?",
    "Have you ever had an accident directly related to your substance use?"
  ]
};

let wellnessQuestions = [];
for(const section in wellnessSections){
  wellnessQuestions.push({section, questions: wellnessSections[section]});
}

// =========================
// STATE VARIABLES
// =========================
let currentQuestionId = "icebreaker1";
let inWellnessMode = false;
let currentWellnessSection = 0;
let currentWellnessIndex = 0;
const chatResponses = []; // store all answers for backend

// =========================
// MESSAGE DISPLAY
// =========================
function addMessage(text, isUser=false){
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser?'user-message':'bot-message'}`;
  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'message-bubble';
  const p = document.createElement('p');
  p.textContent = text;
  bubbleDiv.appendChild(p);
  messageDiv.appendChild(bubbleDiv);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// =========================
// ASYNC BACKEND CALL
// =========================
async function sendToBackend(responses){
  try{
    const response = await fetch('http://127.0.0.1:5000/analyze', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({responses})
    });
    const data = await response.json();
    addMessage(`Analysis complete: ${data.predicted_class} (${data.addiction_percent.toFixed(1)}%)`, false);
  }catch(err){
    addMessage("Error connecting to backend.", false);
    console.error(err);
  }
}

// =========================
// WELLNESS LOGIC
// =========================
function askNextWellnessQuestion(){
  const section = wellnessQuestions[currentWellnessSection];
  if(!section){
    addMessage("That’s all for now ✅ Thank you for completing the wellness check.", false);
    inWellnessMode=false;
    sendToBackend(chatResponses); // send all chat responses to backend
    return;
  }
  const question = section.questions[currentWellnessIndex];
  addMessage(`${section.section} — ${question}`, false);
}

function handleWellnessResponse(answer){
  chatResponses.push(answer); // store answer
  const section = wellnessQuestions[currentWellnessSection];
  currentWellnessIndex++;
  if(currentWellnessIndex>=section.questions.length){
    currentWellnessSection++;
    currentWellnessIndex=0;
    if(currentWellnessSection<wellnessQuestions.length){
      setTimeout(()=>{addMessage(`Let's talk about ${wellnessQuestions[currentWellnessSection].section} next.`, false);
      setTimeout(()=>askNextWellnessQuestion(),1000);},800);
    } else{
      addMessage("That was the last section ✅", false);
      inWellnessMode=false;
      sendToBackend(chatResponses);
    }
  } else{
    setTimeout(()=>askNextWellnessQuestion(),700);
  }
}

// =========================
// SEND BUTTON LOGIC
// =========================
function sendMessage(){
  const message = chatInput.value.trim();
  if(!message) return;
  addMessage(message, true);
  chatInput.value='';
  
  // Collect responses
  chatResponses.push(message);

  if(inWellnessMode){
    handleWellnessResponse(message);
    return;
  }

  const currentQuestion = conversationFlow.find(q=>q.id===currentQuestionId);
  let nextQuestionId = currentQuestion?.next ? currentQuestion.next(message) : null;

  if(currentQuestionId==="wrapup"){
    if(message.toLowerCase().includes("yes")||message.toLowerCase().includes("check")){
      inWellnessMode=true;
      setTimeout(()=>{addMessage("Alright 💬 Let’s start your quick wellness check. Answer 'Yes' or 'No'.",false);
      setTimeout(()=>askNextWellnessQuestion(),1200);},800);
      return;
    } else{
      setTimeout(()=>addMessage("No worries 💛 I’m here if you just want to talk.",false),800);
      return;
    }
  }

  if(nextQuestionId){
    currentQuestionId=nextQuestionId;
    const nextQuestion = conversationFlow.find(q=>q.id===currentQuestionId);
    setTimeout(()=>addMessage(nextQuestion.question,false),800);
  } else{
    setTimeout(()=>addMessage("Thanks for sharing 💬",false),800);
  }
}

// =========================
// EVENT LISTENERS
// =========================
sendBtn.addEventListener('click',sendMessage);
chatInput.addEventListener('keypress',e=>{if(e.key==='Enter')sendMessage();});
chatInput.addEventListener('input',()=>{sendBtn.disabled=!chatInput.value.trim();});
sendBtn.disabled=true;

// =========================
// INITIALIZE CHAT
