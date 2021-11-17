// DOM elements
let header = document.querySelector("header");
let startButton = document.querySelector("#start-button");
let startBox = document.querySelector("#attempt-quiz");
let introduction = document.querySelector("#introduction");
let quizBox = document.querySelector("#quiz-box"); // quiz box containing all answer box
let submitBox = document.querySelector("#submit-quiz"); // submit box
let resultBox = document.querySelector("#try-again");
let redoButton = document.querySelector("#try-again-button");
let score = resultBox.querySelector("#score");
let scorePercent = resultBox.querySelector("#score-percent");
let scoreText = resultBox.querySelector("#score-text");

// properties
let quizLength = 0;
let quizQuestions = []; // contain all questions
let quizAnswers = {}; // contain all answers of the user
let correctAnswers = []; // contain alll correct answers
let quizId = "0"; // contain the id of the quiz
let divChoice;
let divChoiceList;
let divAnswerBox;
// const QUIZ_API = "https://wpr-quiz-api.herokuapp.com/attempts";
const QUIZ_API = "http://localhost:3000/attemps";
let SUBMIT_API;

startButton.addEventListener("click", handleStart);
submitBox.addEventListener("click", submitQuiz);
redoButton.addEventListener("click", redoQuiz);

function handleStart() {
  quizBox.style.display = "block";
  startBox.style.display = "none";
  introduction.style.display = "none";
  scrollToTop();
  fetch(QUIZ_API, {
    method: "POST",
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
      quizLength = data.questions.length;
      quizQuestions = data.questions;
      quizId = data._id;
      console.log(quizId);
      SUBMIT_API = `http://localhost:3000/attempts/${quizId}/submit`;
      // create box for each question
      quizQuestions.map((question, index) => {
        renderAnswerBox(question, index);
      });
      submitBox.style.display = "flex";
    });
}

function handleChoose(e) {
  let _answer = parseInt(e.target.getAttribute("_answer"));
  let _questionId = e.target.getAttribute("_id");
  if (e.target.className.includes("selected-answer")) {
    e.target.classList.remove("selected-answer");
    e.target.children[0].checked = false;
    delete quizAnswers[_questionId];
    return;
  }
  quizAnswers[_questionId] = _answer;
  let selectedAnswer = e.target.parentElement.querySelector(
    ".answer-box__choice.selected-answer"
  );
  if (selectedAnswer) {
    selectedAnswer.classList.remove("selected-answer");
  }
  e.target.classList.toggle("selected-answer");
  e.target.children[0].checked = true;
}

function renderAnswerBox(question, number) {
  divAnswerBox = document.createElement("div");
  divAnswerBox.className = "answer-box";
  divChoiceList = document.createElement("div");
  divChoiceList.className = "answer-box__choice-list";
  questionId = question._id;
  question.answers.map((answer, index) => {
    divChoice = document.createElement("div");
    divChoice.className = "answer-box__choice";

    // create input DOM
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "option" + (number + 1);
    input.value = answer;

    // create label DOM for answer
    const label = document.createElement("label");
    label.textContent = answer;
    label.setAttribute("for", answer);

    // append to divChoice
    divChoice.append(input, label);
    divChoice.setAttribute("_id", questionId);
    divChoice.setAttribute("_answer", index);
    divChoice.addEventListener("click", handleChoose);
    divChoiceList.appendChild(divChoice);
  });

  divAnswerBox.innerHTML = `
    <h3>Question ${number + 1} of ${quizLength}</h3>
    <div class="answer-box__questions">${question.text}</div>
  `;
  divAnswerBox.appendChild(divChoiceList);
  quizBox.appendChild(divAnswerBox);
}

function submitQuiz() {
  if (confirm("Are you sure to finish this quiz?")) {
    submitBox.style.display = "none";
    scrollToTop();
    fetch(SUBMIT_API, {
      method: "POST",
      body: JSON.stringify({ answers: { ...quizAnswers } }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        correctAnswers = data.correctAnswers;
        resultBox.style.display = "block";
        score.textContent = `${data.score}/${quizLength}`;
        scoreText.textContent = data.scoreText;
        scorePercent.textContent = `${(data.score / quizLength) * 100}%`;
        let answerBoxChoiceList = document.querySelectorAll(
          ".answer-box__choice-list"
        );
        answerBoxChoiceList.forEach((choiceList) => {
          let answerBoxList = choiceList.querySelectorAll(
            ".answer-box__choice"
          );
          answerBoxList.forEach((ele) => {
            ele.querySelector("input").disabled = true;
            ele.removeEventListener("click", handleChoose);
          });
          let questionId = choiceList.childNodes[0].getAttribute("_id");
          let correct = choiceList.childNodes[correctAnswers[questionId]];
          let userChoice = choiceList.childNodes[quizAnswers[questionId]];
          if (correctAnswers[questionId] == quizAnswers[questionId]) {
            correct.classList.add("correct-answer");
            let span = document.createElement("span");
            span.textContent = "Correct answer";
            span.classList.add("result-box");
            correct.appendChild(span);
          } else {
            correct.classList.add("default-answer");
            let span = document.createElement("span");
            span.textContent = "Correct answer";
            span.classList.add("result-box");
            correct.appendChild(span);
            if (userChoice) {
              userChoice.classList.add("wrong-answer");
              let span = document.createElement("span");
              span.textContent = "Your answer";
              span.classList.add("result-box");
              userChoice.appendChild(span);
            }
          }
        });
      });
  }
}

function redoQuiz() {
  quizBox.innerHTML = "";
  submitBox.style.display = "none";
  resultBox.style.display = "none";
  introduction.style.display = "block";
  startBox.style.display = "block";
  quizLength = 0;
  quizQuestions = [];
  quizAnswers = {};
  correctAnswers = [];
  quizId = "0";
  scrollToTop();
}

function scrollToTop() {
  header.scrollIntoView(true, {
    behavior: "smooth",
  });
}
