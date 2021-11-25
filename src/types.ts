interface Value {
    val(): String;
  }
  
  interface Visibility {
    visibility();
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
  
  class LiteralVisibilty implements Visibility {
    i: boolean;
    constructor(i: boolean) {
      this.i = i;
    }
  
    visibility() {
      return this.i;
    }
  }
  
  class Input implements Value, Visibility {
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
  
    visibility() {
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
    required_visibility: Visibility;
  
    constructor(input: Input, required_visibility: Visibility) {
      this.input = input;
      this.required_visibility = required_visibility;
    }
  
    validation() {
      return (
        this.input.visibility() + "==" + this.required_visibility.visibility()
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
  
  class SetVisibilityAction implements Action {
    input: Input;
    visibility_to_set: Visibility;
  
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