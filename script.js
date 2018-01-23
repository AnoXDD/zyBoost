/**
 * Created by Anoxic
 */

async function timeoutPromise(func, timeout = 300) {
  return new Promise(res => {
    setTimeout(() => {
      func();
      res();
    }, timeout);
  });
}

function doMultipleChoice() {
  return new Promise(res => {
    $(`input[type="radio"]`).click();

    res();
  });
}

function doShortAnswer() {
  return new Promise(res => {
    // Show the answer
    $(".show-answer-button").click().click();

    $(".question-set-question.short-answer-question").each(
      (i, el) => {
        el = $(el);

        // Find answer and fill in
        let $textarea = el.find("textarea");
        $textarea.val(el.find(".forfeit-answer").text().trim());
        $textarea.change();

        el.find(".check-button").click();
      });

    res();
  });
}

function doAnimation() {
  return Promise.all($(".animation-controls").map((i, el) =>
    new Promise(res => {
      el = $(el);

      // Make it faster
      let $checkbox = el.find(`input[type="checkbox"]`);
      $checkbox.prop("checked", true);

      // Start it
      if (!el.find(".start-button").length) {
        res();
      }

      el.find(".start-button").click();

      // Modify play button change
      let clk = () => {
        el.find(".play-button").click();

        if (el.find(".step").length === el.find(".been-watched").length) {
          // All of them has been watched
          el.off("DOMSubtreeModified", clk);
          res();
        }
      };

      el.on("DOMSubtreeModified", clk);
    })
  ));
}


/**
 * Triggers drag and drop event
 *
 * Copied and modified from
 * https://ghostinspector.com/blog/simulate-drag-and-drop-javascript-casperjs/
 * https://github.com/kemokid/scripting-sortable/blob/master/script_sortable_dnd_more_general.js
 *
 * @param $elemDrag
 * @param $elemDrop
 * @return {boolean}
 */
function triggerDragAndDrop($elemDrag, $elemDrop) {
  let data = {};

  function createNewDataTransfer() {
    return {
      clearData   : function(key) {
        if (key === undefined) {
          data = {};
        } else {
          delete data[key];
        }
      },
      getData     : function(key) {
        return data[key];
      },
      setData     : function(key, value) {
        data[key] = value;
      },
      setDragImage: function() {
      },
      dropEffect  : 'none',
      files       : [],
      items       : [],
      types       : [],
      // also effectAllowed
    }
  }

  // function for triggering mouse events
  var fireMouseEvent = function(type, elem, centerX, centerY) {
    // var evt = document.createEvent('MouseEvents');
    // event.initMouseEvent(type, canBubble, cancelable, view,
    //   detail, screenX, screenY, clientX, clientY,
    //   ctrlKey, altKey, shiftKey, metaKey,
    //   button, relatedTarget);

    let evt = new MouseEvent(type, {
      bubbles      : true,
      cancelable   : true,
      view         : window,
      detail       : 1,
      screenX      : 1,
      screenY      : 1,
      clientX      : centerX,
      clientY      : centerY,
      button       : 0,
      relatedTarget: elem,
    });

    // evt.initMouseEvent(type, true, true, window, 1, 1, 1, centerX, centerY,
    // false, false, false, false, 0, elem);

    if (/^dr/i.test(type)) {
      evt.dataTransfer = evt.dataTransfer || createNewDataTransfer();
    }

    elem.dispatchEvent(evt);

    return evt;
  };

  // fetch target elements

  // calculate positions
  var pos = $elemDrag.getBoundingClientRect();
  var center1X = Math.floor((pos.left + pos.right) / 2);
  var center1Y = Math.floor((pos.top + pos.bottom) / 2);
  pos = $elemDrop.getBoundingClientRect();
  var center2X = Math.floor((pos.left + pos.right) / 2);
  var center2Y = Math.floor((pos.top + pos.bottom) / 2);

  // mouse over dragged element and mousedown
  fireMouseEvent('mousemove', $elemDrag, center1X, center1Y);
  fireMouseEvent('mouseenter', $elemDrag, center1X, center1Y);
  fireMouseEvent('mouseover', $elemDrag, center1X, center1Y);
  fireMouseEvent('mousedown', $elemDrag, center1X, center1Y);

  // start dragging process over to drop target
  fireMouseEvent('dragstart', $elemDrag, center1X, center1Y);
  fireMouseEvent('drag', $elemDrag, center1X, center1Y);
  fireMouseEvent('mousemove', $elemDrag, center1X, center1Y);
  fireMouseEvent('drag', $elemDrag, center2X, center2Y);
  fireMouseEvent('mousemove', $elemDrop, center2X, center2Y);

  // trigger dragging process on top of drop target
  fireMouseEvent('mouseenter', $elemDrop, center2X, center2Y);
  fireMouseEvent('dragenter', $elemDrop, center2X, center2Y);
  fireMouseEvent('mouseover', $elemDrop, center2X, center2Y);
  fireMouseEvent('dragover', $elemDrop, center2X, center2Y);

  // release dragged element on top of drop target
  fireMouseEvent('drop', $elemDrop, center2X, center2Y);
  fireMouseEvent('dragend', $elemDrag, center2X, center2Y);
  fireMouseEvent('mouseup', $elemDrag, center2X, center2Y);
}

