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

  //New code I have added begins
  // Check due date
  auditTask(taskLi);
  // New code I have added ends

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
var auditTask = function(taskEl) {
  // To ensure element is getting to the function
  //console.log(taskEl);

  // Get date from task element
  var date = $(taskEl)
    .find("span")
    .text()
    .trim();
    // Ensure it worked
    console.log(date);

    // Convert to moment object at 5:00pm
    var time = moment(date, "L").set("hour", 17);
    // This should print out an object for the value of the date variable, but at 5:00pm of that date
    console.log(time);

    // Remove any old classes from element
    $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

    // Apply new class if task is near/over due date
    if (moment().isAfter(time)) {
      $(taskEl).addClass("list-group-item-danger");
    // We use moment() to get right now and use .diff() afterwards to test for a number less than +2, not a number greater than -2.
    // To do this, we've wrapped the returning value of the moment.diff() in the JavaScript Math object's .abs() method. 
    // This ensures we're getting the absolute value of that number.
    } else if (Math.abs(moment().diff(time, "days")) <= 2) {
      $(taskEl).addClass("list-group-item-warning");
    }
};

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
    // Array to store the task data in
    var tempArr = [];

    // Loop over current set of children in sortable list
    $(this).children().each(function() {
      // Save values in temp array
      // Add task data to the temp array as an object
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

    // Trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // Update array on tasks object and save
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

// Task text was clicked
$(".list-group").on("click", "p", function() {
  //console.log(this);
    // The text() method will get the inner text content of the current element, represented by $(this)
    // Get current text of p element
    var text = $(this)
    //console.log(text);
      .text()
      .trim();
  
      // Replace p element with a new textarea
      var textInput = $("<textarea>")
      .addClass("form-control")
      .val(text);
      $(this).replaceWith(textInput);
  
      // Auto focus new element
      textInput.trigger("focus");
});

  // <textarea> revert back when it goes out of focus
  $(".list-group").on("blur", "textarea", function() {
    // Get the textarea's current value/text
    var text = $(this)
      .val()
      //.trim();

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

  // Enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // When calander is closed, for a "change" event on the 'dateInput'
      $(this).trigger("change");
    }
  });

  // Automatically focus on new element
  dateInput.trigger("focus");
});

// Value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
  // Get current text
  var date = $(this)
    .val();
    //.trim();

  // Get parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // Get the task's position in the list of other li elements
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
// Pass task's <li> element into auditTask() to check new due date
auditTask ($(taskSpan).closest(".list-group-item"));
});

// Date Picker
$("#modalDueDate").datepicker({
  minDate: 1
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

// New Code I have added begins
// Load tasks for the first time
loadTasks();
