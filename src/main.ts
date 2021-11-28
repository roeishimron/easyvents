var trigger: Trigger;
var condition: Condition;
var action: Action;

var is_choosing = false;
var handler: Function;

function flow() {
 console.log("#we started");
 trigger_handler();
}

function finish() {
  alert("Here you go\n" + new Rule(trigger, condition, action).to_jquery());
}

$(function () {
  $(":input").each(function (i, input) {
    input.addEventListener(
      "click",
      function (event) {
        if (!is_choosing) {
          return true;
        }
        $(this).blur();
        event.stopImmediatePropagation();
        event.preventDefault();
        is_choosing = false;

        handler(new Input($(this).attr("id")));
      },
      false
    );
  });
  flow();
});
