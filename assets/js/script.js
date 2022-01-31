var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// New code I have added begins 
// Drag and sort tasks(list-group elements) function
$(".card .list-group").sortable({
  // Enable dragging accross lists
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event, ui) {
    console.log("activate", ui);
  },
  deactivate: function(event, ui) {
    console.log("deactivate", ui);
  },
  over: function(event) {
    console.log("over", event);
  },
  out: function(event) {
    console.log("out", event);
  },
  update: function(event) {
    // array to store the task data in
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
      // Save values in temp array
      // add task data to the temp array as an object
      tempArr.push({
        text: $(this)
          .find("p")
          .text()
          .trim(),

        date: $(this)
          .find("span")
          .text()
          .trim()
        });
    });
    //console.log(tempArr);

    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
  stop: function(event) {
    $(this).removeClass("dropover");
  }
});

// Trash icon can be dragged/dropped onto
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    // Remove dragged element from the dom
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over", ui);
  },
  out: function(event, ui) {
    console.log("out", ui);
  }
});

$(".list-group").on("click", "p", function() {
  //console.log(this);

  // <textarea> revert back when it goes out of focus
  $(".list-group").on("blur", "textarea", function() {
    // Get the textarea's current value/text
    var text = $(this)
      .val()
      .trim();

    // Get the parent ul's id attribute
    var status = $(this)
      .closest(".list-group")
      .attr("id")
      .replace("list-", "");

    // Get the task's position in the list of other li elements
    var index = $(this)
      .closest(".list-group-item")
      .index();

    tasks[status][index].text = text;
    saveTasks();

    // Repcreate p element
    var taskP = $("<p>")
      .addClass("m-1")
      .text(text);

    // Replace textarea with p element
    $(this).replaceWith(taskP);
  }); 


// Due date was clicked
$(".list-group").on("click", "span", function() {
  // Get current text
  var date = $(this)
    .text()
    .trim();

  // Create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // Swap out elements
  $(this).replaceWith(dateInput);

  // Automatically focus on new element
  dateInput.trigger("focus");
});

// Value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
  // Get current text
  var date = $(this)
    .val()
    .trim();

  // Get parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // Get the task's position in the list of other li elemetns
  var index = $(this)
    .closest(".list-group-item")
    .index();

// Update task in array an re-save to localStorage
tasks[status][index].date = date;
saveTasks();

// Recreate span element with Bootstrap classes
var taskSpan = $("<span>")
  .addClass("badge badge-primary badge-pill")
  .text(date);

// Replace input with span element
$(this).replaceWith(taskSpan);
});

  // The text() method will get the inner text content of the current element, represented by $(this)
  var text = $(this)
  //console.log(text);
    .text()
    .trim();

    var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

    $(this).replaceWith(textInput)
    textInput.trigger("focus");
});
// New code I have added ends

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


