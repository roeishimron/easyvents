interface Value {
  val(): String;
}

interface IsVisible {
  is_visible();
}

class StringValue implements Value {
  s: String;
  constructor(s: String) {
    this.s = s;
  }

  val() {
    return "'" + this.s + "'";
  }
}

class LiteralVisibilty implements IsVisible {
  i: boolean;
  constructor(i: boolean) {
    this.i = i;
  }

  is_visible() {
    return this.i;
  }
}

class Input implements Value, IsVisible {
  id: String = "";

  constructor(id: String) {
    this.id = id;
  }

  closest(type: String) {
    return this.as_jquery() + "closest(" + type + ")";
  }

  as_jquery() {
    return "$('#" + this.id + "')";
  }

  val() {
    return this.as_jquery() + ".val()";
  }

  set_val(v: String) {
    return this.as_jquery() + ".val('" + v + "')";
  }

  is_visible() {
    return this.as_jquery() + '.is(":visible")';
  }

  from_user_hover() {
    this.id = document.querySelectorAll(":hover")[0].id;
  }
}

enum TriggerType {
  click,
  change,
}

class Trigger {
  input: Input;
  trigger: TriggerType;

  constructor(input: Input, trigger: TriggerType) {
    this.input = input;
    this.trigger = trigger;
  }

  create_handeled_trigger(handler: String) {
    return (
      this.input.as_jquery() +
      "." +
      TriggerType[this.trigger] +
      "(" +
      handler +
      ")"
    );
  }
}

interface Condition {
  validation(): String;
}

class ValueCondition implements Condition {
  input: Input;
  required_value: String;

  constructor(input: Input, required_value: String) {
    this.input = input;
    this.required_value = required_value;
  }

  validation() {
    return this.input.val() + "==" + this.required_value;
  }
}

class VisibleCondition implements Condition {
  input: Input;
  required_visibility: IsVisible;

  constructor(input: Input, required_visibility: IsVisible) {
    this.input = input;
    this.required_visibility = required_visibility;
  }

  validation() {
    return (
      this.input.is_visible() + "==" + this.required_visibility.is_visible()
    );
  }
}

class NoCondition implements Condition {
  validation() {
    return "true";
  }
}

interface Action {
  get_action(): String;
}

class SetValueAction implements Action {
  input: Input;
  value_to_set: String;

  constructor(input: Input, value_to_set: String) {
    this.input = input;
    this.value_to_set = value_to_set;
  }

  get_action() {
    return this.input.set_val(this.value_to_set);
  }
}

class Rule {
  trigger: Trigger;
  condition: Condition;
  action: Action;

  constructor(trigger: Trigger, condition: Condition, action: Action) {
    this.trigger = trigger;
    this.condition = condition;
    this.action = action;
  }

  to_jquery() {
    let handler =
      "function() {if(" +
      this.condition.validation() +
      "){" +
      this.action.get_action() +
      "}}";

    return this.trigger.create_handeled_trigger(handler);
  }
}

var rule = new Rule(
  new Trigger(new Input("input_id"), TriggerType.change),
  new ValueCondition(new Input("required_value"), "RRR"),
  new SetValueAction(new Input("result_input"), "newval")
);

var trigger: Trigger;
var condition: Condition;
var action: Action;

var is_choosing = false;
var handler: Function;

function flow() {
  console.log("#we started");
  choose_input("trigger", trigger_choose_handler);
}

function trigger_choose_handler(input: Input) {
  let name_to_type = {
    click: TriggerType.click,
    change: TriggerType.change,
  };

  trigger = new Trigger(
    input,
    prompt_dict("What kind of trigger?", name_to_type)
  );

  if (confirm("would you like to enter a condition?")) {
    condition_handler();
  } else {
    condition = new NoCondition();
    choose_input("action", action_handler);
  }
}

function condition_handler() {
  let options = {
    value: value_condition_handler,
    visibility: visibilty_condition_handler,
  };

  let handler : (Input) => void = prompt_dict("Choose the type of condition", options);
  console.log(handler);

  choose_input("condition", handler);
}

function visibilty_condition_handler(input: Input) {
  let options = {
    visible: new LiteralVisibilty(true),
    invisible: new LiteralVisibilty(false),
    "like other": null,
  };

  let chosen = prompt_dict("What visibility to compare to?", options);
  if (chosen != null) {
    condition = new VisibleCondition(input, chosen);
    choose_input("action", action_handler);
  } else {
    choose_input("other's visability", (i: Input) => {
      condition = new VisibleCondition(input, i);
      choose_input("action", action_handler);
    });
  }
}

function value_condition_handler(input: Input) {
  call_with_chosen_value(function (v: Value) {
    condition = new ValueCondition(input, v.val());
    choose_input("action", action_handler);
  });
}

function action_handler(input: Input) {
  action = new SetValueAction(input, prompt("enter the new val"));

  alert("Here you go\n" + new Rule(trigger, condition, action).to_jquery());
}

function choose_input(reason: String, callback: (Input) => void) {
  alert("choose an input for " + reason);
  is_choosing = true;
  handler = (i: Input) => {
    console.log("asked to choose an input for " + reason, " chosen " + i.id);
    callback(i);
  };
}

function call_with_chosen_value(callback: (Value) => void) {
  let type_to_value = {
    literal: function (clbck: (Input) => void) {
      clbck(new StringValue(prompt("enter value")));
    },
    input: function (clbck: (Input) => void) {
      choose_input("getting value from that input", clbck);
    },
  };

  prompt_dict("Choose value type.", type_to_value)(callback);
}

function prompt_dict(message, dict, default_index = 0) {
  let chosen = "__NO_SUCH_vALUE_EVER__";

  while (!Object.keys(dict).includes(chosen)){
    chosen = prompt(
      message + " options are: " + Object.keys(dict).join(", "),
      Object.keys(dict)[default_index]
    );
  }

  console.log("asked for " + message, ", chosen " + chosen);

  return dict[chosen];
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
