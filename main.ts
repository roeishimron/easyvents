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

console.log(rule.to_jquery());

var trigger: Trigger;
var condition: Condition;
var action: Action;

var is_choosing = false;
var handler: Function;

function flow() {
  choose_input("trigger", trigger_choose_handler);
}

function trigger_choose_handler(input: Input) {
  let name_to_type = {
    click: TriggerType.click,
    change: TriggerType.change,
  };

  trigger = new Trigger(input, prompt_dict(name_to_type));

  if (confirm("would you like to enter a val condition?")) {
    choose_input("value condition", value_condition_handler);
  } else {
    condition = new NoCondition();
    choose_input("action", action_choose_handler);
  }
}

function visibilty_condition_handler(input: Input) {
  let options = {
    visible: new LiteralVisibilty(true),
    invisible: new LiteralVisibilty(false),
    "like other": null,
  };

  let chosen = prompt_dict(options);
  if (chosen != null) {
    condition = new VisibleCondition(input, chosen);
    choose_input("action", action_choose_handler);
  } else {
    choose_input("other's visability", (i: Input) => {
      condition = new VisibleCondition(input, i);
      choose_input("action", action_choose_handler);
    });
  }
}

function value_condition_handler(input: Input) {
  call_with_chosen_value(function (v: Value) {
    condition = new ValueCondition(input, v.val());
    choose_input("action", action_choose_handler);
  });
}

function action_choose_handler(input: Input) {
  action = new SetValueAction(input, prompt("enter the new val"));

  alert("Here you go\n" + new Rule(trigger, condition, action).to_jquery());
}

function choose_input(reason: String, callback: (Input) => void) {
  alert("choose_input an input for " + reason);
  is_choosing = true;
  console.log("setting is choise to true");
  handler = callback;
}

function call_with_chosen_value(callback: (Value) => void) {
  let type_to_value = {
    input: function (clbck) {
      choose_input("getting value from that input", clbck);
    },
    literal: function (clbck) {
      clbck(new StringValue(prompt("enter value")));
    },
  };

  let choise = prompt(
    "choose_input one of: " + Object.keys(type_to_value).join(", "),
    Object.keys(type_to_value)[0]
  );

  prompt_dict(type_to_value)(callback);
}

function prompt_dict(dict, default_index = 0) {
  return dict[
    prompt(
      "Choose trigger type. Options are:" + Object.keys(dict).join(", "),
      Object.keys(dict)[default_index]
    )
  ];
}

$(function () {
  $(":input").each(function (i, input) {
    input.addEventListener(
      "click",
      function (event) {
        if (!is_choosing) {
          console.log("returning, no choose_input");
          return true;
        }
        $(this).blur();
        event.stopImmediatePropagation();
        event.preventDefault();
        is_choosing = false;
        console.log("setting is choise to false");

        handler(new Input($(this).attr("id")));
      },
      false
    );
  });
  flow();
});
