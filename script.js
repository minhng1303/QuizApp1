// DOM elements
let startButton = document.querySelector("#start-button");
let startBox = document.querySelector("#attempt-quiz");
let introduction = document.querySelector("#introduction");
let quizBox = document.querySelector("#quiz-box"); // quiz box containing all answer box
let submitBox = document.querySelector("#submit-quiz"); // submit box
let resultBox = document.querySelector("#try-again");

// properties
let quizLength = 0;
let quizQuestions = []; // contain all questions
let quizAnswers = {}; // contain all answers of the user
let quizId = "0"; // contain the id of the quiz
let divChoice;
let divChoiceList;
let divAnswerBox;
const QUIZ_API = "https://wpr-quiz-api.herokuapp.com/attempts";
let SUBMIT_API;

startButton.addEventListener("click", handleStart);
submitBox.addEventListener("click", submitQuiz);

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

let handleChoose = function (e, question, _answer) {
  quizAnswers[question._id] = _answer;
  console.log(quizAnswers);
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
};

function submitQuiz() {
  fetch(SUBMIT_API, {
    method: "POST",
    body: JSON.stringify(quizAnswers),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      handleChoose = function () {};
      submitBox.style.display = "none";
      resultBox.style.display = "block";
      let body = document.querySelectorAll("#quiz-box input");
      body.forEach((ele) => (ele.disabled = true));
      let answerBoxChoiceList = document.querySelectorAll(
        ".answer-box__choice-list"
      );
      for (let key in answerBoxChoiceList) {
        if (key % 2 == 0) {
          let span = document.createElement("span");
          span.className = "result-box";
          span.textContent = "Correct Answer";
          answerBoxChoiceList[key].firstElementChild.appendChild(span);
          answerBoxChoiceList[key].firstElementChild.classList.add(
            "correct-answer"
          );
          answerBoxChoiceList[key].firstElementChild.childNodes[0].checked =
            "true";
        } else {
          const span = document.createElement("span");
          span.className = "result-box";
          span.textContent = "Your Answer";

          const span1 = document.createElement("span");
          span1.className = "result-box";
          span1.textContent = "Correct Answer";

          answerBoxChoiceList[key].firstElementChild?.appendChild(span);
          answerBoxChoiceList[key].firstElementChild?.classList.add(
            "wrong-answer"
          );
          answerBoxChoiceList[
            key
          ].firstElementChild.firstElementChild.checked = true;
          answerBoxChoiceList[key].childNodes[1].classList.add(
            "default-answer"
          );
          answerBoxChoiceList[key].childNodes[1].appendChild(span1);
        }
      }
    });
}