function doDefinitionMatch() {
  return Promise.all($(".definition-match-payload").map((i, el) =>
    new Promise(async function(res) {
      el = $(el);

      // Remove the first one as it's the waiting area for those definitions
      let droppables = el.find(".draggable-object-target").slice(1);
      let $reset = el.find(".reset-button");

      // Reset it anyways
      $reset.click();

      // Find the correct definition for each concept
      for (let i = 0; i < droppables.length; ++i) {
        let droppable = droppables[i];

        // Only find concepts that has not been paired with any definition
        let draggables = el.find(".term-bank .draggable-object");

        for (let draggable of draggables) {
          await timeoutPromise(() => {
            triggerDragAndDrop($(draggable)[0], $(droppable)[0]);
          });

          await timeoutPromise(() => {
            // Doing nothing, just waiting for DOM to propagate
          });

          if (el.find(".correct").length > i) {
            break;
          }
        }
      }

      res();
    })
  ));
}

function injectButton() {
  /**
   * Adding rule to the css style sheet, copied from
   * http://tobiasahlin.com/spinkit/
   */
  function addCssRules() {
    var style = document.createElement('style');
    style.type = 'text/css';
    let rule = `
@keyframes sk-bounce {
  0%, 100% {
    transform: scale(0);
    -webkit-transform: scale(0); }
  50% {
    transform: scale(1);
    -webkit-transform: scale(1); } }
@keyframes blink {
  0%, 100% {
    opacity: 1; }
  50% {
    opacity: 0; } }
.spinner {
  margin: 0;
  position: fixed;
  width: 56px;
  height: 56px;
  right: 40px;
  bottom: 60px;
  border-radius: 40px;
  text-align: center;
  line-height: 56px;
  background: #f57c00;
  color: white;
  font-size: 25px;
  border: #f57c00 1px solid;
  cursor: pointer;
  box-shadow: 0px 3px 4px #bbb; }
  .spinner .loading {
    color: transparent;
    pointer-events: none;
    cursor: not-allowed; }
    .spinner .loading .double-bounce1, .spinner .loading .double-bounce2 {
      visibility: visible; }

.double-bounce1, .double-bounce2 {
  visibility: hidden;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: white;
  opacity: .6;
  position: absolute;
  top: 0;
  left: 0;
  -webkit-animation: sk-bounce 2s infinite ease-in-out;
  animation: sk-bounce 2s infinite ease-in-out; }

.double-bounce2 {
  -webkit-animation-delay: -1s;
  animation-delay: -1s; }

#zyboost-task {
  position: fixed;
  background: white;
  right: 40px;
  bottom: 120px;
  box-shadow: 2px 2px 10px #bbb;
  padding: 20px;
  z-index: 9999999; }
  #zyboost-task .loading {
    animation: blink 2s infinite ease; }
    #zyboost-task .loading:after {
      content: "..."; }
`;
    style.innerHTML = rule;
    document.getElementsByTagName('head')[0].appendChild(style);
  }

  function addButton() {
    let $button = $(`
<div id="zyboost-button" href="void(0);" class="spinner">  
    <div class="double-bounce1"></div>
    <div class="double-bounce2"></div>
    ✓
</div>
`);
    $button.click(handleButtonClick);
    $("body").append($button);
  }

  addCssRules();
  addButton();
}

function handleButtonClick() {
  $("#zyboost-button").addClass("loading");

  const tasks = [
    {
      promise: doMultipleChoice,
      id     : "multiple-choice",
      text   : "Multiple choice",
    }, {
      promise: doShortAnswer,
      id     : "short-answer",
      text   : "Short answer",
    }, {
      promise: doAnimation,
      id     : "animation",
      text   : "Animation",
    }, {
      promise: doDefinitionMatch,
      id     : "definition-match",
      text   : "Definition match",
    }
  ];

  let $task = tasks.map(
    task => `<p class="loading" id="${task.id}">${task.text}</p>`);
  $task = $(`<div id="zyboost-task">${$task.join("")}</div>`);

  $task.hide().appendTo("body").fadeIn(400);

  let promises = tasks.map(task => {
    return task.promise().then(() => {
      $(`#${task.id}`).removeClass("loading").addClass("success");
    }).catch(e => {
      console.error(e);
      $(`#${task.id}`).removeClass("loading").addClass("error");
    });
  });

  Promise.all(promises).then(() => {
    $("#zyboost-button").removeClass("loading");

    $task.click(() => {
      $task.fadeOut(300, () => $task.remove());
    });
  });
}

$(document).ready(() => {
  injectButton();
});