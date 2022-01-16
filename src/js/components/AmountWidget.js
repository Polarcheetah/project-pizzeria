import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element, step, decimalAccuracy, minValue, maxValue) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;

    thisWidget.step = step;
    thisWidget.decimalAccuracy = decimalAccuracy;
    thisWidget.minValue = minValue;
    thisWidget.maxValue = maxValue;

    thisWidget.getElements(element);
    //thisWidget.renderValue();
    thisWidget.initActions();
    thisWidget.setValue();
  }

  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  isValid(value) {
    const thisWidget = this;
    return (
      !isNaN(value) &&
      value >= thisWidget.minValue &&
      value <= thisWidget.maxValue
    );
  }

  parseValue(value) {
    const thisWidget = this;
    let parsedValue = 1;

    if (thisWidget.decimalAccuracy == 0) {
      parsedValue = parseInt(value);
    } else {
      parsedValue = parseFloat(value);
      console.log('parsed float', parsedValue);
    }
    return parsedValue;
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      console.log(thisWidget.value);
      if (thisWidget.value > thisWidget.minValue) {
        thisWidget.setValue(thisWidget.value - thisWidget.step);
      }
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      console.log(thisWidget.value);
      if (thisWidget.value < thisWidget.maxValue) {
        thisWidget.setValue(thisWidget.value + thisWidget.step);
      }
    });
  }
}

export default AmountWidget;
