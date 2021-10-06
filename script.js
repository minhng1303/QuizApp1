// DOM elements
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
const QUIZ_API = "https://wpr-quiz-api.herokuapp.com/attempts";
let SUBMIT_API;

startButton.addEventListener("click", handleStart);
submitBox.addEventListener("click", submitQuiz);

function handleStart() {
  quizBox.style.display = "block";
  fetch(QUIZ_API, {
    method: "POST",
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      handleChoose = {};
      console.log(data);
      quizLength = data.questions.length;
      quizQuestions = data.questions;
      console.log(quizQuestions);
      quizId = data._id;
      SUBMIT_API = `https://wpr-quiz-api.herokuapp.com/attempts/${quizId}/submit`;
      // hide the Start Box and Test Introduction and display the test
      submitBox.style.display = "flex";
      startBox.style.display = "none";
      introduction.style.display = "none";

      // create box for each question
      quizQuestions.map((question, index) => {
        renderAnswerBox(question, index);
      });
    });
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
    divChoice.append(input, label);
    divChoice.setAttribute("_id", questionId);
    divChoice.setAttribute("_answer", index);

    divChoice.addEventListener("click", () =>
      handleChoose(event, question, index)
    );
    divChoiceList.appendChild(divChoice);
  });

  divAnswerBox.innerHTML = `
    <h3>Question ${number + 1} of ${quizLength}</h3>
    <div class="answer-box__questions">${question.text}</div>
  `;
  divAnswerBox.appendChild(divChoiceList);
  quizBox.appendChild(divAnswerBox);
}

function handleChoose(e, question, _answer) {
  quizAnswers[question._id] = _answer;
  if (e.target.className.includes("selected-answer")) {
    e.target.classList.remove("selected-answer");
    e.target.children[0].checked = false;
    return;
  }
  let arr = e.target.parentElement.children;
  for (let key in arr) {
    if (
      arr[key] instanceof Element &&
      arr[key].className.includes("selected-answer")
    ) {
      arr[key].classList.remove("selected-answer");
      e.target.children[0].checked = false;
    }
  }
  e.target.classList.add("selected-answer");
  e.target.children[0].checked = true;
}

function submitQuiz() {
  fetch(SUBMIT_API, {
    method: "POST",
    body: JSON.stringify(quizAnswers),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      // handleChoose = function () {};
      correctAnswers = data.correctAnswers;
      submitBox.style.display = "none";
      resultBox.style.display = "block";
      score.textContent = data.score;
      scoreText.text = data.scoreText;

      let answerBoxChoiceList = document.querySelectorAll(
        ".answer-box__choice-list"
      );
      answerBoxChoiceList.forEach((choiceList) => {
        let input = choiceList.querySelectorAll("input");
        input.forEach((ele) => (ele.disabled = true));
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

function redoQuiz() {
  // console.log("hello");
  quizBox.innerHTML = "";
  submitBox.style.display = "none";
  resultBox.style.display = "none";
  introduction.style.display = "block";
  startBox.style.display = "block";
}
redoButton.addEventListener("click", redoQuiz);
