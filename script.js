const QUIZ = {
  API: "https://wpr-quiz-api.herokuapp.com/attempts",
};
Object.freeze(QUIZ);

let quizLength = 0;
let startButton = document.querySelector("#start-button");
let startBox = document.querySelector("#attempt-quiz");
let introduction = document.querySelector("#introduction");
let quizBox = document.querySelector("#quiz-box");
let submitBox = document.querySelector("#submit-quiz");
let quizQuestions = [];
let divChoice;
let divChoiceList;
let divAnswerBox;
startButton.addEventListener("click", handleStart);

function handleStart() {
  fetch(QUIZ.API, {
    method: "POST",
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      quizLength = data.questions.length;
      quizQuestions = data.questions;
      submitBox.style.display = "flex";
      // hide the Start Box and Test Introduction
      startBox.style.display = "none";
      introduction.style.display = "none";
      // create box for each question
      quizQuestions.map((question, index) => {
        renderAnswerBox(question, index);
      });
    });
}

function renderAnswerBox(question, index) {
  divAnswerBox = document.createElement("div");
  divAnswerBox.className = "answer-box";
  divChoiceList = document.createElement("div");
  divChoiceList.className = "answer-box__choice-list";

  question.answers.map((answer) => {
    divChoice = document.createElement("div");
    divChoice.className = "answer-box__choice";
    // create input DOM
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "option" + (index + 1);
    input.value = answer;
    input.addEventListener("click", () => handleChooseAnswer(event));
    // create span DOM for answer
    const span = document.createElement("span");
    span.textContent = answer;
    divChoice.append(input, span);
    divChoiceList.appendChild(divChoice);
  });
  divAnswerBox.innerHTML = `
    <h3>Question ${index + 1} of ${quizLength}</h3>
    <div class="answer-box__questions">${question.text}</div>
  `;
  divAnswerBox.appendChild(divChoiceList);
  quizBox.appendChild(divAnswerBox);
}

function handleChooseAnswer(e) {
  let arr = e.target.parentElement.parentElement.children;
  if (e.target.parentElement.className.includes("selected-answer")) {
    e.target.parentElement.classList.remove("selected-answer");
    e.target.checked = false;
    return;
  }
  for (let key in arr) {
    if (
      arr[key] instanceof Element &&
      arr[key].className.includes("selected-answer")
    ) {
      arr[key].classList.remove("selected-answer");
    } else {
      e.target.parentElement.classList.add("selected-answer");
    }
  }
}
