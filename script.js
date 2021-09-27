const QUIZ_API = "https://wpr-quiz-api.herokuapp.com/attempts";
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
  fetch(QUIZ_API, {
    method: "POST",
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      quizLength = data.questions.length;
      quizQuestions = data.questions;

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

function renderAnswerBox(question, index) {
  divAnswerBox = document.createElement("div");
  divAnswerBox.className = "answer-box";
  divChoiceList = document.createElement("div");
  divChoiceList.className = "answer-box__choice-list";
  questionId = question._id;
  question.answers.map((answer) => {
    divChoice = document.createElement("div");
    divChoice.className = "answer-box__choice";

    // create input DOM
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "option" + (index + 1);
    input.value = answer;
    input.setAttribute("_id", questionId);
    // create label DOM for answer
    const label = document.createElement("label");
    label.textContent = answer;
    label.setAttribute("for", answer);
    divChoice.append(input, label);
    divChoiceList.appendChild(divChoice);
  });

  divAnswerBox.innerHTML = `
    <h3>Question ${index + 1} of ${quizLength}</h3>
    <div class="answer-box__questions">${question.text}</div>
  `;
  divAnswerBox.appendChild(divChoiceList);
  divAnswerBox.addEventListener("click", function () {
    handleChooseAnswer(event);
  });

  quizBox.appendChild(divAnswerBox);
}

function handleChooseAnswer(e) {
  // if choose children element
  if (e.target.children.length == 0) {
    let arr = e.target.parentElement.parentElement.children;
    // for uncheck an answer
    if (e.target.parentElement.className.includes("selected-answer")) {
      if (e.target.nodeName == "INPUT") {
        e.target.parentElement.classList.remove("selected-answer");
        e.target.checked = false;
        return;
      }
      e.target.parentElement.classList.remove("selected-answer");
      e.target.previousElementSibling.checked = false;
      return;
    }
    // for choose another answer
    if (e.target.nodeName == "LABEL") {
      e.target.previousElementSibling.checked = true;
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
    e.target.parentElement.classList.add("selected-answer");
    return;
  }
  // if choose parent element
  let arr = e.target.parentElement.children;
  // for uncheck selected answer
  if (e.target.className.includes("selected-answer")) {
    e.target.classList.remove("selected-answer");
    e.target.children[0].checked = false;
    return;
  }
  // for choosing another answer
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
