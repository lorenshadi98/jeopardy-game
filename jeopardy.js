// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

function getCategoryIds() {
  const randNums = [];
  for (let i = 0; i < NUM_CATEGORIES; i++) {
    let newRandomNum = Math.floor(Math.random() * 15000);
    randNums.push(newRandomNum);
  }
  return randNums;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const categoryRes = await axios.get('http://jservice.io/api/category', {
    params: { id: catId }
  });
  const clues_array = [];
  for (const clue of categoryRes.data.clues) {
    clues_array.push({
      question: clue.question,
      answer: clue.answer,
      showing: 0
    });
  }
  const categoryInfo = { title: categoryRes.data.title, clues: clues_array };
  return categoryInfo;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  // Creating table header and populating the category titles
  $('#jeopardy thead').empty();
  const $tableHeader = $(`<tr></tr>`);
  for (let category of categories) {
    $tableHeader.append(`<td>${category.title}</td>`);
  }
  $('#jeopardy thead').append($tableHeader);

  // handling table body data
  $('#jeopardy tbody').empty();
  // Creating question mark placeholders
  for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
    let $tr = $('<tr>');
    for (let j = 0; j < NUM_CATEGORIES; j++) {
      let $tableData = $(`<td>?</td>`).attr('id', `${j}-${i}`);
      $tr.append($tableData);
    }
    $('#jeopardy tbody').append($tr);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  // capture the evt.target id attribute and then show the clue and question relating to that clicked td.
  let id = evt.target.id;
  let [catId, clueId] = id.split('-');
  let clue = categories[catId].clues[clueId];
  let msg;

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = 'question';
  } else if (clue.showing === 'question') {
    msg = clue.answer;
    clue.showing = 'answer';
  } else {
    return;
  }
  // Update text of cell
  $(`#${catId}-${clueId}`).html(msg);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
function showLoadingView() {
  $('#jeopardy').hide();
  $('#loader').show();
  $('#gameBtn').text('Loading...');
  setTimeout(function () {
    setupAndStart();
  }, 1200);
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $('#loader').hide();
  $('#gameBtn').text('Restart!');
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  $('#jeopardy').show();
  const categoryIDs = await getCategoryIds(); // returns array of category ids
  categories = [];
  for (const id of categoryIDs) {
    const categoryToFill = await getCategory(id);
    categories.push(categoryToFill);
  }
  fillTable();
}
/** On page load, add event handler for clicking clues */
$('#jeopardy tbody').on('click', 'td', handleClick);

/** On click of start / restart button, set up game. */
$('#gameBtn').on('click', function () {
  showLoadingView();
  setTimeout(function () {
    hideLoadingView();
  }, 1500);
});
