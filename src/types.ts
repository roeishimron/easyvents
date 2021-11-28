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

class WebElement implements Visibility {
  id: String = "";
  is_raw: boolean;

  constructor(id: String, is_raw: boolean = true) {
    this.id = id;
    this.is_raw = is_raw;
  }

  closest(type: String) {
    return new WebElement(this.as_jquery() + ".closest('" + type + "')", false);
  }

  as_jquery() {
    if (this.is_raw) {
      return "$('#" + this.id + "')";
    }
    return this.id;
  }

  visibility() {
    return this.as_jquery() + '.is(":visible")';
  }

  set_visibility(v: Visibility) {
    return (
      this.as_jquery() +
      ".each(function(){this.style.setProperty('display', {true: 'inline-block', false: 'none'}[" +
      v.visibility() +
      "], 'important')})"
    );
  }
}

class Input extends WebElement implements Value {
  constructor(id: String) {
    super(id);
  }

  val() {
    return this.as_jquery() + ".val()";
  }

  set_val(v: Value) {
    return this.as_jquery() + ".val(" + v.val() + ")";
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

enum Connector {
  and = "&&",
  or = "||",
  none = "",
}

class ConnectedCondition implements Condition {
  connector: Connector;
  lhs: Condition;

  constructor(lhs: Condition, conn: Connector = Connector.none) {
    this.lhs = lhs;
    this.connector = conn;
  }

  validation(): String {
    return this.lhs.validation() + this.connector;
  }
}

class ConnectedConditions implements Condition {
  current_conditions: Array<ConnectedCondition> =
    new Array<ConnectedCondition>();

  validation(): String {
    var res = "";
    this.current_conditions.forEach((c) => {
      res += c.validation();
    });

    return res;
  }

  add_condition(c: ConnectedCondition) {
    this.current_conditions.push(c);
  }
}

class ValueCondition implements Condition {
  input: Value;
  required_value: Value;

  constructor(input: Value, required_value: Value) {
    this.input = input;
    this.required_value = required_value;
  }

  validation() {
    return "(" + this.input.val() + "==" + this.required_value.val() + ")";
  }
}

class VisibleCondition implements Condition {
  element: Visibility;
  required_visibility: Visibility;

  constructor(element: Visibility, required_visibility: Visibility) {
    this.element = element;
    this.required_visibility = required_visibility;
  }

  validation() {
    return (
      "(" +
      this.element.visibility() +
      "==" +
      this.required_visibility.visibility() +
      ")"
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
  value_to_set: Value;

  constructor(input: Input, value_to_set: Value) {
    this.input = input;
    this.value_to_set = value_to_set;
  }

  get_action() {
    return this.input.set_val(this.value_to_set);
  }
}

class SetVisibilityAction implements Action {
  element: WebElement;
  visibility_to_set: Visibility;

  constructor(element: WebElement, visibility_to_set: Visibility) {
    this.element = element;
    this.visibility_to_set = visibility_to_set;
  }

  get_action() {
    return this.element.set_visibility(this.visibility_to_set);
  }
}

class Actions implements Action{
  actions: Array<Action> = new Array<Action>();

  add_action(a: Action){
    this.actions.push(a);
  }

  get_action(){
    var res = "";
    this.actions.forEach(a => {
      res += a.get_action() + ";\n";
    });
    return res;
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
